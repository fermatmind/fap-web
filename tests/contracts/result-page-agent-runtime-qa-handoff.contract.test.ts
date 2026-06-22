import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const HANDOFF_PATH = "docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json";
const REPORT_PATH = "docs/result-page-agents/result-page-agent-runtime-qa-handoff-2026-06-23.md";
const MATRIX_PATH = "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json";
const RUNTIME_QA_PATH = "docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json";
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
  expect(match, `${scaleCode} handoff row missing`).toBeDefined();
  return asRecord(match);
}

describe("result-page agent runtime QA handoff", () => {
  it("packages the readiness matrix and runtime QA refs without mutation authority", () => {
    const handoff = readJson(HANDOFF_PATH);
    const refs = asRecord(handoff.input_refs);
    const safety = asRecord(handoff.safety_confirmation);

    expect(handoff.schema_version).toBe("fermatmind.result_page_agent_runtime_qa_handoff.v1");
    expect(handoff.task_id).toBe("RESULT-PAGE-AGENT-RUNTIME-QA-HANDOFF-01");
    expect(handoff.verdict).toBe("RUNTIME_QA_HANDOFF_READY_WITH_LIMITS");
    expect(refs.six_scale_readiness_matrix).toBe(MATRIX_PATH);
    expect(refs.free_full_report_runtime_qa).toBe(RUNTIME_QA_PATH);
    expect(safety.runtime_code_changed).toBe("no");
    expect(safety.cms_writes).toBe("none");
    expect(safety.private_result_data_accessed).toBe("none");
    expect(safety.deployment_triggered).toBe("no");
    expect(safety.seo_search_mutation).toBe("none");
    expect(safety.production_import).toBe("none");
    expect(safety.rollout).toBe("none");
  });

  it("keeps handoff statuses aligned with source artifacts", () => {
    const handoff = readJson(HANDOFF_PATH);
    const matrix = readJson(MATRIX_PATH);
    const runtimeQa = readJson(RUNTIME_QA_PATH);
    const handoffScales = asRecordArray(handoff.per_scale_handoff);
    const matrixScales = asRecordArray(matrix.scales);
    const runtimeScales = asRecordArray(runtimeQa.scales);

    expect(handoffScales.map((scale) => scale.scale_code)).toEqual(EXPECTED_SCALES);

    for (const row of handoffScales) {
      const matrixRow = byScale(matrixScales, String(row.scale_code));
      const runtimeRow = byScale(runtimeScales, String(row.scale_code));
      expect(row.agent_id).toBe(matrixRow.agent_id);
      expect(row.agent_id).toBe(runtimeRow.agent_id);
    }
  });

  it("limits missing-agent-stack scales to scaffold-only handoff", () => {
    const handoff = readJson(HANDOFF_PATH);
    const rows = asRecordArray(handoff.per_scale_handoff);

    for (const scaleCode of ["MBTI", "IQ_RAVEN", "EQ_60"]) {
      const row = byScale(rows, scaleCode);
      expect(row.handoff_status).toBe("LIMITED_HANDOFF_SCAFFOLD_ONLY");
      expect(String(row.required_follow_up)).toContain("missing_agent_stack");
    }
  });

  it("preserves Big Five share-safety gap and RIASEC priority", () => {
    const handoff = readJson(HANDOFF_PATH);
    const rows = asRecordArray(handoff.per_scale_handoff);

    expect(byScale(rows, "BIG5_OCEAN").handoff_status).toBe("HANDOFF_READY_WITH_SHARE_SAFETY_GAP");
    expect(String(byScale(rows, "BIG5_OCEAN").runtime_qa_input_status)).toContain("share_safety_missing_count_1");
    expect(byScale(rows, "RIASEC").handoff_status).toBe("PRIORITY_HANDOFF_READY_READONLY");
  });

  it("defines Runtime QA allowed inputs and forbidden actions", () => {
    const handoff = readJson(HANDOFF_PATH);

    expect(asStringArray(handoff.runtime_qa_allowed_inputs)).toEqual(
      expect.arrayContaining([
        "six-scale readiness matrix",
        "free full report runtime QA artifact",
        "existing route/report/report-access contracts",
        "sanitized fixtures",
        "public-safe projection summaries",
      ])
    );
    expect(asStringArray(handoff.runtime_qa_forbidden_actions)).toEqual(
      expect.arrayContaining([
        "runtime code changes",
        "CMS writes/import/publish/media upload",
        "raw private attempt or result access",
        "private report URL/token/account payload access",
        "frontend fallback authority",
        "SEO/search mutation",
        "deployment",
        "production import",
        "production rollout",
      ])
    );
  });

  it("makes RIASEC route/API/PDF/share review the priority input", () => {
    const handoff = readJson(HANDOFF_PATH);
    const riasec = asRecord(handoff.riasec_priority_review);
    const bridge = asRecord(riasec.career_bridge_boundary);

    expect(riasec.status).toBe("PRIORITY_INPUT_FOR_RUNTIME_QA_AGENT");
    expect(asStringArray(riasec.surfaces)).toEqual(
      expect.arrayContaining([
        "private result route",
        "report API",
        "report-access API",
        "PDF behavior",
        "share behavior",
        "renderer dispatch",
        "private noindex boundary",
        "public projection v2/v1 consumption",
        "career-bridge boundary",
      ])
    );
    expect(asStringArray(riasec.surfaces).join(" ")).toContain("no raw score/vector/percentile");
    expect(bridge.allowed).toContain("examples-only");
    expect(asStringArray(bridge.forbidden)).toEqual(
      expect.arrayContaining(["deterministic career recommendations", "hiring screens", "salary prediction"])
    );
  });

  it("points to analytics handoff as the next task without doing analytics runtime work", () => {
    const handoff = readJson(HANDOFF_PATH);
    const next = asRecord(handoff.next_task);

    expect(next.id).toBe("RESULT-PAGE-AGENT-ANALYTICS-HANDOFF-01");
    expect(asStringArray(next.allowed_scope)).toContain("analytics event contract handoff");
    expect(asStringArray(next.forbidden_scope)).toEqual(
      expect.arrayContaining(["runtime analytics mutation", "provider calls", "private payload emission"])
    );
  });

  it("keeps the markdown report aligned with the handoff artifact", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `RUNTIME_QA_HANDOFF_READY_WITH_LIMITS`");
    expect(report).toContain("`docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json`");
    expect(report).toContain("`docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json`");
    expect(report).toContain("| RIASEC | `riasec_result_page` | `PRIORITY_HANDOFF_READY_READONLY`");
    expect(report).toContain("career-bridge boundary");
    expect(report).toContain("deterministic career recommendations");
    expect(report).toContain("runtime analytics mutation");
  });

  it("keeps current branch scope limited to the PR3 docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("RESULT_PAGE_AGENT_RUNTIME_QA_HANDOFF_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/result-page-agent-runtime-qa-handoff-01");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-runtime-qa-handoff-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/result-page-agent-runtime-qa-handoff.v1.json");
    expect(scopeHelper).toContain("tests/contracts/result-page-agent-runtime-qa-handoff.contract.test.ts");
  });
});
