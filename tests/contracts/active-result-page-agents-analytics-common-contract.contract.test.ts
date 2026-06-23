import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";
const TRAIN_PATH = "docs/codex/pr-train.yaml";
const STATE_PATH = "docs/codex/pr-train-state.json";

const ACTIVE_TRAIN_IDS = [
  "ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01",
  "BIG5-ANALYTICS-CONSUMPTION-PACKET-01",
  "ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01",
  "RIASEC-ANALYTICS-CONSUMPTION-PACKET-01",
  "ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-MATRIX-01",
];

const EXPECTED_EVENT_FAMILIES = [
  "result_view",
  "full_report_view",
  "report_module_view",
  "pdf_click",
  "share_event",
  "share_summary_view",
  "second_test_click",
  "returning_user_signal",
  "career_exploration_click",
  "public_profile_click",
  "method_boundary_click",
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

describe("active result-page agents analytics common contract", () => {
  it("defines the receiving and upstream agent boundary", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(contract.schema_version).toBe("fermatmind.active_result_page_agents_analytics_common_contract.v1");
    expect(contract.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01");
    expect(contract.verdict).toBe("READY_TO_CONSUME_COMMON_ANALYTICS_CONTRACT");
    expect(contract.run_mode).toBe("docs_contracts_only");
    expect(contract.receiving_agent).toBe("analytics_gsc_opportunity");
    expect(asStringArray(contract.upstream_agents)).toEqual([
      "runtime_qa",
      "big_five_result_page",
      "enneagram_result_page",
      "riasec_result_page",
    ]);
  });

  it("declares the common event family vocabulary", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.event_family_vocabulary)).toEqual(EXPECTED_EVENT_FAMILIES);
  });

  it("allows only coarse public-safe common properties", () => {
    const contract = readJson(CONTRACT_PATH);
    const allowed = asStringArray(contract.common_allowed_properties);

    expect(allowed).toEqual(
      expect.arrayContaining([
        "scale_code",
        "agent_id",
        "locale",
        "surface",
        "event_version",
        "result_surface",
        "report_access_state",
        "access_state",
        "is_full_report_unlocked",
        "projection_version",
        "quality_state",
        "module_id",
        "module_slot",
        "bridge_entry",
        "example_kind",
        "redaction_state",
        "source_classification",
        "smoke_excluded",
        "qa_excluded",
      ])
    );
    expect(allowed).not.toEqual(expect.arrayContaining(["attempt_id", "user_id", "raw_scores", "report_token"]));
  });

  it("blocks private identifiers, raw result values, traces, and operational hashes", () => {
    const contract = readJson(CONTRACT_PATH);
    const forbidden = asStringArray(contract.common_forbidden_properties);

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "email",
        "phone",
        "account_id",
        "report_token",
        "private_url",
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
        "access_token",
        "cookie",
        "session_id",
        "release_hash",
        "registry_hash",
        "content_hash",
        "dominance_gap",
        "answer_key",
        "correct_answer",
      ])
    );
  });

  it("keeps QA, smoke, fixture, generated, and private URL observations excluded", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.smoke_qa_synthetic_exclusions)).toEqual(
      expect.arrayContaining([
        "production_activation_smoke_attempts",
        "codex_probe_anon_prefix",
        "codex_probe_session_prefix",
        "codex_probe_request_prefix",
        "qa_synthetic_attempts",
        "fixtures",
        "generated_readiness_artifacts",
        "staging_only_artifacts",
        "internal_preview_artifacts",
        "crawler_search_provider_behavior",
        "private_result_report_urls",
      ])
    );
  });

  it("defines source classifications without unlocking opportunity scoring", () => {
    const contract = readJson(CONTRACT_PATH);

    expect(asStringArray(contract.source_classification_vocabulary)).toEqual([
      "live_public",
      "backend_authority",
      "runtime_qa_artifact",
      "analytics_observation",
      "generated_artifact",
      "fixture",
      "mock",
      "unknown",
      "access_required",
    ]);
  });

  it("preserves hard negative guarantees and holds", () => {
    const contract = readJson(CONTRACT_PATH);
    const guarantees = asRecord(contract.negative_guarantees);

    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.fap_api_mutation).toBe("none");
    expect(asStringArray(contract.hard_holds)).toEqual(
      expect.arrayContaining([
        "analytics_runtime_implementation",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "gsc_ga4_provider_call",
        "search_channel_queue_mutation",
        "cms_write_import_publish_or_media_upload",
        "deploy_or_revalidation",
        "private_result_access",
        "generated_readiness_artifact_write",
      ])
    );
  });

  it("keeps active and parked result-page agent boundaries explicit", () => {
    const contract = readJson(CONTRACT_PATH);
    const active = asRecordArray(contract.active_agent_scope);
    const parked = asRecordArray(contract.parked_placeholder_scales);

    expect(active.map((row) => row.scale_code)).toEqual(["BIG5_OCEAN", "ENNEAGRAM", "RIASEC"]);
    expect(active.every((row) => row.analytics_common_status === "READY_TO_CONSUME")).toBe(true);
    expect(active.map((row) => row.required_packet_task_id)).toEqual([
      "BIG5-ANALYTICS-CONSUMPTION-PACKET-01",
      "ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01",
      "RIASEC-ANALYTICS-CONSUMPTION-PACKET-01",
    ]);
    expect(parked.map((row) => row.scale_code)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
    expect(parked.every((row) => row.status === "PARKED_PLACEHOLDER")).toBe(true);
  });

  it("keeps markdown aligned with the JSON contract", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_COMMON_ANALYTICS_CONTRACT`");
    expect(report).toContain("| Receiving agent | `analytics_gsc_opportunity` |");
    expect(report).toContain("| Upstream agent | `runtime_qa` |");
    expect(report).toContain("`MBTI`, `IQ_RAVEN`, and `EQ_60` remain `PARKED_PLACEHOLDER`");
    for (const eventFamily of EXPECTED_EVENT_FAMILIES) {
      expect(report).toContain(`\`${eventFamily}\``);
    }
    expect(report).toContain("no event emission");
    expect(report).toContain("no opportunity scoring");
    expect(report).toContain("no GSC, GA4, Search Console, Baidu, IndexNow, crawler, or provider call");
    expect(report).toContain("no generated readiness artifact write");
  });

  it("registers the authorized five-PR analytics train without adding runtime implementation ids", () => {
    const train = readText(TRAIN_PATH);
    const state = readJson(STATE_PATH);
    const stateEntries = [...asRecordArray(state.prs), ...asRecordArray(state.items)];

    for (const id of ACTIVE_TRAIN_IDS) {
      expect(train).toContain(`id: ${id}`);
      expect(stateEntries.some((entry) => entry.id === id)).toBe(true);
    }
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-RUNTIME-01");
    expect(train).not.toContain("ACTIVE-RESULT-PAGE-AGENTS-OPPORTUNITY-SCORING-01");
  });

  it("keeps current branch scope limited to the PR1 docs/contracts and train metadata", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_COMMON_CONTRACT_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-analytics-common-contract-01");
    expect(scopeHelper).toContain(
      "docs/result-page-agents/active-result-page-agents-analytics-common-contract-2026-06-23.md"
    );
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json");
    expect(scopeHelper).toContain("tests/contracts/active-result-page-agents-analytics-common-contract.contract.test.ts");
    expect(scopeHelper).toContain("docs/codex/pr-train.yaml");
    expect(scopeHelper).toContain("docs/codex/pr-train-state.json");
  });
});
