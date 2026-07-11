import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const REPORT_PATH = "docs/seo/personality/enneagram/enneagram-90-cross-repo-readiness-2026-07-11.json";
const SUMMARY_PATH = "docs/seo/personality/enneagram/enneagram-90-cross-repo-readiness-2026-07-11.md";

function readJson<T>(relPath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8")) as T;
}

describe("ENNEAGRAM-90-CROSS-REPO-READINESS-01", () => {
  it("records a read-only cross-repo readiness pass without authorizing production side effects", () => {
    const report = readJson<Record<string, any>>(REPORT_PATH);

    expect(report.artifact).toBe("ENNEAGRAM-90-CROSS-REPO-READINESS-01");
    expect(report.status).toBe("PASS_READONLY_LOCAL");
    expect(report.scope).toMatchObject({
      production_write_execution: false,
      database_mutation: false,
      cms_mutation: false,
      publish: false,
      deploy: false,
      sitemap_cache_warm: false,
      llms_release: false,
      search_release: false,
    });
    expect(report.checks.content_package.evidence).toMatchObject({
      asset_files: 90,
      wings: 36,
      instinctual_subtypes: 54,
      zh_CN: 45,
      en: 45,
    });
    expect(report.checks.backend_import_contract.evidence).toMatchObject({
      assets_found: 90,
      valid_count: 90,
      errors_count: 0,
      indexable_count: 0,
      sitemap_eligible_count: 0,
      llms_eligible_count: 0,
    });
    expect(report.checks.frontend_route_resolver.evidence).toMatchObject({
      route_entries: 58,
      bilingual_paths: 116,
      wings: 18,
      instinctual_subtypes: 27,
    });
    expect(report.checks.sitemap_candidate.evidence).toMatchObject({
      candidate_paths: 116,
      llms_hold: true,
    });
    expect(report.go_no_go).toMatchObject({
      code_deploy_readiness: "GO_WITH_EXACT_SHA_AUTHORIZATION",
      cms_import_readiness: "GO_DRY_RUN_ONLY_UNTIL_SEPARATE_AUTHORIZATION",
      publish_readiness: "HOLD_UNTIL_POST_IMPORT_NOINDEX_RUNTIME_SMOKE",
      llms_search: "HOLD",
    });
  });

  it("keeps the human summary aligned with the JSON report boundaries", () => {
    const summary = fs.readFileSync(path.join(ROOT, SUMMARY_PATH), "utf8");
    expect(summary).toContain("Status: `PASS_READONLY_LOCAL`");
    expect(summary).toContain("No CMS write, production import, publish, deploy");
    expect(summary).toContain("90 JSON assets");
    expect(summary).toContain("116 bilingual paths");
    expect(summary).toContain("llms/search: HOLD");
  });
});
