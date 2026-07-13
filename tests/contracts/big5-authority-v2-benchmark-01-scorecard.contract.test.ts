import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-big5-authority-v2-benchmark-01-scorecard.mjs";
const reportPath = "docs/seo/personality/big5-authority-v2-benchmark-01-scorecard-2026-07-14.json";
const evidencePath = "docs/seo/personality/big5-authority-v2-benchmark-01-live-evidence-2026-07-14.json";

describe("BIG5-AUTHORITY-V2-BENCHMARK-01 scorecard", () => {
  it("locks the exact 127 canonical and ten redirect-only alias inventory", () => {
    const stdout = execFileSync("node", [script], { encoding: "utf8" });
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(stdout).toContain("PASS_BIG5_AUTHORITY_V2_BENCHMARK_LOCKED");
    expect(report.summary).toMatchObject({
      personality_canonical_count: 114,
      article_canonical_count: 9,
      test_canonical_count: 2,
      topic_canonical_count: 2,
      total_canonical_count: 127,
      zh_legacy_alias_count: 10,
      personality_hub_count: 2,
      domain_count: 10,
      facet_hub_count: 2,
      range_and_legacy_count: 40,
      facet_detail_count: 60,
    });
    expect(report.page_scorecards).toHaveLength(127);
    expect(report.fermat_zh_legacy_aliases).toHaveLength(10);
    expect(new Set(report.page_scorecards.map((row: { requested_url: string }) => row.requested_url)).size).toBe(127);
  });

  it("locks one primary page-family owner and all 37 downstream train ownership rows", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(report.downstream_train_ownership).toHaveLength(37);
    expect(report.downstream_train_ownership[0].id).toBe("BIG5-AUTHORITY-V2-INTEGRITY-GATE-02");
    expect(report.downstream_train_ownership.at(-1).id).toBe("BIG5-AUTHORITY-V2-RUNTIME-CLOSEOUT-38");
    expect(report.page_scorecards.every((row: { primary_owner_pr: string }) => row.primary_owner_pr.startsWith("BIG5-AUTHORITY-V2-"))).toBe(true);
    expect(report.page_scorecards.filter((row: { family: string }) => row.family === "article")).toHaveLength(9);
    expect(report.page_scorecards.filter((row: { family: string }) => row.family === "topic_hub")).toHaveLength(2);
  });

  it("keeps competitor evidence structural and the authority boundary fail closed", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const evidence = JSON.parse(fs.readFileSync(evidencePath, "utf8"));
    const source = fs.readFileSync(script, "utf8");

    expect(report.truity_benchmark.boundary).toContain("must not be copied or paraphrased");
    expect(report.truity_benchmark.benchmark_pages.length).toBeGreaterThanOrEqual(11);
    expect(report.truity_benchmark.technical_and_report_documents).toHaveLength(2);
    expect(report.authority_boundary).toMatchObject({
      backend_cms_remains_authority: true,
      frontend_editorial_fallback_added: false,
      sitemap_or_llms_runtime_changed: false,
      canonical_or_indexability_changed: false,
      cms_write_attempted: false,
      production_action_attempted: false,
      competitor_copy_reused: false,
    });
    expect(evidence.safety_boundary.private_route_requested).toBe(false);
    expect(evidence.fermat_records.flatMap((row: { private_path_links: string[] }) => row.private_path_links)).toEqual([]);
    expect(source).toContain('const ALLOW_NETWORK = process.argv.includes("--allow-network")');
    expect(source).toContain("ALLOW_NETWORK ? await captureLiveEvidence() : readJson(LIVE_EVIDENCE_PATH)");
  });
});
