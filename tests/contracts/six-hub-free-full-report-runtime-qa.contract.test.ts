import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const QA_PATH = "docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json";
const REPORT_PATH = "docs/result-page-agents/six-hub-free-full-report-runtime-qa-2026-06-23.md";
const MATRIX_PATH = "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const EXPECTED_SCALES = ["MBTI", "BIG5_OCEAN", "RIASEC", "IQ_RAVEN", "EQ_60", "ENNEAGRAM"];
const REQUIRED_SURFACES = [
  "private_result_route",
  "report_api",
  "report_access_api",
  "pdf_behavior",
  "share_behavior",
  "renderer_dispatch",
  "private_noindex_boundary",
  "no_raw_private_leak",
  "no_frontend_fallback_authority",
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

function byScale(scales: Record<string, unknown>[], scaleCode: string): Record<string, unknown> {
  const match = scales.find((scale) => scale.scale_code === scaleCode);
  expect(match, `${scaleCode} QA row missing`).toBeDefined();
  return asRecord(match);
}

describe("six-hub free full report runtime QA", () => {
  it("records a read-only QA artifact for all six scales", () => {
    const qa = readJson(QA_PATH);
    const scales = asRecordArray(qa.scales);

    expect(qa.schema_version).toBe("fermatmind.six_hub_free_full_report_runtime_qa.v1");
    expect(qa.task_id).toBe("SIX-HUB-FREE-FULL-REPORT-RUNTIME-QA-01");
    expect(qa.run_mode).toBe("docs_contracts_readonly_runtime_qa_synthesis");
    expect(qa.verdict).toBe("SIX_HUB_FREE_FULL_REPORT_RUNTIME_QA_READY_WITH_LIMITS");
    expect(scales.map((scale) => scale.scale_code)).toEqual(EXPECTED_SCALES);
    expect(asStringArray(qa.runtime_qa_surfaces)).toEqual(REQUIRED_SURFACES);
  });

  it("keeps runtime QA aligned with the readiness matrix classifications", () => {
    const qa = readJson(QA_PATH);
    const matrix = readJson(MATRIX_PATH);
    const qaScales = asRecordArray(qa.scales);
    const matrixScales = asRecordArray(matrix.scales);

    for (const qaScale of qaScales) {
      const matrixScale = byScale(matrixScales, String(qaScale.scale_code));
      expect(qaScale.agent_id).toBe(matrixScale.agent_id);
      expect(qaScale.canonical_test_slug).toBe(matrixScale.canonical_test_slug);
      expect(qaScale.readiness_from_matrix).toBe(matrixScale.current_readiness);
    }
  });

  it("covers the required free full report surfaces without adding fallback authority", () => {
    const qa = readJson(QA_PATH);

    for (const scale of asRecordArray(qa.scales)) {
      for (const surface of REQUIRED_SURFACES.slice(0, 6)) {
        expect(scale, `${String(scale.scale_code)} missing ${surface}`).toHaveProperty(surface);
      }
      expect(scale.private_noindex_boundary).toMatch(/MAPPED|DOC_MATCH/);
      expect(scale.no_raw_private_leak).toBe("MAPPED_BY_EXISTING_CONTRACTS");
      expect(scale.frontend_fallback_authority).toBe("NOT_ALLOWED");
    }
  });

  it("does not promote missing agent stack scales to ready", () => {
    const qa = readJson(QA_PATH);
    const scales = asRecordArray(qa.scales);

    for (const scaleCode of ["MBTI", "IQ_RAVEN", "EQ_60"]) {
      const scale = byScale(scales, scaleCode);
      expect(scale.readiness_from_matrix).toBe("missing_agent_stack");
      expect(scale.runtime_qa_status).toBe("LIMITED_SCAFFOLD_ONLY");
      expect(asStringArray(scale.qa_limitations).join(" ")).toContain("Dedicated");
    }
  });

  it("keeps ready-readonly scales as QA inputs while recognizing Big Five cleared evidence", () => {
    const qa = readJson(QA_PATH);
    const scales = asRecordArray(qa.scales);

    expect(byScale(scales, "RIASEC").runtime_qa_status).toBe("READONLY_QA_INPUT_READY");
    expect(byScale(scales, "ENNEAGRAM").runtime_qa_status).toBe("READONLY_QA_INPUT_READY");

    const big5 = byScale(scales, "BIG5_OCEAN");
    expect(big5.readiness_from_matrix).toBe("ready_readonly_cleared");
    expect(big5.runtime_qa_status).toBe("READONLY_QA_INPUT_READY_CLEARED");
    expect(JSON.stringify(big5.share_behavior)).toContain("share_safety_missing_count=0");
    expect(JSON.stringify(big5.qa_limitations)).toContain("Pilot, runtime, production, CMS, search, and private result data remain held");
  });

  it("preserves hard no-mutation and no-private-access boundaries", () => {
    const qa = readJson(QA_PATH);
    const safety = asRecord(qa.safety_confirmation);

    expect(safety.runtime_code_changed).toBe("no");
    expect(safety.cms_writes).toBe("none");
    expect(safety.private_result_data_accessed).toBe("none");
    expect(safety.provider_calls).toBe("none");
    expect(safety.search_submissions).toBe("none");
    expect(safety.seo_runtime_mutation).toBe("none");
    expect(safety.deployment_triggered).toBe("no");
    expect(safety.frontend_fallback_authority_added).toBe("no");
    expect(asStringArray(qa.hard_holds)).toEqual(
      expect.arrayContaining([
        "no_runtime_change",
        "no_cms_write",
        "no_private_result_access",
        "no_deploy",
        "no_search_or_seo_mutation",
        "no_provider_call",
        "no_production_import",
        "no_rollout",
        "no_frontend_fallback_authority",
      ])
    );
  });

  it("defines the Runtime QA handoff contract", () => {
    const qa = readJson(QA_PATH);
    const handoff = asRecord(qa.handoff);

    expect(handoff.next_task_id).toBe("RESULT-PAGE-AGENT-RUNTIME-QA-HANDOFF-01");
    expect(asStringArray(handoff.allowed_inputs)).toEqual(
      expect.arrayContaining(["this runtime QA artifact", "six-scale readiness matrix", "sanitized fixtures only"])
    );
    expect(asStringArray(handoff.forbidden_actions)).toEqual(
      expect.arrayContaining([
        "runtime code changes",
        "CMS writes",
        "private result access",
        "SEO/search mutation",
        "deployment",
        "production import",
        "rollout",
      ])
    );
  });

  it("keeps the markdown report aligned with the machine-readable artifact", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `SIX_HUB_FREE_FULL_REPORT_RUNTIME_QA_READY_WITH_LIMITS`");
    expect(report).toContain("| MBTI | `mbti_result_page` | `missing_agent_stack` | `LIMITED_SCAFFOLD_ONLY`");
    expect(report).toContain("| RIASEC | `riasec_result_page` | `ready_readonly` | `READONLY_QA_INPUT_READY`");
    expect(report).toContain("| BIG5_OCEAN | `big_five_result_page` | `ready_readonly_cleared` | `READONLY_QA_INPUT_READY_CLEARED`");
    expect(report).toContain("share_safety_missing_count=0");
    expect(report).toContain("frontend fallback authority not allowed");
    expect(report).toContain("No private attempt was accessed");
    expect(report).toContain("no runtime change");
    expect(report).toContain("no production import");
  });

  it("keeps current branch scope limited to the PR2 docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("SIX_HUB_FREE_FULL_REPORT_RUNTIME_QA_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/six-hub-free-full-report-runtime-qa-01");
    expect(scopeHelper).toContain("docs/result-page-agents/six-hub-free-full-report-runtime-qa-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/six-hub-free-full-report-runtime-qa.v1.json");
    expect(scopeHelper).toContain("tests/contracts/six-hub-free-full-report-runtime-qa.contract.test.ts");
  });
});
