import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("CAREER-DETAIL-CACHE-BUDGET-REPAIR-01", () => {
  it("memoizes the backend-authority career bundle load across metadata and page render", () => {
    const source = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(source).toContain('import { cache } from "react";');
    expect(source).toContain("const loadCareerJobBundle = cache(async");
    expect(source).toContain("fetchCareerJobBundle({ locale, slug, includeSeoAuthority: true })");
    expect(source).not.toContain("fallback career content");
  });

  it("starts SEO authority fetch in parallel with the detail bundle and keeps an explicit fetch budget", () => {
    const source = read("lib/career/api/fetchCareerJobBundle.ts");
    const seoPromiseIndex = source.indexOf("const seoAuthorityPromise");
    const bundleFetchIndex = source.indexOf("const bundle = await apiClient.get");

    expect(source).toContain("const CAREER_JOB_DETAIL_FETCH_TIMEOUT_MS = 12_000;");
    expect(seoPromiseIndex).toBeGreaterThan(-1);
    expect(bundleFetchIndex).toBeGreaterThan(-1);
    expect(seoPromiseIndex).toBeLessThan(bundleFetchIndex);
    expect(source.match(/timeoutMs: CAREER_JOB_DETAIL_FETCH_TIMEOUT_MS/g)?.length).toBe(2);
    expect(source).not.toContain('cache: "no-store"');
  });

  it("records safety boundaries and validation in the generated artifact", () => {
    const report = JSON.parse(read("docs/seo/generated/career-detail-cache-budget-repair-01.v1.json")) as {
      task: string;
      implemented_repairs: Array<{ id: string }>;
      safety_assertions: Record<string, boolean>;
      expected_runtime_effect: Record<string, boolean>;
      next_task: string;
    };

    expect(report.task).toBe("CAREER-DETAIL-CACHE-BUDGET-REPAIR-01");
    expect(report.implemented_repairs.map((item) => item.id)).toEqual([
      "server_render_bundle_memoization",
      "parallel_seo_authority_fetch",
      "explicit_detail_fetch_budget",
    ]);
    expect(report.safety_assertions).toMatchObject({
      backend_authority_preserved: true,
      frontend_fallback_content_added: false,
      held_slug_policy_changed: false,
      sitemap_url_set_changed: false,
      llms_url_set_changed: false,
      search_channel_action_performed: false,
      url_submission_performed: false,
      cms_mutation_performed: false,
      db_mutation_performed: false,
      deploy_performed: false,
    });
    expect(report.expected_runtime_effect).toMatchObject({
      reduces_duplicate_bundle_loads: true,
      reduces_serial_backend_wait: true,
      keeps_noindex_gates_authority_backed: true,
      keeps_held_slugs_unexposed: true,
    });
    expect(report.next_task).toBe("CAREER-LEGACY-FULL-JOBS-INDEX-CONSUMER-AUDIT-01");
  });

  it("keeps this PR inside the approved cache budget repair scope", () => {
    for (const file of [
      "app/(localized)/[locale]/career/jobs/[slug]/page.tsx",
      "lib/career/api/fetchCareerJobBundle.ts",
      "docs/seo/career-detail-cache-budget-repair-01.md",
      "docs/seo/generated/career-detail-cache-budget-repair-01.v1.json",
      "tests/contracts/career-detail-cache-budget-repair-01.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
