import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-matrix.v1.json";
const REPORT_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-matrix-2026-06-23.md";
const COMMON_PATH = "docs/result-page-agents/active-result-page-agents-runtime-qa-common-contract.v1.json";
const BIG5_PACKET_PATH = "docs/result-page-agents/big5-runtime-qa-consumption-packet.v1.json";
const ENNEAGRAM_PACKET_PATH = "docs/result-page-agents/enneagram-runtime-qa-consumption-packet.v1.json";
const RIASEC_PACKET_PATH = "docs/result-page-agents/riasec-runtime-qa-consumption-packet.v1.json";
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
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function byScale(rows: Record<string, unknown>[], scaleCode: string): Record<string, unknown> {
  const match = rows.find((row) => row.scale_code === scaleCode);
  expect(match, `${scaleCode} row missing`).toBeDefined();
  return asRecord(match);
}

describe("active result-page agents Runtime QA matrix", () => {
  it("declares the aggregate matrix as docs/contracts-only", () => {
    const matrix = readJson(MATRIX_PATH);

    expect(matrix.schema_version).toBe("fermatmind.active_result_page_agents_runtime_qa_matrix.v1");
    expect(matrix.task_id).toBe("ACTIVE-RESULT-PAGE-AGENTS-RUNTIME-QA-MATRIX-01");
    expect(matrix.verdict).toBe("ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_READY");
    expect(matrix.run_mode).toBe("docs_contracts_only");
    expect(matrix.receiving_agent).toBe("runtime_qa");
  });

  it("uses the three merged active consumption packets as dependencies", () => {
    const matrix = readJson(MATRIX_PATH);
    const dependencies = asRecordArray(matrix.dependency_merges);

    expect(dependencies.map((dependency) => dependency.task_id)).toEqual([
      "BIG5-RUNTIME-QA-CONSUMPTION-PACKET-01",
      "ENNEAGRAM-RUNTIME-QA-CONSUMPTION-PACKET-01",
      "RIASEC-RUNTIME-QA-CONSUMPTION-PACKET-01",
    ]);
    expect(dependencies.map((dependency) => dependency.cleanup_status)).toEqual([
      "merged_cleanup_complete",
      "merged_cleanup_complete",
      "merged_cleanup_complete",
    ]);
    expect(dependencies.map((dependency) => dependency.merge_commit)).toEqual([
      "62e830e159ffca7921f20a03a55efb6c3245d8d3",
      "fbc7b075fbe1b45a21811d95889ab4df03a2fbca",
      "9bce941a8649e6b194c1d38572a292e74ffc9154",
    ]);
  });

  it("marks Big Five, Enneagram, and RIASEC ready for Runtime QA consumption", () => {
    const matrix = readJson(MATRIX_PATH);
    const big5Packet = readJson(BIG5_PACKET_PATH);
    const enneagramPacket = readJson(ENNEAGRAM_PACKET_PATH);
    const riasecPacket = readJson(RIASEC_PACKET_PATH);
    const agents = asRecordArray(matrix.active_agents);

    expect(byScale(agents, "BIG5_OCEAN").runtime_qa_consumability).toBe(big5Packet.verdict);
    expect(byScale(agents, "ENNEAGRAM").runtime_qa_consumability).toBe(enneagramPacket.verdict);
    expect(byScale(agents, "RIASEC").runtime_qa_consumability).toBe(riasecPacket.verdict);
    for (const agent of agents) {
      expect(agent.route_api_pdf_share_render_leak_claim_status, String(agent.scale_code)).toBe("PASS");
      expect(agent.analytics_status, String(agent.scale_code)).toBe("PASS_READONLY_HANDOFF");
    }
  });

  it("keeps MBTI, IQ_RAVEN, and EQ_60 parked placeholders", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_PATH);
    const parked = asRecordArray(matrix.parked_placeholders);

    expect(parked.map((row) => row.scale_code)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
    for (const row of parked) {
      expect(row.status, String(row.scale_code)).toBe("PARKED_PLACEHOLDER");
      expect(String(row.reason)).toContain("Not part of this active Runtime QA integration train");
    }
    expect(asRecordArray(common.parked_placeholder_scales).map((row) => row.scale_code)).toEqual(["MBTI", "IQ_RAVEN", "EQ_60"]);
  });

  it("preserves the common Runtime QA assertion vocabulary", () => {
    const matrix = readJson(MATRIX_PATH);
    const common = readJson(COMMON_PATH);

    expect(asStringArray(matrix.runtime_qa_common_assertions)).toEqual(
      asRecordArray(common.assertion_vocabulary).map((assertion) => String(assertion.id))
    );
  });

  it("keeps hard holds and negative guarantees closed", () => {
    const matrix = readJson(MATRIX_PATH);
    const guarantees = asRecord(matrix.negative_guarantees);

    expect(asStringArray(matrix.hard_holds)).toEqual(
      expect.arrayContaining([
        "runtime_qa_code_implementation",
        "cms_write_import_publish_or_media_upload",
        "search_submission_or_indexing_request",
        "provider_call",
        "deploy_or_revalidation",
        "private_result_access",
        "generated_readiness_artifact_write",
        "analytics_runtime_mutation",
        "career_graph_runtime_mutation",
        "public_personality_content_mutation",
        "deterministic_career_recommendation",
      ])
    );
    expect(guarantees.runtime_code_changed).toBe("no");
    expect(guarantees.cms_writes).toBe("none");
    expect(guarantees.search_submissions).toBe("none");
    expect(guarantees.deployment_triggered).toBe("no");
    expect(guarantees.private_result_data_accessed).toBe("none");
    expect(guarantees.generated_readiness_artifact_written).toBe("no");
    expect(guarantees.analytics_runtime_mutation).toBe("none");
  });

  it("allows only a later read-only Runtime QA report as the next safe task", () => {
    const matrix = readJson(MATRIX_PATH);
    const next = asRecord(matrix.next_safe_task);

    expect(next.task).toBe("Runtime QA Agent read-only runtime QA report");
    expect(next.status).toBe("ALLOWED_LATER_WITH_SEPARATE_AUTHORIZATION");
    expect(next.allowed_output).toBe("read_only_runtime_qa_report");
    expect(asStringArray(next.forbidden_outputs)).toEqual(
      expect.arrayContaining([
        "runtime QA implementation",
        "runtime analytics mutation",
        "CMS write",
        "publish",
        "search submission",
        "provider call",
        "deploy",
        "generated readiness artifact write",
        "private result access",
        "career graph runtime mutation",
        "public personality content mutation",
      ])
    );
  });

  it("records no sidecar issues", () => {
    const matrix = readJson(MATRIX_PATH);

    expect(asRecordArray(matrix.sidecar_issues)).toEqual([]);
  });

  it("keeps markdown aligned with the matrix", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_READY`");
    expect(report).toContain("| `BIG5_OCEAN` | `big_five_result_page` | `READY_TO_CONSUME_BY_RUNTIME_QA` |");
    expect(report).toContain("| `ENNEAGRAM` | `enneagram_result_page` | `READY_TO_CONSUME_BY_RUNTIME_QA` |");
    expect(report).toContain("| `RIASEC` | `riasec_result_page` | `READY_TO_CONSUME_BY_RUNTIME_QA` |");
    expect(report).toContain("| `MBTI` | `mbti_result_page` | `PARKED_PLACEHOLDER` |");
    expect(report).toContain("Runtime QA Agent read-only runtime QA report");
    expect(report).toContain("Sidecar Issues");
    expect(report).toContain("None.");
  });

  it("keeps current branch scope limited to the aggregate matrix files", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("ACTIVE_RESULT_PAGE_AGENTS_RUNTIME_QA_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/active-result-page-agents-runtime-qa-matrix-01");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-runtime-qa-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/active-result-page-agents-runtime-qa-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/active-result-page-agents-runtime-qa-matrix.contract.test.ts");
  });
});
