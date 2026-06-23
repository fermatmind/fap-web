import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/result-page-agents/active-result-page-agents-analytics-matrix.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-matrix-2026-06-23.md";
const COMMON_CONTRACT_PATH = "docs/result-page-agents/active-result-page-agents-analytics-common-contract.v1.json";
const BIG5_PACKET_PATH = "docs/result-page-agents/big5-analytics-consumption-packet.v1.json";
const ENNEAGRAM_PACKET_PATH = "docs/result-page-agents/enneagram-analytics-consumption-packet.v1.json";
const RIASEC_PACKET_PATH = "docs/result-page-agents/riasec-analytics-consumption-packet.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const ACTIVE_PACKET_PATHS = [BIG5_PACKET_PATH, ENNEAGRAM_PACKET_PATH, RIASEC_PACKET_PATH];
const PARKED_PLACEHOLDERS = ["MBTI", "IQ_RAVEN", "EQ_60"];

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

describe("active result-page agents analytics matrix", () => {
  it("declares the aggregate analytics matrix boundary", () => {
    const matrix = readJson(MATRIX_PATH);

    expect(matrix.schema_version).toBe("fermatmind.active_result_page_agents_analytics_matrix.v1");
    expect(matrix.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-MATRIX-01");
    expect(matrix.verdict).toBe("ACTIVE_ANALYTICS_MATRIX_READY");
    expect(matrix.receiving_agent).toBe("analytics_gsc_opportunity");
    expect(asRecord(matrix.common_contract).task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-ANALYTICS-COMMON-CONTRACT-01");
    expect(asRecord(matrix.common_contract).status).toBe("MERGED");
  });

  it("keeps exactly the three active result-page agents ready for analytics consumption", () => {
    const matrix = readJson(MATRIX_PATH);
    const activeAgents = asRecordArray(matrix.active_agents);

    expect(activeAgents.map((agent) => agent.packet_path)).toEqual(ACTIVE_PACKET_PATHS);
    expect(activeAgents.map((agent) => agent.analytics_status)).toEqual([
      "READY_TO_CONSUME_BY_ANALYTICS",
      "READY_TO_CONSUME_BY_ANALYTICS",
      "READY_TO_CONSUME_BY_ANALYTICS",
    ]);
    expect(activeAgents.every((agent) => agent.runtime_qa_handoff === "AVAILABLE")).toBe(true);
    expect(activeAgents.every((agent) => agent.ready_for_read_only_analytics_quality_report === true)).toBe(true);
  });

  it("matches each active packet verdict and scale code", () => {
    const matrix = readJson(MATRIX_PATH);
    const activeAgents = asRecordArray(matrix.active_agents);

    for (const agent of activeAgents) {
      const packet = readJson(String(agent.packet_path));
      expect(agent.analytics_status).toBe(packet.verdict);
      expect(agent.scale_code).toBe(packet.scale_code);
      expect(agent.packet_task_id).toBe(packet.task_id);
    }
  });

  it("keeps MBTI, IQ_RAVEN, and EQ_60 parked", () => {
    const matrix = readJson(MATRIX_PATH);
    const parked = asRecordArray(matrix.parked_placeholder_scales);

    expect(parked.map((item) => item.scale_code)).toEqual(PARKED_PLACEHOLDERS);
    expect(parked.every((item) => item.status === "PARKED_PLACEHOLDER")).toBe(true);
  });

  it("uses event families and packet event names without adding runtime emission", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const commonFamilies = new Set(asStringArray(common.event_family_vocabulary));
    const allPacketEvents = ACTIVE_PACKET_PATHS.flatMap((packetPath) => {
      const packet = readJson(packetPath);
      return asRecordArray(packet.analytics_events);
    });
    const matrixEvents = asRecordArray(matrix.event_matrix).flatMap((entry) => asStringArray(entry.events));

    for (const event of allPacketEvents) {
      expect(commonFamilies.has(String(event.event_family))).toBe(true);
      expect(matrixEvents).toContain(String(event.event_name));
    }
    expect(asRecord(matrix.negative_guarantees).event_emission).toBe("none");
    expect(asRecord(matrix.negative_guarantees).analytics_runtime_code_changed).toBe("no");
  });

  it("carries common allowlist, denylist, exclusions, and source classifications", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_CONTRACT_PATH);
    const properties = asRecord(matrix.property_matrix);
    const sourceClassifications = asRecordArray(matrix.source_classification_matrix);

    expect(asStringArray(properties.common_allowed_properties)).toEqual(
      expect.arrayContaining(asStringArray(common.common_allowed_properties))
    );
    expect(asStringArray(properties.common_forbidden_properties)).toEqual(
      expect.arrayContaining(["attempt_id", "raw_score", "score_vector", "private_url", "payment_id"])
    );
    expect(asStringArray(matrix.exclusion_matrix)).toEqual(
      expect.arrayContaining(asStringArray(common.smoke_qa_synthetic_exclusions))
    );
    expect(sourceClassifications.map((row) => row.source_classification)).toEqual(
      expect.arrayContaining(["runtime_qa_artifact", "backend_authority", "fixture", "generated_artifact", "access_required"])
    );
  });

  it("preserves GSC, Opportunity, Search Channel, CMS, deploy, provider, and private-data holds", () => {
    const matrix = readJson(MATRIX_PATH);
    const gsc = asRecord(matrix.gsc_opportunity_boundary);
    const search = asRecord(matrix.search_channel_boundary);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.hard_holds)).toEqual(
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
        "fap_api_mutation",
      ])
    );
    expect(gsc.opportunity_scoring_status).toBe("HOLD");
    expect(gsc.blocked_until).toBe("live_gsc_api_data_quality_passes");
    expect(gsc.live_provider_calls_performed).toBe(false);
    expect(search.status).toBe("HOLD");
    expect(search.requires_exact_approval).toBe(true);
    expect(search.queue_mutation_performed).toBe(false);
    expect(guarantees.provider_calls).toBe("none");
    expect(guarantees.search_channel_mutation).toBe("none");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
  });

  it("keeps sidecar empty because no external blocker was introduced", () => {
    const matrix = readJson(MATRIX_PATH);

    expect(matrix.sidecar_issues).toEqual([]);
  });

  it("keeps markdown aligned with the JSON matrix", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `ACTIVE_ANALYTICS_MATRIX_READY`");
    expect(report).toContain("`READY_TO_CONSUME_BY_ANALYTICS`");
    for (const scale of ["`BIG5_OCEAN`", "`ENNEAGRAM`", "`RIASEC`", "`MBTI`", "`IQ_RAVEN`", "`EQ_60`"]) {
      expect(report).toContain(scale);
    }
    expect(report).toContain("Opportunity scoring remains `HOLD`");
    expect(report).toContain("Search Channel enqueue/approve/submit remains `HOLD`");
    expect(report).toContain("does not implement analytics runtime code");
  });

  it("keeps current branch scope registered for the active analytics matrix PR", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_ANALYTICS_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-analytics-matrix-01");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-analytics-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-analytics-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/active-result-page-agents-analytics-matrix.contract.test.ts");
  });
});
