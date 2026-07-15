import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/public-personality/enneagram-public-personality-handoff-matrix.v1.json";
const REPORT_PATH = "docs/public-personality/enneagram-public-personality-handoff-matrix-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/public-personality/enneagram-public-personality-handoff-common-contract.v1.json";
const SOURCE_PACKET_PATH = "docs/public-personality/enneagram-public-personality-source-authority-packet.v1.json";
const CLAIM_PACKET_PATH = "docs/public-personality/enneagram-public-personality-claim-safety-packet.v1.json";
const CANDIDATE_PACKET_PATH = "docs/public-personality/enneagram-public-personality-candidate-cluster-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

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

describe("Enneagram Public Personality handoff matrix", () => {
  it("declares aggregate planning readiness while preserving runtime holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const summary = asRecord(matrix.readiness_summary);

    expect(matrix.schema_version).toBe("fermatmind.enneagram_public_personality_handoff_matrix.v1");
    expect(matrix.task_id).toBe("ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-MATRIX-01");
    expect(matrix.verdict).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(matrix.run_mode).toBe("docs_contracts_only");
    expect(summary.aggregate_handoff).toBe("READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS");
    expect(summary.runtime_mutation).toBe("BLOCKED");
    expect(summary.cms_publish_search).toBe("HOLD");
    expect(summary.private_or_raw_result_data).toBe("BLOCKED");
    expect(summary.generated_pages).toBe("BLOCKED");
  });

  it("consumes all upstream Enneagram public personality packets", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const source = readJson(SOURCE_PACKET_PATH);
    const claim = readJson(CLAIM_PACKET_PATH);
    const candidate = readJson(CANDIDATE_PACKET_PATH);
    const dependencies = asRecordArray(matrix.dependencies);

    expect(common.verdict).toBe("READY_FOR_POLICY_HANDOFF");
    expect(source.verdict).toBe("MAPPED_PARTIAL");
    expect(claim.verdict).toBe("READY_TO_BLOCK_UNSAFE_PUBLIC_PERSONALITY_OUTPUTS");
    expect(candidate.verdict).toBe("PLANNING_ONLY");
    expect(dependencies.map((dependency) => dependency.task_id)).toEqual([
      "ENNEAGRAM-PUBLIC-PERSONALITY-HANDOFF-COMMON-CONTRACT-01",
      "ENNEAGRAM-PUBLIC-PERSONALITY-SOURCE-AUTHORITY-PACKET-01",
      "ENNEAGRAM-PUBLIC-PERSONALITY-CLAIM-SAFETY-PACKET-01",
      "ENNEAGRAM-PUBLIC-PERSONALITY-CANDIDATE-CLUSTER-PACKET-01",
    ]);
    expect(dependencies.map((dependency) => dependency.status)).toEqual(["MERGED", "MERGED", "MERGED", "MERGED"]);
  });

  it("separates the current estate, workflow truth, and forbidden expansions", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.handoff_matrix);
    const statusByLane = new Map(rows.map((row) => [String(row.lane), String(row.status)]));

    expect(rows.length).toBe(8);
    expect(statusByLane.get("authority_v2_116_page_estate")).toBe(
      "GOVERNANCE_ALIGNED_PENDING_LEDGER_AND_HUMAN_REVIEW"
    );
    expect(statusByLane.get("bilingual_drafting_and_review_truth")).toBe("REQUIRED");
    expect(statusByLane.get("forbidden_expansion_scope")).toBe("BLOCKED");
    expect(statusByLane.get("claim_privacy_safety_gate")).toBe("READY_TO_BLOCK_UNSAFE_OUTPUTS");
    expect(statusByLane.get("cms_dry_run_publish_and_search")).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(statusByLane.get("runtime_deploy_provider_and_backend_mutation")).toBe("BLOCKED");
    expect(statusByLane.get("private_or_raw_result_data")).toBe("BLOCKED");
    expect(statusByLane.get("next_planning_handoff")).toBe("READY_FOR_READ_ONLY_SCAN");
  });

  it("keeps every lane explicit about gates and hard holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.handoff_matrix);

    for (const row of rows) {
      expect(row).toHaveProperty("lane");
      expect(row).toHaveProperty("status");
      expect(row).toHaveProperty("allowed_inputs");
      expect(row).toHaveProperty("allowed_outputs");
      expect(row).toHaveProperty("required_gates");
      expect(row).toHaveProperty("hard_holds");
      expect(asStringArray(row.required_gates).length).toBeGreaterThan(0);
      expect(asStringArray(row.hard_holds).length).toBeGreaterThan(0);
    }
  });

  it("blocks CMS, search, runtime, deploy, provider, backend, generated pages, and private inputs", () => {
    const matrix = readJson(MATRIX_PATH);
    const rows = asRecordArray(matrix.handoff_matrix);
    const cms = rows.find((row) => row.lane === "cms_dry_run_publish_and_search");
    const runtime = rows.find((row) => row.lane === "runtime_deploy_provider_and_backend_mutation");
    const privateData = rows.find((row) => row.lane === "private_or_raw_result_data");

    expect(cms?.status).toBe("HOLD_PENDING_SEPARATE_AUTHORIZATION");
    expect(asStringArray(cms?.hard_holds)).toEqual(
      expect.arrayContaining(["no_cms_write", "no_publish", "no_sitemap_mutation", "no_llms_mutation", "no_search_submission"])
    );
    expect(runtime?.status).toBe("BLOCKED");
    expect(asStringArray(runtime?.hard_holds)).toEqual(
      expect.arrayContaining(["no_runtime_code_change", "no_provider_calls", "no_deploy", "no_backend_import", "no_fap_api_mutation"])
    );
    expect(privateData?.status).toBe("BLOCKED");
    expect(asStringArray(privateData?.hard_holds)).toEqual(
      expect.arrayContaining(["no_attempt_id", "no_user_id", "no_raw_scores", "no_score_vectors", "no_private_report_text"])
    );
  });

  it("locks the 116-page estate and blocks the matrix, Tritype, and new URLs", () => {
    const matrix = readJson(MATRIX_PATH);
    const estate = asRecord(matrix.authority_v2_estate);

    expect(estate.identity_count).toBe(58);
    expect(estate.page_count).toBe(116);
    expect(estate.independent_bilingual_drafting).toBe(true);
    expect(estate.unreviewed_state).toBe("pending_manual_review");
    expect(estate.model_review_is_human_review).toBe(false);
    expect(estate.working_revision_isolated).toBe(true);
    expect(asStringArray(matrix.forbidden_expansions)).toEqual([
      "54_wing_x_instinct_matrix",
      "tritype",
      "new_public_urls",
    ]);
  });

  it("defines PR04 as the next dependency-gated train handoff", () => {
    const matrix = readJson(MATRIX_PATH);
    const handoff = asRecord(matrix.next_handoff);

    expect(handoff.recommended_next_task).toBe("ENNEAGRAM-PUBLIC-AUTHORITY-V2-PUBLIC-CONTRACT-04");
    expect(handoff.handoff_status).toBe("pending_pr03_merge_then_dependency_verification");
    expect(handoff.must_remain_read_only_until_authorized).toBe(true);
    expect(asStringArray(handoff.required_inputs_before_execution)).toEqual(
      expect.arrayContaining([
        "merged_pr03_skill_alignment",
        "merged_pr02_integrity_gate",
        "claim_privacy_safety_gate_review",
        "authority_v2_source_ledger_remains_pr07_scope",
      ])
    );
    expect(asStringArray(handoff.blocked_until_separate_approval)).toEqual(
      expect.arrayContaining(["cms_write", "publish", "generated_pages", "runtime_mutation", "search_submission", "deploy"])
    );
  });

  it("preserves forbidden claims and negative guarantees", () => {
    const matrix = readJson(MATRIX_PATH);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "final_fixed_type_certainty",
        "official_fixed_enneagram_type_claim",
        "most_accurate_type_finality",
        "diagnosis",
        "therapy",
        "relationship_guarantee",
        "hiring_prediction",
        "salary_prediction",
        "performance_prediction",
        "success_prediction",
        "private_report_text_rewrite",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submission).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.backend_import).toBe("none");
    expect(guarantees.source_ledger_write).toBe("none");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.private_result_text_reused).toBe("none");
    expect(guarantees.deterministic_type_assignment_included).toBe(false);
  });

  it("keeps markdown aligned with the matrix verdict and holds", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_FOR_NEXT_PLANNING_HANDOFF_WITH_RUNTIME_HOLDS`");
    expect(report).toContain("Current 58-identity / 116-page estate: `GOVERNANCE_ALIGNED_PENDING_LEDGER_AND_HUMAN_REVIEW`");
    expect(report).toContain("Review truth: `pending_manual_review`; model/agent QA is not human review");
    expect(report).toContain("Runtime, deploy, provider, backend import, and source ledger write: `BLOCKED`");
    expect(report).toContain("Recommended next train task after PR03 merge: `ENNEAGRAM-PUBLIC-AUTHORITY-V2-PUBLIC-CONTRACT-04`");
    expect(report).toContain("deterministic type assignment included: false");
  });

  it("keeps current branch scope limited to PR5 files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_PUBLIC_PERSONALITY_HANDOFF_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-public-personality-handoff-matrix-01");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-handoff-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/public-personality/enneagram-public-personality-handoff-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-public-personality-handoff-matrix.contract.test.ts");
  });
});
