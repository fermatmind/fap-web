import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const PACKET_PATH = "docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json";
const REPORT_PATH = "docs/result-page-agents/enneagram-analytics-consumption-packet-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_EVENTS = [
  "enneagram_result_view",
  "enneagram_full_report_view",
  "enneagram_report_module_view",
  "enneagram_share_summary_view",
  "enneagram_second_test_click",
  "enneagram_public_profile_click",
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

describe("Enneagram analytics consumption packet", () => {
  it("defines the Enneagram analytics consumption boundary", () => {
    const packet = readJson(PACKET_PATH);

    expect(packet.schema_version).toBe("fermatmind.enneagram_analytics_consumption_packet.v1");
    expect(packet.task_id).toBe("ENNEAGRAM-ANALYTICS-CONSUMPTION-PACKET-01");
    expect(packet.verdict).toBe("READY_TO_CONSUME_BY_ANALYTICS");
    expect(packet.receiving_agent).toBe("analytics_gsc_opportunity");
    expect(packet.producing_agent).toBe("enneagram_result_page");
    expect(packet.scale_code).toBe("ENNEAGRAM");
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

  it("consumes public-safe runtime QA and personality-boundary evidence without promoting runtime use", () => {
    const packet = readJson(PACKET_PATH);
    const evidence = asRecord(packet.consumed_evidence);

    expect(evidence.runtime_qa_packet_verdict).toBe("READY_TO_CONSUME_BY_RUNTIME_QA");
    expect(evidence.readiness_verdict).toBe("ENNEAGRAM_RESULT_PAGE_AGENT_STANDARD_ALIGNED");
    expect(evidence.public_share_safe).toBe(true);
    expect(evidence.public_personality_boundary_ready).toBe(true);
    expect(evidence.ready_for_analytics_quality_report).toBe(true);
    expect(evidence.ready_for_event_emission).toBe(false);
    expect(evidence.ready_for_opportunity_scoring).toBe(false);
    expect(evidence.ready_for_production_metric_backfill).toBe(false);
  });

  it("blocks private result identifiers, score fields, dominance gaps, hashes, and metadata", () => {
    const packet = readJson(PACKET_PATH);

    expect(asStringArray(packet.forbidden_payload_fields)).toEqual(
      expect.arrayContaining([
        "attemptId",
        "attempt_id",
        "score",
        "raw_score",
        "score_vector",
        "dominance_gap",
        "release_hash",
        "raw_metadata",
        "internal_metadata",
        "private_result_payload",
        "private_report_text",
        "full_report_body_text",
        "report_token",
        "private_url",
        "account_id",
        "user_id",
        "payment_id",
        "order_id",
        "selector_trace",
        "source_refs",
        "qa_trace",
      ])
    );
  });

  it("keeps private result text out of public personality analytics", () => {
    const packet = readJson(PACKET_PATH);
    const boundary = asRecord(packet.public_personality_boundary);

    expect(boundary.private_result_text_becomes_public_profile_content).toBe(false);
    expect(boundary.public_profile_content_mutation).toBe("HOLD");
    expect(boundary.analytics_allowed).toBe("public profile click intent only");
    expect(asStringArray(boundary.blocked)).toEqual(
      expect.arrayContaining(["private result text publication", "public profile content mutation from private result payload"])
    );
  });

  it("blocks final type certainty and clinical or outcome claims", () => {
    const packet = readJson(PACKET_PATH);
    const claim = asRecord(packet.claim_boundary);

    expect(claim.status).toBe("PASS");
    expect(asStringArray(claim.forbidden_claims)).toEqual(
      expect.arrayContaining([
        "final type certainty",
        "fixed type certainty",
        "diagnosis",
        "therapy",
        "treatment",
        "hiring prediction",
        "salary prediction",
        "performance prediction",
        "success prediction",
        "admission prediction",
        "ability guarantee",
        "life-outcome guarantee",
      ])
    );
  });

  it("preserves generation, activation, runtime, CMS, search, analytics, and private-data holds", () => {
    const packet = readJson(PACKET_PATH);
    const guarantees = asRecord(packet.negative_guarantees);

    expect(asStringArray(packet.holds)).toEqual(
      expect.arrayContaining([
        "candidate_generation",
        "import",
        "activation",
        "runtime_switch",
        "public_profile_content_mutation",
        "cms",
        "search",
        "private_result_access",
        "event_emission",
        "production_metric_backfill",
        "opportunity_scoring",
        "provider_calls",
        "search_channel_mutation",
        "generated_readiness_artifact_write",
      ])
    );
    expect(guarantees.analytics_runtime_code_changed).toBe("no");
    expect(guarantees.event_emission).toBe("none");
    expect(guarantees.production_metric_backfill).toBe("none");
    expect(guarantees.opportunity_scoring).toBe("none");
    expect(guarantees.candidate_payload_generated).toBe("no");
    expect(guarantees.import_performed).toBe("no");
    expect(guarantees.activation_performed).toBe("no");
    expect(guarantees.runtime_switch_performed).toBe("no");
    expect(guarantees.raw_private_result_accessed).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.provider_calls).toBe("none");
  });

  it("keeps markdown aligned with the JSON packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_TO_CONSUME_BY_ANALYTICS`");
    for (const event of EXPECTED_EVENTS) {
      expect(report).toContain(`\`${event}\``);
    }
    expect(report).toContain("Private result text must not become public personality content");
    expect(report).toContain("final type certainty");
    expect(report).toContain("event emission");
    expect(report).toContain("opportunity scoring");
    expect(report).toContain("does not implement analytics runtime code");
  });

  it("keeps current branch scope registered for the Enneagram analytics PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ENNEAGRAM_ANALYTICS_CONSUMPTION_PACKET_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/enneagram-analytics-consumption-packet-01");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-analytics-consumption-packet-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json");
    expect(scopeHelper).toContain("tests/contracts/enneagram-analytics-consumption-packet.contract.test.ts");
  });
});
