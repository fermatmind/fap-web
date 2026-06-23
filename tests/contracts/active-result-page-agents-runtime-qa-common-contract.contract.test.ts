import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const EXPECTED_ASSERTIONS = [
  "route_contract",
  "report_api_contract",
  "report_access_api_contract",
  "renderer_dispatch",
  "pdf_private_print_boundary",
  "share_public_private_boundary",
  "private_result_noindex_boundary",
  "leak_boundary",
  "claim_privacy_safety_gate",
  "analytics_smoke_exclusion_gate",
];

const EXPECTED_STATUS = ["PASS", "PARTIAL", "HOLD", "BLOCKED", "READY_TO_CONSUME", "PARKED_PLACEHOLDER"];
const ACTIVE_TRAIN_IDS = [
  "ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-COMMON-CONTRACT-01",
  "BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01",
  "ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01",
  "RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01",
  "ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-MATRIX-01",
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

describe("active result-page agents Runtime QA common contract", () => {
  it("defines the receiving and producing agent boundary", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(contract.schema_version).toBe("fermatmind.active_result_page_agents_runtime_qa_common_contract.v1");
    expect(contract.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-COMMON-CONTRACT-01");
    expect(contract.verdict).toBe("READY_TO_CONSUME_COMMON_CONTRACT");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.receiving_agent).toBe("runtime_qa");
    expect(asStringArray(contract.producing_agents)).toEqual([
      "big_five_result_page",
      "enneagram_result_page",
      "riasec_result_page",
    ]);
  });

  it("keeps the active and parked scale boundaries explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const active = asRecordArray(contract.active_agent_scope);
    const parked = asRecordArray(contract.parked_placeholder_scales);

    expect(active.map((row) => row.scale_code)).toEqual(["BIG5_OCEAN", "ENNEAGRAM", "RIASEC"]);
    expect(active.every((row) => row.common_status === "READY_TO_CONSUME")).toBe(true);
    expect(active.map((row) => row.required_packet_task_id)).toEqual([
      "BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01",
      "ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01",
      "RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01",
    ]);
    expect(parked.map((row) => row.scale_code)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
    expect(parked.every((row) => row.status === "PARKED_PLACEHOLDER")).toBe(true);
  });

  it("declares the common assertion and status vocabulary", () => {
    const contract = readJson(CONTRACT_PATH);
    const assertions = asRecordArray(contract.assertion_vocabulary).map((row) => row.id);

    expect(assertions).toEqual(EXPECTED_ASSERTIONS);
    expect(asStringArray(contract.status_vocabulary)).toEqual(EXPECTED_STATUS);
  });

  it("allows only read-only public-safe Runtime QA inputs", () => {
    const contract = readJson(CONTRACT_PATH);
    const inputContract = asRecord(contract.runtime_qa_input_contract);

    expect(asStringArray(inputContract.allowed_inputs)).toEqual(
      expect.arrayContaining([
        "result_page_agent_readiness",
        "runtime_qa_handoff",
        "route_matrix_evidence",
        "report_api_contract_evidence",
        "report_access_api_contract_evidence",
        "renderer_dispatch_evidence",
        "pdf_private_print_boundary_evidence",
        "share_public_private_boundary_evidence",
        "private_result_noindex_evidence",
        "leak_boundary_evidence",
        "claim_privacy_safety_gate_evidence",
        "analytics_smoke_exclusion_evidence",
        "sanitized_fixture_render_evidence",
        "fap_api_readonly_authority_references_for_riasec",
      ])
    );
    expect(asStringArray(inputContract.forbidden_inputs)).toEqual(
      expect.arrayContaining([
        "raw_private_attempts",
        "private_result_payloads",
        "private_report_urls",
        "private_report_tokens",
        "account_payloads",
        "raw_score_vectors",
        "payment_or_order_data",
        "provider_responses",
        "production_database_state",
      ])
    );
  });

  it("preserves hard negative guarantees and holds", () => {
    const contract = readJson(CONTRACT_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.public_runtime_behavior_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submissions).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(asStringArray(contract.hard_holds)).toEqual(
      expect.arrayContaining([
        "runtime_qa_code_implementation",
        "cms_write_import_publish_or_media_upload",
        "search_channel_queue_mutation",
        "private_result_access",
        "generated_readiness_artifact_write",
        "deterministic_career_recommendation",
        "diagnosis_treatment_therapy_hiring_salary_performance_success_admission_ability_life_outcome_claim",
      ])
    );
  });

  it("keeps markdown aligned with the JSON contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_COMMON_CONTRACT`");
    expect(report).toContain("| Receiving agent | `runtime_qa` |");
    expect(report).toContain("| Producing agent | `big_five_result_page` |");
    expect(report).toContain("| Producing agent | `enneagram_result_page` |");
    expect(report).toContain("| Producing agent | `riasec_result_page` |");
    expect(report).toContain("`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`");
    for (const assertion of EXPECTED_ASSERTIONS) {
      expect(report).toContain(`\`${assertion}\``);
    }
    expect(report).toContain("no runtime code change");
    expect(report).toContain("no deterministic career recommendation");
  });

  it("registers the authorized five-PR train without adding future ids", () => {
    const train = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];

    for (const id of ACTIVE_TRAIN_IDS) {
      expect(train).toContain(`id: ${id}`);
      expect(stateEntries.some((entry) => entry.id === id)).toBe(true);
    }
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-RUNNER-01");
  });

  it("keeps current branch scope limited to the PR1 docs/contracts and train metadata", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_COMMON_CONTRACT_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-runtime-qa-common-contract-01");
    expect(scopeHelper).toContain(
      "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract-2026-06-23.md"
    );
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json");
    expect(scopeHelper).toContain("tests/contracts/active-result-page-agents-runtime-qa-common-contract.contract.test.ts");
    expect(scopeHelper).toContain("docs/codex/pr-train.yaml");
    expect(scopeHelper).toContain("docs/codex/pr-train-state.json");
  });
});
