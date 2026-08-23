import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
// @ts-expect-error jsdom is a transitive Vitest runtime dependency without declarations in this repository.
import { JSDOM } from "jsdom";
import { expect, test } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { CAREER_DISPLAY_COMPONENT_ORDER, adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { CAREER_VISUAL_GROUP_IDS } from "@/lib/career/careerVisualGroups";

const API_ORIGIN = process.env.CAREER_V12_API_ORIGIN ?? "https://api.fermatmind.com/api";
const EVIDENCE_DIR = process.env.CAREER_V12_EVIDENCE_DIR ??
  "/Users/rainie/Desktop/1046个职业/c3.3m-v2-phase-b-evidence";
const CONCURRENCY = Math.min(Math.max(Number(process.env.CAREER_V12_CONCURRENCY ?? "5"), 1), 5);

type Failure = { slug: string; reason: string; detail?: string };

function record(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function strings(value: unknown): string[] {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value === null || String(value).trim().length === 0 ? [] : [String(value)];
  }
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(strings);
  return [];
}

function matches(html: string, pattern: RegExp): string[] {
  return [...html.matchAll(pattern)].map((match) => match[1] ?? "");
}

function isDeclaredDuplicate(field: string): boolean {
  return /^presentation_v1\.hero\.badges\[\d+\]\.text$/u.test(field) ||
    field === "presentation_v1.hero.ai_exposure.note";
}

async function fetchJson(url: string): Promise<{ status: number; body: unknown }> {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { status: response.status, body };
}

async function runAudit() {
const index = await fetchJson(`${API_ORIGIN}/v0.5/career/jobs?locale=zh-CN&org_id=0`);
if (index.status !== 200) throw new Error(`career index returned ${index.status}`);
const slugs = Array.isArray(record(index.body).items)
  ? (record(index.body).items as unknown[]).map((item) => record(record(item).identity).canonical_slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0)
  : [];
if (slugs.length !== 1046 || new Set(slugs).size !== 1046) {
  throw new Error(`expected 1046 unique slugs, received ${slugs.length}/${new Set(slugs).size}`);
}

const failures: Failure[] = [];
const optionalMissing = { onetCode: 0, blsStats: 0, aiExposure: 0, badges: 0, cta: 0 };
let nextIndex = 0;
let apiPass = 0;
let frontendPass = 0;
let soft404 = 0;
let scalarMismatch = 0;
let arrayMismatch = 0;
let accidentalDuplicate = 0;
let emptyCards = 0;

async function auditSlug(slug: string) {
  const detail = await fetchJson(`${API_ORIGIN}/v0.5/career/jobs/${encodeURIComponent(slug)}?locale=zh-CN`);
  if (detail.status !== 200) {
    failures.push({ slug, reason: "api_http", detail: String(detail.status) });
    return;
  }
  apiPass += 1;
  const root = record(record(detail.body).display_surface_v1);
  if (Object.keys(root).length === 0) {
    soft404 += 1;
    failures.push({ slug, reason: "soft_404" });
    return;
  }
  const surface = adaptCareerDisplaySurface(detail.body, "zh", undefined, slug);
  if (!surface?.publishedComponents || !surface.presentationV1) {
    failures.push({ slug, reason: "frontend_adapter" });
    return;
  }

  if (!surface.presentationV1.hero.onetCode) optionalMissing.onetCode += 1;
  if (surface.presentationV1.hero.stats.length < 5) optionalMissing.blsStats += 1;
  if (!surface.presentationV1.hero.aiExposure) optionalMissing.aiExposure += 1;
  if (surface.presentationV1.hero.badges.length < 3) optionalMissing.badges += 1;
  if (!surface.presentationV1.hero.cta) optionalMissing.cta += 1;

  const html = renderToStaticMarkup(
    <CareerDisplaySurface surface={surface} rendererRelease="career-v12-phase-b-live-audit" />
  );
  const componentMarkers = matches(html, /data-career-component-id="([^"]+)"/gu);
  const visualGroups = matches(html, /data-career-visual-group="([^"]+)"/gu);
  const apiComponents = matches(html, /data-career-api-component="([^"]+)"/gu);
  if (
    componentMarkers.length !== 26 ||
    new Set(componentMarkers).size !== 26 ||
    apiComponents.length !== 26 ||
    new Set(apiComponents).size !== 26 ||
    componentMarkers.some((component) => !CAREER_DISPLAY_COMPONENT_ORDER.includes(component as never))
  ) {
    failures.push({ slug, reason: "component_markers", detail: `${componentMarkers.length}/${apiComponents.length}` });
    return;
  }
  if (
    visualGroups.length !== 12 ||
    visualGroups.some((group, index) => group !== CAREER_VISUAL_GROUP_IDS[index])
  ) {
    failures.push({ slug, reason: "visual_group_markers", detail: visualGroups.join(",") });
    return;
  }

  const document = new JSDOM(html).window.document;
  const attributeValues = [...document.querySelectorAll("*")]
    .flatMap((element) => [...element.attributes].map((attribute) => attribute.value));
  const domProjection = [document.body.textContent ?? "", ...attributeValues].join("\n");
  const page = record(record(root.page).content);
  const expectedScalars = CAREER_DISPLAY_COMPONENT_ORDER.flatMap((componentId) => strings(page[componentId]));
  const missingScalars = expectedScalars.filter((value) => !domProjection.includes(value));
  if (missingScalars.length > 0) {
    scalarMismatch += missingScalars.length;
    failures.push({ slug, reason: "scalar_mismatch", detail: missingScalars.slice(0, 3).join(" | ") });
    return;
  }

  const expectedArrays = {
    responsibilities: Array.isArray(page.responsibilities_block) ? page.responsibilities_block.length : 0,
    faq: Array.isArray(record(page.faq_block).items) ? (record(page.faq_block).items as unknown[]).length : 0,
    related: Array.isArray(record(page.related_next_pages).links) ? (record(page.related_next_pages).links as unknown[]).length : 0,
    sources: Array.isArray(record(root.sources).references)
      ? (record(root.sources).references as unknown[]).length
      : Object.keys(record(root.sources)).length,
  };
  const actualArrays = {
    responsibilities: document.querySelectorAll('[data-career-api-list="responsibilities_block"] > li').length,
    faq: document.querySelectorAll("#career-component-faq_block details").length,
    related: document.querySelectorAll("#career-component-related_next_pages [data-related-career-slug]").length,
    sources: document.querySelectorAll('[data-testid="source-list"] > li').length,
  };
  if (Object.keys(expectedArrays).some((key) => expectedArrays[key as keyof typeof expectedArrays] !== actualArrays[key as keyof typeof actualArrays])) {
    arrayMismatch += 1;
    failures.push({ slug, reason: "array_mismatch", detail: JSON.stringify({ expectedArrays, actualArrays }) });
    return;
  }

  const fieldCounts = [...document.querySelectorAll("[data-career-api-field]")].reduce<Record<string, number>>((counts, element) => {
    const field = element.getAttribute("data-career-api-field") ?? "";
    counts[field] = (counts[field] ?? 0) + 1;
    return counts;
  }, {});
  const duplicates = Object.entries(fieldCounts).filter(([field, count]) => count > 1 && !isDeclaredDuplicate(field));
  if (duplicates.length > 0) {
    accidentalDuplicate += duplicates.length;
    failures.push({ slug, reason: "accidental_duplicate", detail: duplicates.slice(0, 3).map(([field]) => field).join(",") });
    return;
  }

  const empty = [...document.querySelectorAll("section[data-career-api-component]")]
    .filter((element) => (element.textContent ?? "").trim().length === 0);
  if (empty.length > 0) {
    emptyCards += empty.length;
    failures.push({ slug, reason: "empty_card", detail: empty.map((element) => element.getAttribute("data-career-api-component")).join(",") });
    return;
  }

  frontendPass += 1;
}

