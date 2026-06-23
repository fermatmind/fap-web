import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const ACTIVE_TRAIN_IDS = [
  "ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-COMMON-CONTRACT-01",
  "BIG5-SAFETY-GATE-CONSUMPTION-PACKET-01",
  "ENNEAGRAM-SAFETY-GATE-CONSUMPTION-PACKET-01",
  "RIASEC-SAFETY-GATE-CONSUMPTION-PACKET-01",
  "ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-MATRIX-01",
];

const EXPECTED_ASSERTIONS = [
  "unsupported_claim_gate",
  "private_result_boundary_gate",
  "analytics_payload_privacy_gate",
  "share_public_summary_gate",
  "pdf_private_print_gate",
  "public_private_content_separation_gate",
  "source_classification_gate",
  "hard_hold_action_gate",
  "smoke_exclusion_gate",
  "runtime_qa_to_analytics_safety_gate",
  "opportunity_scoring_hold_gate",
  "search_provider_hold_gate",
  "production_mutation_hold_gate",
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

describe("active result-page agents Safety Gate common contract", () => {
  it("defines the receiving and upstream agent boundary", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(contract.schema_version).toBe("fermatmind.active_result_page_agents_safety_gate_common_contract.v1");
    expect(contract.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-COMMON-CONTRACT-01");
    expect(contract.verdict).toBe("READY_TO_CONSUME_COMMON_SAFETY_GATE_CONTRACT");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.receiving_agent).toBe("claim_privacy_safety_gate");
    expect(asStringArray(contract.producing_upstream_agents)).toEqual([
      "runtime_qa",
      "analytics_gsc_opportunity",
      "big_five_result_page",
      "enneagram_result_page",
      "riasec_result_page",
    ]);
  });

  it("keeps active and parked result-page agent boundaries explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const active = asRecordArray(contract.active_agent_scope);
    const parked = asRecordArray(contract.parked_placeholder_scales);

    expect(active.map((row) => row.scale_code)).toEqual(["BIG5_OCEAN", "ENNEAGRAM", "RIASEC"]);
    expect(active.every((row) => row.safety_gate_common_status === "READY_TO_CONSUME")).toBe(true);
    expect(active.map((row) => row.required_packet_task_id)).toEqual([
      "BIG5-SAFETY-GATE-CONSUMPTION-PACKET-01",
      "ENNEAGRAM-SAFETY-GATE-CONSUMPTION-PACKET-01",
      "RIASEC-SAFETY-GATE-CONSUMPTION-PACKET-01",
    ]);
    expect(parked.map((row) => row.scale_code)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
    expect(parked.every((row) => row.status === "PARKED_PLACEHOLDER")).toBe(true);
  });

  it("declares the common assertion family vocabulary", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.assertion_families)).toEqual(EXPECTED_ASSERTIONS);
  });

  it("separates allowed reflective claim classes from forbidden outcome claims", () => {
    const contract = readJson(CONTRACT_PATH);
    const allowed = asStringArray(contract.allowed_claim_classes);
    const forbidden = asStringArray(contract.forbidden_claim_classes);

    expect(allowed).toEqual(
      expect.arrayContaining([
        "self_understanding",
        "personality_reflection",
        "motivation_pattern_reflection",
        "career_interest_exploration",
        "communication_reflection",
        "method_boundary",
        "non_diagnostic_note",
        "examples_only",
        "public_summary",
        "public_projection",
      ])
    );
    expect(forbidden).toEqual(
      expect.arrayContaining([
        "diagnosis",
        "treatment",
        "therapy",
        "clinical assessment",
        "hiring screen",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "admissions guarantee",
        "ability measurement guarantee",
        "deterministic career recommendation",
        "final type certainty",
        "official fixed type claim",
        "IQ/EQ diagnostic guarantee",
        "relationship guarantee",
        "life outcome guarantee",
        "paid/official/certified guarantee unless backend authority explicitly supports it",
      ])
    );
  });

  it("blocks private identifiers, raw result values, traces, hashes, and private URLs", () => {
    const contract = readJson(CONTRACT_PATH);
    const forbidden = asStringArray(contract.common_forbidden_private_fields);

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "email",
        "phone",
        "account_id",
        "report_token",
        "private_url",
        "raw_score",
        "raw_scores",
        "score_vector",
        "dimension_vector",
        "percentile",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "editor_notes",
        "private_report_payload",
        "full_report_body_text",
        "order_id",
        "payment_id",
        "benefit_grant_id",
        "benefit_wallet_id",
        "access_token",
        "cookie",
        "session_id",
        "release_hash",
        "registry_hash",
        "content_hash",
        "dominance_gap",
        "answer_key",
        "correct_answer",
        "pdf_private_url",
        "share_private_payload",
        "private_report_url",
      ])
    );
  });

  it("keeps hard HOLD actions and negative guarantees explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(asStringArray(contract.hard_hold_action_assertions)).toEqual(
      expect.arrayContaining([
        "no_cms",
        "no_publish",
        "no_search_submission",
        "no_provider_calls",
        "no_deploy",
        "no_runtime_instrumentation",
        "no_production_metric_backfill",
        "no_opportunity_scoring",
        "no_search_channel_mutation",
        "no_generated_readiness_artifact_write",
        "no_raw_private_data",
        "no_deterministic_career_recommendation",
      ])
    );
    expect(guarantees.safety_runtime_code_changed).toBe("no");
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
  });

  it("classifies sources without allowing unknown or access-required approval", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.source_classification_vocabulary)).toEqual([
      "backend_authority",
      "fap_web_consumer_contract",
      "runtime_qa_artifact",
      "analytics_handoff_artifact",
      "safety_gate_artifact",
      "generated_artifact",
      "fixture",
      "mock",
      "unknown",
      "access_required",
    ]);
  });

  it("allows Safety Gate to block but not approve default-denied actions", () => {
    const contract = readJson(CONTRACT_PATH);
    const bridge = asRecord(contract.runtime_qa_to_analytics_safety_bridge);

    expect(asStringArray(bridge.safety_gate_authority)).toEqual(
      expect.arrayContaining([
        "block_unsupported_claims",
        "block_private_data_leaks",
        "block_public_private_content_blending",
        "block_default_denied_actions",
        "report_blocked_actions",
      ])
    );
    expect(asStringArray(bridge.safety_gate_non_authority)).toEqual(
      expect.arrayContaining([
        "approve_cms_write",
        "approve_publish",
        "approve_search_submission",
        "approve_provider_call",
        "approve_deploy",
        "approve_runtime_enablement",
        "approve_event_emission",
        "approve_opportunity_scoring",
        "approve_private_data_access",
      ])
    );
  });

  it("keeps markdown aligned with the JSON contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_COMMON_SAFETY_GATE_CONTRACT`");
    expect(report).toContain("| Receiving agent | `claim_privacy_safety_gate` |");
    expect(report).toContain("| Producing upstream | `runtime_qa` |");
    expect(report).toContain("| Producing upstream | `analytics_gsc_opportunity` |");
    expect(report).toContain("`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`");
    for (const assertion of EXPECTED_ASSERTIONS) {
      expect(report).toContain(`\`${assertion}\``);
    }
    expect(report).toContain("Safety Gate may block unsafe actions");
    expect(report).toContain("It cannot approve CMS writes");
    expect(report).toContain("no safety runtime code");
    expect(report).toContain("no opportunity scoring");
  });

  it("registers the authorized five-PR Safety Gate train without adding runtime implementation ids", () => {
    const train = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];

    for (const id of ACTIVE_TRAIN_IDS) {
      expect(train).toContain(`id: ${id}`);
      expect(stateEntries.some((entry) => entry.id === id)).toBe(true);
    }
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-RUNTIME-01");
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-DEPLOY-01");
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-SAFETY-GATE-SEARCH-SUBMIT-01");
  });

  it("keeps current branch scope limited to the PR1 docs/contracts and train metadata", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_SAFETY_GATE_COMMON_CONTRACT_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-safety-gate-common-contract-01");
    expect(scopeHelper).toContain(
      "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract-2026-06-23.md"
    );
    expect(scopeHelper).toContain(
      "docs/result-page-agents/active-result-page-agents-safety-gate-common-contract.v1.json"
    );
    expect(scopeHelper).toContain(
      "tests/contracts/active-result-page-agents-safety-gate-common-contract.contract.test.ts"
    );
    expect(scopeHelper).toContain("docs/codex/pr-train.yaml");
    expect(scopeHelper).toContain("docs/codex/pr-train-state.json");
  });
});
