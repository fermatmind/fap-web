#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { TARGETS, validateRuntimeRecord } from "./mbti-comp-gate-47-runtime-completeness.mjs";

const ROOT = resolve(import.meta.dirname, "../..");
const OUTPUT_JSON = resolve(ROOT, "docs/seo/personality/mbti-comp-gate-47-runtime-completeness-2026-07-19.json");
const OUTPUT_MD = resolve(ROOT, "docs/seo/personality/mbti-comp-gate-47-runtime-completeness-2026-07-19.md");
const API_ORIGIN = "https://api.fermatmind.com";
const SITE_ORIGIN = "https://fermatmind.com";

if (!process.argv.includes("--allow-network")) {
  console.error("Refusing network readback without --allow-network");
  process.exit(2);
}

async function fetchWithRetry(url, accept) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { accept }, signal: AbortSignal.timeout(30_000) });
      return { status: response.status, body: await response.text() };
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function inspect(target) {
  const apiUrl = `${API_ORIGIN}/api/v0.5/personality/comparisons/${target.slug}?locale=zh-CN`;
  const pageUrl = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
  try {
    const [api, page] = await Promise.all([
      fetchWithRetry(apiUrl, "application/json"),
      fetchWithRetry(pageUrl, "text/html"),
    ]);
    let payload = null;
    try { payload = JSON.parse(api.body); } catch { payload = null; }
    return validateRuntimeRecord({
      slug: target.slug,
      expectedSectionsSha256: target.sectionsSha256,
      approvedPayloadSha256: target.approvedPayloadSha256,
      reviewSource: target.reviewSource,
      apiStatus: api.status,
      payload,
      pageStatus: page.status,
      pageHtml: page.body,
    });
  } catch (error) {
    return {
      slug: target.slug,
      passed: false,
      authority_source: "public_backend_and_page_readback",
      failures: [{
        slug: target.slug,
        field: "network.readback",
        expected: "successful API and page responses within three attempts",
        actual: error instanceof Error ? error.message : String(error),
        authority_source: "public_backend_and_page_readback",
      }],
    };
  }
}

const results = [];
for (let index = 0; index < TARGETS.length; index += 4) {
  results.push(...await Promise.all(TARGETS.slice(index, index + 4).map(inspect)));
}
const failures = results.flatMap((result) => result.failures);
const report = {
  id: "MBTI-COMP-GATE-47-RUNTIME-COMPLETENESS",
  generated_at: new Date().toISOString(),
  decision: failures.length === 0 ? "PASS_EXACT_16_OF_16" : "FAIL_CLOSED",
  authority_contract: {
    runtime_authority: "public API comparison_public_projection_v1 plus public page HTML",
    review_fingerprint_sources: [
      "MBTI-CMS-APPROVAL-39 exact approved comparison payloads",
      "MBTI-COMP-RUNTIME-46 exact INTP revision package",
    ],
    local_package_runtime_fallback_allowed: false,
    comparison_blocks_may_substitute_for_sections: false,
  },
  summary: { target_count: 16, passed: results.filter((result) => result.passed).length, failed: failures.length },
  targets: results,
  failures,
};
const markdown = `# MBTI-COMP-GATE-47 runtime completeness\n\n- Decision: ${report.decision}\n- Runtime authority: public backend projection and public page HTML\n- Passed: ${report.summary.passed}/16\n- Failures: ${report.summary.failed}\n- Local content fallback: prohibited\n- comparison_blocks substitution: prohibited\n`;
await mkdir(dirname(OUTPUT_JSON), { recursive: true });
await writeFile(OUTPUT_JSON, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(OUTPUT_MD, markdown);
console.log(JSON.stringify(report.summary));
if (failures.length > 0) process.exitCode = 1;
