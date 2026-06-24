import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/methodology-trust-science/big5-methodology-candidate-cluster-matrix.v1.json";
const REPORT_PATH = "docs/methodology-trust-science/big5-methodology-candidate-cluster-matrix-2026-06-23.md";
const SOURCE_PACKET_PATH = "docs/methodology-trust-science/big5-methodology-source-authority-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/methodology-trust-science/big5-methodology-claim-privacy-safety-packet.v1.json";
const STATE_PATH = "docs/codex/pr-train-state.json";

const REQUIRED_FAMILIES = [
  "big5_science_contentpage_methodology_boundary",
  "big5_method_boundaries_and_item_design",
  "big5_reliability_validity_caveat",
  "big5_data_privacy_and_share_boundary",
  "big5_common_misconceptions_claim_correction",
  "big5_cross_scale_method_comparison",
  "big5_internal_link_navigation_candidates",
  "source_ledger_and_cms_review_readiness",
];

const REQUIRED_FIELDS = [
  "candidate_id",
  "cluster_family",
  "target_intent",
  "locale",
  "page_type",
  "source_evidence_required",
  "backend_authority_requirement",
  "review_ledger_requirement",
  "cms_dry_run_suitability",
  "risk_level",
  "allowed_claim_style",
  "forbidden_claim_style",
  "examples_only_statement",
  "internal_link_candidates",
  "GPT55_review_required",
  "Safety_Gate_review_required",
  "SEO_GEO_review_required",
  "HOLD_actions",
];

function readJson(relativePath: string): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as Record<string, unknown>;
}

