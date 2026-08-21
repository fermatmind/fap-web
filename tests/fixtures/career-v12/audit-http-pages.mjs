import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const apiOrigin = process.env.CAREER_V12_API_ORIGIN ?? "https://api.fermatmind.com/api";
const frontendOrigin = process.env.CAREER_V12_FRONTEND_ORIGIN ?? "http://127.0.0.1:3200";
const evidenceDir = process.env.CAREER_V12_EVIDENCE_DIR ??
  "/Users/rainie/Desktop/1046个职业/c3.3m-v2-phase-b-evidence";
const concurrency = Math.min(Math.max(Number(process.env.CAREER_V12_CONCURRENCY ?? "5"), 1), 5);

function uniqueMatches(html, expression) {
  const values = [...html.matchAll(expression)].map((match) => match[1]);
  return { count: values.length, unique: new Set(values).size, values };
}

const indexResponse = await fetch(`${apiOrigin}/v0.5/career/jobs?locale=zh-CN&org_id=0`, {
  headers: { accept: "application/json" },
});
if (!indexResponse.ok) throw new Error(`career index returned ${indexResponse.status}`);
const index = await indexResponse.json();
const slugs = Array.isArray(index.items)
  ? index.items.map((item) => item?.identity?.canonical_slug).filter((slug) => typeof slug === "string" && slug.length > 0)
  : [];
if (slugs.length !== 1046 || new Set(slugs).size !== 1046) {
  throw new Error(`expected 1046 unique slugs, received ${slugs.length}/${new Set(slugs).size}`);
}

let cursor = 0;
let http200 = 0;
let frontendPass = 0;
let soft404 = 0;
const failures = [];

async function audit(slug) {
  const response = await fetch(`${frontendOrigin}/zh/career/jobs/${encodeURIComponent(slug)}`, {
    headers: { accept: "text/html" },
    redirect: "manual",
  });
  const html = await response.text();
  if (response.status !== 200) {
    failures.push({ slug, reason: "http", detail: String(response.status) });
    return;
  }
  http200 += 1;
  if (/<title>[^<]*(?:not[ -]?found|404|页面不存在)/iu.test(html) || !html.includes('data-testid="career-display-surface"')) {
    soft404 += 1;
    failures.push({ slug, reason: "soft_404" });
    return;
  }
  const components = uniqueMatches(html, /data-career-component-id="([^"]+)"/gu);
  const apiComponents = uniqueMatches(html, /data-career-api-component="([^"]+)"/gu);
  const groups = uniqueMatches(html, /data-career-visual-group="([^"]+)"/gu);
  const emptyCards = [...html.matchAll(/<section[^>]*data-career-api-component="([^"]+)"[^>]*>\s*<\/section>/gu)]
    .map((match) => match[1]);
  if (
    components.count !== 26 || components.unique !== 26 ||
    apiComponents.count !== 26 || apiComponents.unique !== 26 ||
    groups.count !== 12 || groups.unique !== 12 ||
    emptyCards.length > 0
  ) {
    failures.push({
      slug,
      reason: "markers",
      detail: JSON.stringify({ components, apiComponents, groups, emptyCards }),
    });
    return;
  }
  frontendPass += 1;
}

async function worker() {
  while (true) {
    const slug = slugs[cursor++];
    if (!slug) return;
    try {
      await audit(slug);
    } catch (error) {
      failures.push({ slug, reason: "exception", detail: error instanceof Error ? error.message : String(error) });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, worker));

const report = {
  schemaVersion: "career.v12.phase-b.http-page-audit.v1",
  frontendOrigin,
  concurrency,
  total: slugs.length,
  http200,
  frontendPass,
  soft404,
  failureCount: failures.length,
  failures: failures.slice(0, 50),
};
await mkdir(evidenceDir, { recursive: true });
await writeFile(path.join(evidenceDir, "http-page-audit.json"), `${JSON.stringify(report, null, 2)}\n`);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
if (failures.length > 0) process.exitCode = 1;
