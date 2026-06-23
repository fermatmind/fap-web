import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const HANDOFF_PATH = "docs/result-page-agents/result-page-agent-analytics-handoff.v1.json";
const REPORT_PATH = "docs/result-page-agents/result-page-agent-analytics-handoff-2026-06-23.md";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_SCALES = ["MBTI", "BIG5_OCEAN", "RIASEC", "IQ_RAVEN", "EQ_60", "ENNEAGRAM"];

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

function byScale(scales: Record<string, unknown>[], scaleCode: string): Record<string, unknown> {
  const match = scales.find((scale) => scale.scale_code === scaleCode);
  expect(match, `${scaleCode} analytics row missing`).toBeDefined();
  return asRecord(match);
}

describe("result-page agent analytics handoff", () => {
  it("defines a read-only analytics handoff without runtime mutation", () => {
    const handoff = readJson(HANDOFF_PATH);
    const safety = asRecord(handoff.safety_confirmation);

    expect(handoff.schema_version).toBe("fermatmind.result_page_agent_analytics_handoff.v1");
    expect(handoff.task_id).toBe("RESULT-PAGE-AGENT-ANALYTICS-HANDOFF-01");
    expect(handoff.verdict).toBe("ANALYTICS_HANDOFF_READY_NO_RUNTIME_MUTATION");
    expect(safety.runtime_analytics_mutation).toBe("none");
    expect(safety.provider_calls).toBe("none");
    expect(safety.private_payload_emitted).toBe("none");
    expect(safety.cms_writes).toBe("none");
    expect(safety.production_import).toBe("none");
    expect(safety.rollout).toBe("none");
  });

  it("allows only coarse result-page event classes", () => {
    const handoff = readJson(HANDOFF_PATH);

    expect(asStringArray(handoff.allowed_event_classes)).toEqual([
      "result_page_view",
      "result_module_view",
      "result_report_access_state",
      "result_pdf_action_intent",
      "result_share_action_intent",
      "result_compare_action_intent",
      "result_history_action_intent",
      "result_redaction_state",
      "result_error_boundary",
    ]);
  });

  it("blocks private payload fields across result-page analytics", () => {
    const handoff = readJson(HANDOFF_PATH);
    const forbidden = asStringArray(handoff.forbidden_private_payload_fields);

    expect(forbidden).toEqual(
      expect.arrayContaining([
        "attempt_id",
        "user_id",
        "report_token",
        "report_url",
        "raw_score",
        "raw_scores",
        "score_vector",
        "percentile",
        "answer_key",
        "responses",
        "selector_trace",
        "qa_trace",
        "source_refs",
        "private_result_payload",
        "payment_id",
        "order_id",
      ])
    );
  });

  it("keeps smoke tests from causing provider calls or private emissions", () => {
    const handoff = readJson(HANDOFF_PATH);

    expect(asStringArray(handoff.smoke_test_exclusions)).toEqual(
      expect.arrayContaining([
        "no provider call",
        "no analytics runtime mutation",
        "no real user identifiers",
        "no raw private result payload",
        "no search submission",
        "no production import",
        "no rollout",
      ])
    );
  });

  it("records per-scale analytics readiness without promoting scaffold-only scales", () => {
    const handoff = readJson(HANDOFF_PATH);
    const rows = asRecordArray(handoff.per_scale_analytics_readiness);

    expect(rows.map((row) => row.scale_code)).toEqual(EXPECTED_SCALES);
    for (const scaleCode of ["MBTI", "IQ_RAVEN", "EQ_60"]) {
      expect(byScale(rows, scaleCode).analytics_readiness).toBe("LIMITED_SCAFFOLD_ONLY");
    }
    expect(byScale(rows, "RIASEC").analytics_readiness).toBe("PRIORITY_READONLY_HANDOFF");
    expect(byScale(rows, "BIG5_OCEAN").analytics_readiness).toBe("READONLY_HANDOFF_CLEARED");
  });

  it("defines the Big Five analytics handoff plan without private emissions", () => {
    const handoff = readJson(HANDOFF_PATH);
    const plan = asRecord(handoff.big_five_analytics_handoff_plan);
    const metricIds = asRecordArray(plan.metrics).map((metric) => metric.metric_id);

    expect(plan.status).toBe("READY_READONLY_CLEARED_HANDOFF_ONLY");
    expect(metricIds).toEqual([
      "big5_full_report_view",
      "big5_pdf_click",
      "big5_share_event",
      "big5_second_test",
      "big5_returning_user",
    ]);
    expect(asStringArray(plan.smoke_exclusion_policy)).toEqual(
      expect.arrayContaining([
        "exclude smoke/test/QA/synthetic artifacts",
        "exclude events with private identifiers or raw result payload fields",
      ])
    );
    expect(asStringArray(plan.holds)).toEqual(
      expect.arrayContaining(["no pilot", "no runtime enablement", "no production rollout", "no CMS", "no search", "no private result data"])
    );
  });

  it("sets the RIASEC career bridge analytics boundary", () => {
    const handoff = readJson(HANDOFF_PATH);
    const boundary = asRecord(handoff.riasec_career_bridge_analytics_boundary);

    expect(asStringArray(boundary.allowed_summary)).toEqual(
      expect.arrayContaining([
        "public-safe interest structure label",
        "coarse result module impression",
        "redaction state",
        "share/PDF/history/compare intent without private identifiers",
      ])
    );
    expect(asStringArray(boundary.forbidden_emission)).toEqual(
      expect.arrayContaining([
        "raw scores",
        "score vectors",
        "percentiles",
        "attempt id",
        "user id",
        "private report payload",
        "selector trace",
        "deterministic career recommendation",
        "admissions/hiring/salary/performance/success/ability guarantee",
      ])
    );
  });

  it("hands off to SEO control without doing SEO or provider work", () => {
    const handoff = readJson(HANDOFF_PATH);
    const next = asRecord(handoff.next_task);

    expect(next.id).toBe("RESULT-PAGE-AGENT-SEO-CONTROL-HANDOFF-01");
    expect(asStringArray(next.allowed_scope)).toContain("private result noindex control handoff");
    expect(asStringArray(next.forbidden_scope)).toEqual(
      expect.arrayContaining([
        "sitemap mutation",
        "robots mutation",
        "llms mutation",
        "schema or JSON-LD mutation",
        "hreflang mutation",
        "Search Queue enqueue/approve/submit",
        "GSC/Baidu/IndexNow provider call",
      ])
    );
  });

  it("keeps the markdown report aligned with the analytics artifact", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `ANALYTICS_HANDOFF_READY_NO_RUNTIME_MUTATION`");
    expect(report).toContain("runtime analytics mutation: none");
    expect(report).toContain("`result_page_view`");
    expect(report).toContain("`raw_scores`");
    expect(report).toContain("| BIG5_OCEAN | `big_five_result_page` | `READONLY_HANDOFF_CLEARED`");
    expect(report).toContain("`big5_full_report_view`");
    expect(report).toContain("`big5_returning_user`");
    expect(report).toContain("| RIASEC | `riasec_result_page` | `PRIORITY_READONLY_HANDOFF`");
    expect(report).toContain("interest structure may be summarized as public-safe coarse labels");
    expect(report).toContain("no provider call");
    expect(report).toContain("GSC/Baidu/IndexNow provider call");
  });

  it("keeps current branch scope limited to the PR4 docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RESULT_PAGE_AGENT_ANALYTICS_HANDOFF_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/result-page-agent-analytics-handoff-01");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-analytics-handoff-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-analytics-handoff.v1.json");
    expect(scopeHelper).toContain("tests/contracts/result-page-agent-analytics-handoff.contract.test.ts");
  });
});
