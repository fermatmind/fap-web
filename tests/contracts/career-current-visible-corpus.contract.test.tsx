import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

// Integration input is the real backend CanonicalReader output, never authored frontend copy.
// Run with CAREER_CURRENT_DIRECTORY=<resolved-Current-pages>.
const directory = process.env.CAREER_CURRENT_DIRECTORY;
const pages = directory ? readdirSync(directory).flatMap((slug) => {
  const content = JSON.parse(readFileSync(join(directory, slug, "zh-CN.json"), "utf8"));
  return content.content_state === "enhanced" ? [{ slug, content }] : [];
}) : [];

function readerText(data: Record<string, unknown>): string[] {
  if (Array.isArray(data.paragraphs)) return data.paragraphs as string[];
  if (Array.isArray(data.rows)) return (data.rows as string[][]).flat();
  if (!Array.isArray(data.entries)) return [];
  return data.entries.flatMap((entry) => {
    if (typeof entry === "string") return [entry];
    if (Array.isArray(entry.values)) return entry.values;
    if (typeof entry.answer === "string") return [entry.answer];
    if (typeof entry.entity === "string") return [entry.entity];
    if (typeof entry.value === "string") return [entry.value];
    return [];
  });
}

describe.skipIf(!directory)("Current Chinese corpus visible body", () => {
  it("loads the complete selected production cohort", () => {
    expect(pages).toHaveLength(144);
  });
  it.each(pages)("renders every public item from $slug without legacy body substitution", ({ slug, content }) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({ slug, locale: "zh", titleZh: content.subject.name, titleEn: slug, presentationV2: "enhanced" });
    const surface = adaptCareerDisplaySurface({ ...fixture, content_v3: content }, "zh");
    expect(surface?.contentV3?.sourceContentSha256).toBe(content.source_content_sha256);
    const html = renderToStaticMarkup(<CareerDisplaySurface surface={surface} />);
    const dom = new DOMParser().parseFromString(html, "text/html");
    for (const details of dom.querySelectorAll("details")) details.open = true;
    expect(dom.querySelector("h1")?.textContent).toBe(content.subject.name);
    if (content.subject.summary) expect(dom.body.textContent).toContain(content.subject.summary);
    const normalize = (s: string) => s.replace(/\s+/gu, " ").trim();
    const plan = surface!.dossierRenderPlan;
    expect(plan?.source).toBe("content_v3");
    if (plan?.source !== "content_v3") throw new Error("Missing Current render plan");
    for (const block of plan.blocks) {
      if (!block.visibleInToc) continue;
      const section = dom.querySelector(`[data-content-block-id="${block.id}"]`);
      expect(section, `${slug}: missing block ${block.id}`).not.toBeNull();
      for (const item of block.items) {
        if (item.availability !== "available") continue;
        const element = dom.querySelector(`[data-content-item-id="${item.id}"]`);
        expect(element, `${slug}: missing item ${item.id}`).not.toBeNull();
        expect(element?.closest('[hidden], [aria-hidden="true"], .hidden, .sr-only')).toBeNull();
        for (const text of readerText(item.data)) {
          expect(normalize(element!.textContent ?? ""), `${slug}/${item.id}`).toContain(normalize(text));
        }
      }
    }
  });
});
