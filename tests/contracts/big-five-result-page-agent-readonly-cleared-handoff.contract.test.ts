import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const HANDOFF_PATH = "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json";
const REPORT_PATH = "docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff-2026-06-23.md";
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
  return Array.isArray(value) ? value.map(String) : [];
}

describe("Big Five ready-readonly-cleared handoff", () => {
  it("reconciles stale share-safety evidence without granting runtime authority", () => {
    const handoff = readJson(HANDOFF_PATH);
    const reconciliation = asRecord(handoff.stale_evidence_reconciliation);
    const readiness = asRecord(handoff.readiness_state);

    expect(handoff.schema_version).toBe("fermatmind.big_five_result_page_agent_readonly_cleared_handoff.v1");
    expect(handoff.verdict).toBe("READY_READONLY_CLEARED");
    expect(handoff.scale_code).toBe("BIG5_OCEAN");
    expect(reconciliation.historical_state).toBe("BLOCKED_SHARE_SAFETY");
    expect(String(reconciliation.historical_evidence)).toContain("share_safety_missing_count=1");
    expect(reconciliation.current_state).toBe("READY_READONLY_CLEARED");
    expect(String(reconciliation.current_evidence)).toContain("share_safety_missing_count=0");
    expect(String(reconciliation.scope_of_clearance)).toBe("read-only share-safety conflict only");
    expect(readiness.share_safety_missing_count).toBe(0);
    expect(readiness.validation_error_count).toBe(0);
    expect(readiness.leak_hit_count).toBe(0);
    expect(readiness.ready_for_runtime).toBe(false);
    expect(readiness.ready_for_production).toBe(false);
    expect(readiness.production_use_allowed).toBe(false);
  });

  it("uses only sanitized fap-api evidence and keeps private data forbidden", () => {
    const handoff = readJson(HANDOFF_PATH);
    const sources = asRecordArray(handoff.source_evidence);
    const safety = asRecord(handoff.safety_confirmation);

    expect(handoff.authority_source).toContain("sanitized fap-api evidence");
    expect(sources.map((source) => source.repo)).toEqual(["fap-api", "fap-api"]);
    for (const source of sources) {
      expect(source.share_safety_missing_count).toBe(0);
      expect(source.validation_error_count).toBe(0);
      expect(source.leak_hit_count).toBe(0);
    }
    expect(safety.frontend_copy_added).toBe("no");
    expect(safety.runtime_code_changed).toBe("no");
    expect(safety.cms_writes).toBe("none");
    expect(safety.search_submissions).toBe("none");
    expect(safety.private_result_data_accessed).toBe("none");
    expect(safety.production_import).toBe("none");
    expect(safety.rollout).toBe("none");
    expect(safety.deployment_triggered).toBe("no");
  });

  it("defines the Big Five analytics handoff metrics and smoke exclusions", () => {
    const handoff = readJson(HANDOFF_PATH);
    const analytics = asRecord(handoff.analytics_handoff_packet);
    const metricIds = asRecordArray(analytics.metrics).map((metric) => metric.metric_id);

    expect(analytics.status).toBe("READY_READONLY_CLEARED_HANDOFF_ONLY");
    expect(metricIds).toEqual([
      "big5_full_report_view",
      "big5_pdf_click",
      "big5_share_event",
      "big5_second_test",
      "big5_returning_user",
    ]);
    expect(asStringArray(analytics.smoke_exclusion)).toEqual(
      expect.arrayContaining([
        "exclude smoke/test/QA/synthetic artifacts",
        "exclude fixture-marked runs",
        "exclude events with attempt id, user id, raw score, score vector, percentile, selector trace, private URL, report token, or raw payload",
        "exclude provider/search/deploy events",
      ])
    );
  });

  it("sets next-week GO/HOLD state explicitly", () => {
    const handoff = readJson(HANDOFF_PATH);
    const state = asRecord(handoff.next_week_state);

    expect(state.read_only_reconciliation).toBe("GO");
    expect(state.analytics_handoff).toBe("GO");
    expect(state.pilot).toBe("HOLD");
    expect(state.runtime_enablement).toBe("HOLD");
    expect(state.production_rollout).toBe("HOLD");
    expect(state.cms).toBe("HOLD");
    expect(state.search).toBe("HOLD");
    expect(state.private_result_data).toBe("HOLD");
  });

  it("keeps the markdown report aligned with the JSON packet", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `READY_READONLY_CLEARED`");
    expect(report).toContain("share_safety_missing_count=1");
    expect(report).toContain("share_safety_missing_count=0");
    expect(report).toContain("validation_error_count=0");
    expect(report).toContain("leak_hit_count=0");
    expect(report).toContain("`big5_full_report_view`");
    expect(report).toContain("`big5_pdf_click`");
    expect(report).toContain("`big5_share_event`");
    expect(report).toContain("`big5_second_test`");
    expect(report).toContain("`big5_returning_user`");
    expect(report).toContain("| Pilot | `HOLD` |");
    expect(report).toContain("private result data accessed: none");
  });

  it("keeps current branch scope limited to the Big Five handoff docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("BIG5_RESULT_PAGE_AGENT_READY_READONLY_CLEARED_HANDOFF_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/big5-ready-readonly-cleared-handoff");
    expect(scopeHelper).toContain("docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/big-five-result-page-agent-readonly-cleared-handoff.v1.json");
    expect(scopeHelper).toContain("tests/contracts/big-five-result-page-agent-readonly-cleared-handoff.contract.test.ts");
  });
});
