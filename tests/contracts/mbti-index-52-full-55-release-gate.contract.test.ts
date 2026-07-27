import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

const script = "scripts/seo/build-mbti-index-52-full-55-release-gate.mjs";
const reportPath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.json";
const runOnePath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-1.json";
const runTwoPath = "docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-2.json";
const exactNewTargets = ["enfp-vs-entp", "estj-vs-entj", "isfp-vs-infp"];

describe("MBTI-INDEX-52 full 55 URL release gate", () => {
  it("requires explicit read-only network and independent run flags", () => {
    expect(() => execFileSync("node", [script], { encoding: "utf8", stdio: "pipe" })).toThrow();
    expect(() => execFileSync("node", [script, "--allow-network"], { encoding: "utf8", stdio: "pipe" })).toThrow();
  });

  it.each(["duplicate", "missing", "extra"])("rejects %s target inventory drift", (probe) => {
    expect(() => execFileSync("node", [script, `--contract-probe=${probe}`], {
      encoding: "utf8",
      stdio: "pipe",
    })).toThrow();
  });

  it.each(["section", "fingerprint", "revision", "membership"])("rejects %s evidence failure", (probe) => {
    expect(() => execFileSync("node", [script, `--contract-probe=${probe}`], {
      encoding: "utf8",
      stdio: "pipe",
    })).toThrow();
  });

  it("records two independent complete production runs before unblocking GSC", () => {
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    const runOne = JSON.parse(fs.readFileSync(runOnePath, "utf8"));
    const runTwo = JSON.parse(fs.readFileSync(runTwoPath, "utf8"));

    expect(report.final_decision).toBe("ALLOW_MBTI_55_COMPLETE");
    expect(report.gsc_dependency_unblocked).toBe(true);
    expect(report.completed_consecutive_runs).toBe(2);
    expect(report.target_count).toBe(55);
    expect(report.exact_new_targets).toEqual(exactNewTargets);
    expect(runOne.run_decision).toBe("PASS_MBTI_55_RUN");
    expect(runTwo.run_decision).toBe("PASS_MBTI_55_RUN");
    expect(runOne.started_at < runOne.completed_at).toBe(true);
    expect(runOne.completed_at < runTwo.started_at).toBe(true);
    expect(runTwo.started_at < runTwo.completed_at).toBe(true);
    expect(runOne.evidence_signature).toBe(runTwo.evidence_signature);
    expect(runOne.source_revision_set_sha256).toBe(runTwo.source_revision_set_sha256);
    expect(runOne.authority_fingerprint_set_sha256).toBe(runTwo.authority_fingerprint_set_sha256);
    expect(report.records).toHaveLength(55);
    expect(new Set(report.records.map((record: { path: string }) => record.path)).size).toBe(55);
    expect(report.records.filter((record: { kind: string }) => record.kind === "profile")).toHaveLength(32);
    expect(report.records.filter((record: { kind: string }) => record.kind === "at_comparison")).toHaveLength(16);
    expect(report.records.filter((record: { kind: string }) => record.kind === "cross_type_comparison")).toHaveLength(7);
    expect(report.records.filter((record: { group: string }) => record.group === "released_cross_type")
      .map((record: { path: string }) => record.path.split("/").at(-1))).toEqual(exactNewTargets);
    expect(report.records.every((record: {
      authority_fingerprint_sha256: string;
      source_revision_sha256: string;
      blockers: string[];
    }) => (
      /^[0-9a-f]{64}$/.test(record.authority_fingerprint_sha256)
      && /^[0-9a-f]{64}$/.test(record.source_revision_sha256)
      && record.blockers.length === 0
    ))).toBe(true);
    expect(report.metrics).toEqual({
      PUBLIC_API: 55,
      AUTHORITY: 55,
      AUTHORITY_FINGERPRINT: 55,
      VISIBLE_BODY: 55,
      SECTION_COMPLETENESS: 55,
      FAQ: 55,
      JSONLD: 55,
      CANONICAL: 55,
      ROBOTS_INDEXABILITY: 55,
      SITEMAP: 55,
      LLMS: 55,
      LLMS_FULL: 55,
      API_TIMEOUTS: 0,
    });
    expect(report.private_url_leak_count).toBe(0);
  });

  it("preserves backend authority and the read-only search hold", () => {
    const source = fs.readFileSync(script, "utf8");
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

    expect(source).toContain('comparison.authority_source === "database"');
    expect(source).toContain('comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"');
    expect(source).toContain("PROFILE_SECTION_COUNT_OVERRIDES");
    expect(source).toContain("?? 35");
    expect(source).toContain("expectedSectionCount: 9");
    expect(source).toContain("const EXPECTED_CROSS_SECTION_COUNT");
    expect(source).toContain("feedUrls(body).size < 55");
    expect(source).toContain("const FEED_URLS = Object.freeze");
    expect(source).toContain('"--http1.1"');
    expect(source).toContain('target.slug === "intp-a-vs-intp-t"');
    expect(source).toContain('? "mbti-comp-runtime-46-intp-revision"');
    expect(source).toContain(': "mbti_cms_import_40_at_comparison_draft_v1"');
    expect(source).toContain("visibleBodyComplete");
    expect(source).toContain("profileSectionVisible");
    expect(source).toContain("missingCandidates.length === 0");
    expect(source).toContain("const MAX_CONCURRENCY = 1");
    expect(source).toContain("markdownContentBlocks");
    expect(source).toContain("normalizeComparableText");
    expect(source).toContain("--diagnose-visible-only");
    expect(source).toContain("sectionKey === \"letters_intro\"");
    expect(source).toContain("sectionKey === \"trait_overview\"");
    expect(source).toContain("sectionKey === \"v8_5_module_10_faq_boundary\"");
    expect(source).toContain("profileReaderVisibleSections");
    expect(source).toContain("PROFILE_V85_VISIBLE_SECTION_KEYS");
    expect(source).toContain("PROFILE_LEADING_PROJECTION_SECTION_KEYS");
    expect(source).toContain("comparisonSectionVisible");
    expect(source).toContain("sections.length > 0 && sections.every");
    expect(source).not.toContain("visibleText.length >= 1_500");
    expect(source).toContain("authority.revisionPresent === true");
    expect(source).toContain("RELEASED_CROSS_SOURCE_SHA256");
    expect(source).toContain("comparison_public_projection_v1 ?? payload?.comparison");
    expect(source).toContain("projection.canonical_type_code === expectedTypeCode");
    expect(source).toContain("projection.variant_code === expectedVariantCode");
    expect(source).toContain("projection.runtime_type_code === expectedRuntimeTypeCode");
    expect(source).toContain("projection?._meta?.authority_source === \"personality_cms_v2\"");
    expect(source).toContain("answer_surface: payload?.answer_surface_v1");
    expect(source).toContain("structured.pageIdentities.some");
    expect(source).toContain("structured.breadcrumbTargets.includes(canonical)");
    expect(source).toContain("results?");
    expect(source).toContain("'script, style, template, noscript, [hidden], [aria-hidden=\"true\"], input[type=\"hidden\"]'");
    expect(source).toContain("authorityFingerprintSha256");
    expect(source).toContain("sourceRevisionSha256");
    expect(source).toContain("const ARTIFACT_PATHS = Object.freeze");
    expect(source).not.toContain("process.cwd()");
    expect(source).not.toMatch(/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);
    expect(report.safety_boundary).toMatchObject({
      read_only_network: true,
      cms_write_attempted: false,
      database_write_attempted: false,
      publication_mutation_attempted: false,
      indexability_mutation_attempted: false,
      sitemap_llms_mutation_attempted: false,
      sitemap_submission_attempted: false,
      gsc_mutation_attempted: false,
      search_submission_attempted: false,
      production_deploy_attempted: false,
      frontend_editorial_fallback_added: false,
    });
  });
});