function readText(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asRecordArray(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(asRecord) : [];
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

describe("Big Five methodology candidate cluster matrix", () => {
  it("declares planning-only readiness and merged dependencies", () => {
    const packet = readJson(PACKET_PATH);
    const deps = asRecordArray(packet.dependencies);

    expect(packet.schema_version).toBe("fermatmind.big5_methodology_trust_science.candidate_cluster_matrix.v1");
    expect(packet.task_id).toBe("BIG5-METHODOLOGY-CANDIDATE-CLUSTER-MATRIX-01");
    expect(packet.verdict).toBe("PLANNING_ONLY");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(deps.map((dep) => dep.status)).toEqual(["MERGED", "MERGED"]);
    expect(deps.map((dep) => dep.pr_url)).toEqual([
      "https://github.com/fermatmind/fap-web/pull/1410",
      "https://github.com/fermatmind/fap-web/pull/1412",
    ]);
  });

  it("consumes source authority and claim/privacy/safety packets without widening verdicts", () => {
    const source = readJson(SOURCE_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const packet = readJson(PACKET_PATH);
    const deps = asRecordArray(packet.dependencies);

    expect(source.verdict).toBe("SOURCE_AUTHORITY_MAPPED_FOR_PLANNING_ONLY");
    expect(claim.verdict).toBe("SAFETY_PACKET_READY_FOR_PLANNING_ONLY");
    expect(deps.find((dep) => dep.task_id === "BIG5-METHODOLOGY-SOURCE-AUTHORITY-PACKET-01")?.verdict).toBe(
      "SOURCE_AUTHORITY_MAPPED_FOR_PLANNING_ONLY"
    );
    expect(deps.find((dep) => dep.task_id === "BIG5-METHODOLOGY-CLAIM-PRIVACY-SAFETY-PACKET-01")?.verdict).toBe(
      "SAFETY_PACKET_READY_FOR_PLANNING_ONLY"
    );
  });

  it("covers all required cluster families with exactly 8 planning candidates", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);
    const families = new Set(candidates.map((candidate) => String(candidate.cluster_family)));

    expect(asStringArray(packet.cluster_families)).toEqual(REQUIRED_FAMILIES);
    expect(candidates).toHaveLength(8);
    for (const family of REQUIRED_FAMILIES) {
      expect(families.has(family), family).toBe(true);
    }
  });

  it("requires every candidate cluster field and review gate", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);

    for (const candidate of candidates) {
      for (const field of REQUIRED_FIELDS) {
        expect(candidate).toHaveProperty(field);
      }
      expect(asStringArray(candidate.source_evidence_required).length).toBeGreaterThan(0);
      expect(asStringArray(candidate.internal_link_candidates).length).toBeGreaterThan(0);
      expect(asStringArray(candidate.HOLD_actions).length).toBeGreaterThan(0);
      expect(candidate.GPT55_review_required).toBe(true);
      expect(candidate.Safety_Gate_review_required).toBe(true);
      expect(candidate.SEO_GEO_review_required).toBe(true);
      expect(String(candidate.examples_only_statement)).toMatch(/candidate|planning|prompt|copy|research|navigation|content/i);
    }
  });

  it("keeps high-risk measurement and source-ledger candidates gated", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);
    const measurement = candidates.find((candidate) => candidate.cluster_family === "big5_reliability_validity_caveat");
    const readiness = candidates.find((candidate) => candidate.cluster_family === "source_ledger_and_cms_review_readiness");

    expect(measurement?.risk_level).toBe("high");
    expect(measurement?.cms_dry_run_suitability).toBe("hold_until_source_ledger_exists");
    expect(String(measurement?.forbidden_claim_style)).toContain("guaranteed_accuracy");
    expect(readiness?.risk_level).toBe("high");
    expect(readiness?.cms_dry_run_suitability).toBe("blocked_until_source_ledger_exists");
    expect(asStringArray(readiness?.HOLD_actions)).toEqual(
      expect.arrayContaining(["source_ledger_write", "cms_write", "generated_page", "schema", "sitemap", "llms"])
    );
  });

  it("blocks publishable body, CMS payload, metadata, generated pages, private result copy, and deterministic claims", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.forbidden_payload_classes)).toEqual(
      expect.arrayContaining([
        "publishable_article_body",
        "cms_payload",
        "final_title_meta_to_publish",
        "generated_methodology_page_content",
        "private_result_based_methodology_content",
        "private_report_text_rewrite",
        "raw_score_or_percentile_based_content",
        "deterministic_trait_assignment",
        "official_32_type_claim",
        "fixed_type_claim",
        "clinical_or_therapy_claim",
        "hiring_prediction",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
      ])
    );
    expect(guarantees.publishable_body_included).toBe(false);
    expect(guarantees.cms_payload_included).toBe(false);
    expect(guarantees.final_title_meta_included).toBe(false);
    expect(guarantees.generated_page_content_included).toBe(false);
    expect(guarantees.private_result_based_content_included).toBe(false);
    expect(guarantees.deterministic_trait_assignment_included).toBe(false);
  });

  it("keeps markdown aligned with planning-only boundaries", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `PLANNING_ONLY`");
    expect(report).toContain("8 planning candidates");
    expect(report).toContain("High-risk candidates");
    expect(report).toContain("CMS write");
    expect(report).toContain("deterministic trait assignment included: false");
  });

  it("registers PR4 state as an in-flight docs/contracts-only PR", () => {
    const state = readJson(STATE_PATH);
    const prs = Array.isArray(state.prs) ? state.prs.map(asRecord) : [];
    const pr4 = prs.find((pr) => pr.id === "BIG5-METHODOLOGY-CANDIDATE-CLUSTER-MATRIX-01");

    expect([
      "implementation_in_progress",
      "local_checks_passed_ready_for_pr",
      "pr_open_checks_pending",
      "ready_to_merge",
    ]).toContain(pr4?.status);
    expect(pr4?.pr_url === null || String(pr4?.pr_url).startsWith("https://github.com/fermatmind/fap-web/pull/")).toBe(
      true
    );
    expect(pr4).toMatchObject({
      merged_at: null,
      remote_branch_deleted: false,
      local_cleanup_executed: false,
    });
  });
});
