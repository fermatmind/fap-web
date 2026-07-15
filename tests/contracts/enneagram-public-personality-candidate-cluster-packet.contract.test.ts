import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json";
const REPORT_PATH = "docs/public-personality/enneagram-public-personality-candidate-cluster-packet-2026-06-23.md";
const SOURCE_PACKET_PATH = "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const REQUIRED_FAMILIES = [
  "enneagram_public_hub_framework",
  "enneagram_nine_core_type_profiles",
  "enneagram_centers",
  "enneagram_type_comparison_internal_links",
  "enneagram_vs_big_five_reflection",
  "enneagram_vs_mbti_reflection",
  "public_share_to_profile_navigation_candidates",
  "source_ledger_and_review_readiness_candidates",
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

describe("Enneagram Public Personality candidate cluster packet", () => {
  it("declares planning-only readiness and merged dependencies", () => {
    const packet = readJson(PACKET_PATH);
    const deps = asRecordArray(packet.dependencies);

    expect(packet.schema_version).toBe("fermatmind.enneagram_public_personality_candidate_cluster_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-CANDIDATE-CLUSTER-PACKET-01");
    expect(packet.verdict).toBe("PLANNING_ONLY");
    expect(packet.run_mode).toBe("docs_contracts_only");
    expect(deps.map((dep) => dep.status)).toEqual(["MERGED", "MERGED"]);
    expect(deps.map((dep) => dep.pr_url)).toEqual([
      "https://github.com/fermatmind/fap-web/pull/1391",
      "https://github.com/fermatmind/fap-web/pull/1394",
    ]);
  });

  it("consumes source authority and claim safety packets without widening verdicts", () => {
    const source = readJson(SOURCE_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const packet = readJson(PACKET_PATH);
    const deps = asRecordArray(packet.dependencies);

    expect(source.verdict).toBe("MAPPED_PARTIAL");
    expect(claim.verdict).toBe("READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS");
    expect(deps.find((dep) => dep.task_id === "ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01")?.verdict).toBe("MAPPED_PARTIAL");
    expect(deps.find((dep) => dep.task_id === "ENNEAGRAM-PUBLIC-PERSONALITY-CLAIM-SAFETY-PACKET-01")?.verdict).toBe("READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS");
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
      expect(String(candidate.examples_only_statement)).toMatch(/candidate|planning|prompt|summary|copy|research|navigation/i);
    }
  });

  it("locks the current 58-identity estate and blocks only forbidden expansions", () => {
    const packet = readJson(PACKET_PATH);
    const candidates = asRecordArray(packet.candidate_clusters);
    const centers = candidates.find((candidate) => candidate.cluster_family === "enneagram_centers");
    const estate = asRecord(packet.authority_v2_estate);

    expect(centers?.cms_dry_run_suitability).toBe("hold_until_source_ledger_and_human_review");
    expect(String(centers?.backend_authority_requirement)).toContain("backend_authority_v2_identity_and_claim_map_required");
    expect(estate.identity_count).toBe(58);
    expect(estate.page_count).toBe(116);
    expect(estate.locales).toEqual(["en", "zh-CN"]);
    expect(estate.unreviewed_state).toBe("pending_manual_review");
    expect(estate.model_review_is_human_review).toBe(false);
    expect(asStringArray(packet.forbidden_expansions)).toEqual([
      "54_wing_x_instinct_matrix",
      "tritype",
      "new_public_urls",
    ]);
  });

  it("blocks publishable body, CMS payload, final metadata, generated pages, private result copy, and deterministic type claims", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.forbidden_payload_classes)).toEqual(
      expect.arrayContaining([
        "publishable_article_body",
        "cms_payload",
        "final_title_meta_to_publish",
        "generated_public_profile_page_content",
        "private_result_based_profile_content",
        "private_report_text_rewrite",
        "score_or_dominance_based_content",
        "deterministic_type_assignment",
        "final_type_certainty_claim",
        "clinical_or_therapy_claim",
        "relationship_guarantee",
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
    expect(guarantees.deterministic_type_assignment_included).toBe(false);
  });

  it("keeps markdown aligned with planning-only boundaries", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `PLANNING_ONLY`");
    expect(report).toContain("8 planning candidates");
    expect(report).toContain("58 identities and 116 bilingual pages");
    expect(report).toContain("Model/agent QA does not count as human review");
    expect(report).toContain("CMS write");
    expect(report).toContain("deterministic type assignment included: false");
  });

  it("keeps current branch scope limited to PR4 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_PUBLIC_PERSONALITY_CANDIDATE_CLUSTER_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-public-personality-candidate-cluster-packet-01");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-candidate-cluster-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-public-personality-candidate-cluster-packet.contract.test.ts");
  });
});
