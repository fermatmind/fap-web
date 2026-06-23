import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/big5-analytics-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/big5-analytics-consumption-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_EVENTS = [
  "big5_result_view",
  "big5_full_report_view",
  "big5_report_module_view",
  "big5_pdf_click",
  "big5_share_event",
  "big5_second_test_click",
  "big5_returning_user_signal",
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

describe("Big Five analytics consumption packet", () => {
  it("defines the Big Five analytics consumption boundary", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.big5_analytics_consumption_packet.v1");
    expect(packet.task_id).toBe("BIG5-ANALYTICS-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
    expect(packet.receiving_agent).toBe("analytics_gsc_opportunity");
    expect(packet.producing_agent).toBe("big_five_result_page");
    expect(packet.scale_code).toBe("BIG5_OCEAN");
    expect(asRecord(packet.dependency).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01");
    expect(asRecord(packet.dependency).status).toBe("MERGED");
  });

  it("uses only event families declared by the common analytics contract", () => {
    const packet = readJson(PACKET_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const commonFamilies = new Set(asStringArray(common.event_family_vocabulary));
    const events = asRecordArray(packet.analytics_events);

    expect(events.map((event) => event.event_name)).toEqual(EXPECTED_EVENTS);
    for (const event of events) {
      expect(commonFamilies.has(String(event.event_family))).toBe(true);
    }
  });

  it("carries the cleared read-only Big Five evidence without promoting runtime use", () => {
    const packet = readJson(PACKET_PATH);
    const evidence = asRecord(packet.consumed_evidence);
    const sanitized = asRecordArray(evidence.sanitized_fap_api_evidence);

    expect(evidence.result_page_handoff_verdict).toBe("READY_READONLY_CLEARED");
    expect(evidence.runtime_qa_packet_verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(evidence.analytics_handoff_status).toBe("READY_READONLY_CLEARED_HANDOFF_ONLY");
    expect(evidence.ready_for_analytics_quality_report).toBe(true);
    expect(evidence.ready_for_event_emission).toBe(false);
    expect(evidence.ready_for_opportunity_scoring).toBe(false);
    expect(evidence.ready_for_production_metric_backfill).toBe(false);
    expect(sanitized.every((row) => row.share_safety_missing_count === 0)).toBe(true);
    expect(sanitized.every((row) => row.validation_error_count === 0)).toBe(true);
    expect(sanitized.every((row) => row.leak_hit_count === 0)).toBe(true);
  });

  it("blocks raw OCEAN, vector, private payload, identifier, and token fields", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_payload_fields)).toEqual(
      expect.arrayContaining([
        "raw_ocean_scores",
        "raw_scores",
        "score_vector",
        "dimension_vector",
        "percentile",
        "attempt_id",
        "user_id",
        "account_id",
        "report_token",
        "private_url",
        "private_result_payload",
        "full_report_body_text",
        "selector_trace",
        "source_refs",
        "qa_trace",
        "order_id",
        "payment_id",
        "access_token",
        "cookie",
        "session_id",
      ])
    );
  });

  it("excludes smoke, QA, fixture, generated, provider, and private URL observations", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.smoke_qa_synthetic_exclusions)).toEqual(
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

  it("preserves analytics, production, CMS, search, provider, and private-data holds", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "pilot",
        "runtime_enablement",
        "production_rollout",
        "cms",
        "search",
        "private_result_data",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "provider_calls",
        "search_channel_mutation",
        "generated_readiness_artifact_write",
        "fap_api_mutation",
      ])
    );
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.fap_api_mutation).toBe("none");
  });

  it("keeps markdown aligned with the JSON packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_ANALYTICS`");
    expect(report).toContain("`share_safety_missing_count=0`");
    for (const event of EXPECTED_EVENTS) {
      expect(report).toContain(`\`${event}\``);
    }
    expect(report).toContain("no deterministic recommendation");
    expect(report).toContain("event emission");
    expect(report).toContain("opportunity scoring");
    expect(report).toContain("does not implement analytics runtime code");
  });

  it("keeps current branch scope registered for the Big Five analytics PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("BIG5_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/big5-analytics-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/big5-analytics-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/big5-analytics-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/big5-analytics-consumption-packet.contract.test.ts");
  });
});