async function worker() {
  while (true) {
    const index = nextIndex++;
    const slug = slugs[index];
    if (!slug) return;
    try {
      await auditSlug(slug);
    } catch (error) {
      failures.push({ slug, reason: "exception", detail: error instanceof Error ? error.message : String(error) });
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const report = {
  schemaVersion: "career.v12.phase-b.live-projection-audit.v1",
  apiOrigin: API_ORIGIN,
  concurrency: CONCURRENCY,
  total: slugs.length,
  apiPass,
  frontendPass,
  soft404,
  missingRequiredFields: failures.filter((failure) => failure.reason === "frontend_adapter").length,
  scalarMismatch,
  arrayMismatch,
  accidentalDuplicate,
  emptyCards,
  optionalMissing,
  failureCount: failures.length,
  failures: failures.slice(0, 50),
};

await mkdir(EVIDENCE_DIR, { recursive: true });
await writeFile(path.join(EVIDENCE_DIR, "live-projection-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
return report;
}

test.skipIf(process.env.CAREER_V12_LIVE_AUDIT !== "1")(
  "audits all 1046 live Chinese presentation projections",
  async () => {
  const report = await runAudit();
  expect(report).toMatchObject({
    total: 1046,
    apiPass: 1046,
    frontendPass: 1046,
    soft404: 0,
    missingRequiredFields: 0,
    scalarMismatch: 0,
    arrayMismatch: 0,
    accidentalDuplicate: 0,
    emptyCards: 0,
    failureCount: 0,
  });
  },
  180_000
);
