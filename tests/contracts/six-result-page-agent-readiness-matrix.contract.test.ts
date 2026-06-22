import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MATRIX_PATH = "docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json";
const REPORT_PATH = "docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md";
const TEMPLATE_PATH = "docs/result-page-agents/six-scale-result-agent-readiness.template.json";
const SCOPE_HELPER_PATH = "tests/contracts/helpers/currentPrScope.ts";

const SOURCE_PROPOSAL_PATHS = [
  "docs/result-page-agents/mbti-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/big-five-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/riasec-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/iq-raven-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/eq60-result-page-agent-readiness.proposal.json",
  "docs/result-page-agents/enneagram-result-page-agent-readiness.proposal.json",
];

const EXPECTED_SCALES = ["MBTI", "BIG5_OCEAN", "RIASEC", "IQ_RAVEN", "EQ_60", "ENNEAGRAM"];

const REQUIRED_CLASSIFICATIONS = [
  "current_readiness",
  "scaffold_alignment_status",
  "route_api_report_access_status",
  "frontend_renderer_status",
  "backend_authority_status",
  "pdf_boundary_status",
  "share_boundary_status",
  "private_noindex_status",
  "analytics_gate_status",
  "claim_privacy_safety_gate_status",
  "generated_readiness_artifact_status",
  "production_pilot_runtime_status",
];

const ALLOWED_VERDICTS = new Set([
  "READY_READONLY",
  "SCAFFOLD_READY",
  "STANDARD_ALIGNED",
  "NEEDS_READONLY_REVIEW",
  "NEEDS_RUNBOOK_SCHEMA_GATES",
  "BLOCKED_SHARE_SAFETY",
  "BLOCKED_PRIVATE_DATA",
  "HOLD_PRODUCTION",
  "HOLD_RUNTIME",
  "HOLD_CMS_SEARCH",
]);

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
  expect(match, `${scaleCode} matrix row missing`).toBeDefined();
  return asRecord(match);
}

describe("six-scale result-page agent readiness matrix", () => {
  it("is a complete docs/contracts matrix with all six canonical scales", () => {
    const matrix = readJson(MATRIX_PATH);
    const template = readJson(TEMPLATE_PATH);
    const scales = asRecordArray(matrix.scales);
    const templateScales = asRecordArray(template.scales);

    expect(matrix.schema_version).toBe("fermatmind.six_result_page_agent_readiness_matrix.v1");
    expect(matrix.run_mode).toBe("docs_contracts_readonly_synthesis");
    expect(matrix.verdict).toBe("SIX_RESULT_PAGE_AGENT_MATRIX_READY");
    expect(asStringArray(matrix.source_documents)).toEqual(
      expect.arrayContaining([
        "docs/result-page-agents/RESULT_PAGE_AGENT_PLATFORM_STANDARD.md",
        "docs/result-page-agents/six-scale-result-agent-readiness.template.json",
      ])
    );
    expect(scales.map((scale) => scale.scale_code)).toEqual(EXPECTED_SCALES);

    for (const scale of scales) {
      const templateScale = templateScales.find((entry) => entry.scale_code === scale.scale_code);
      expect(templateScale, `${String(scale.scale_code)} template row missing`).toBeDefined();
      expect(scale.agent_id).toBe(templateScale?.agent_id);
      expect(scale.canonical_test_slug).toBe(templateScale?.canonical_test_slug);
      for (const field of REQUIRED_CLASSIFICATIONS) {
        expect(scale, `${String(scale.scale_code)} missing ${field}`).toHaveProperty(field);
      }
    }
  });

  it("matches each source readiness proposal without reclassifying source truth", () => {
    const matrix = readJson(MATRIX_PATH);
    const scales = asRecordArray(matrix.scales);

    for (const sourcePath of SOURCE_PROPOSAL_PATHS) {
      const proposal = readJson(sourcePath);
      const matrixScale = byScale(scales, String(proposal.scale_code));

      expect(matrixScale.agent_id).toBe(proposal.agent_id);
      expect(matrixScale.canonical_test_slug).toBe(proposal.canonical_test_slug);
      expect(matrixScale.current_readiness).toBe(proposal.current_readiness);
      expect(JSON.stringify(matrixScale.source_artifacts)).toContain(sourcePath);
    }
  });

  it("uses only the approved readiness verdict vocabulary and keeps holds explicit", () => {
    const matrix = readJson(MATRIX_PATH);
    const scales = asRecordArray(matrix.scales);

    expect(new Set(asStringArray(matrix.verdict_vocabulary))).toEqual(ALLOWED_VERDICTS);
    expect(asStringArray(matrix.hard_holds)).toEqual(
      expect.arrayContaining([
        "no_cms",
        "no_publish",
        "no_search_submit",
        "no_provider_calls",
        "no_production_db_or_env",
        "no_private_result_access",
        "no_result_page_indexing",
        "no_deterministic_career_recommendation",
        "no_iq_eq_diagnostic_claim",
      ])
    );

    for (const scale of scales) {
      const verdicts = asStringArray(scale.verdicts);
      expect(verdicts.length, `${String(scale.scale_code)} verdicts missing`).toBeGreaterThan(0);
      for (const verdict of verdicts) {
        expect(ALLOWED_VERDICTS.has(verdict), verdict).toBe(true);
      }
      expect(verdicts).toEqual(expect.arrayContaining(["HOLD_PRODUCTION", "HOLD_RUNTIME", "HOLD_CMS_SEARCH"]));
      expect(asRecord(scale.generated_readiness_artifact_status).status).toBe("NOT_GENERATED");
      expect(String(asRecord(scale.production_pilot_runtime_status).status)).toContain("HOLD");
    }
  });

  it("separates scaffold-ready scales from standard-aligned read-only scales", () => {
    const matrix = readJson(MATRIX_PATH);
    const scales = asRecordArray(matrix.scales);

    for (const scaleCode of ["MBTI", "IQ_RAVEN", "EQ_60"]) {
      const scale = byScale(scales, scaleCode);
      expect(scale.current_readiness).toBe("missing_agent_stack");
      expect(scale.scaffold_alignment_status).toBe("SCAFFOLD_READY");
      expect(asStringArray(scale.verdicts)).toEqual(
        expect.arrayContaining(["SCAFFOLD_READY", "NEEDS_RUNBOOK_SCHEMA_GATES", "NEEDS_READONLY_REVIEW"])
      );
    }

    for (const scaleCode of ["BIG5_OCEAN", "RIASEC", "ENNEAGRAM"]) {
      const scale = byScale(scales, scaleCode);
      expect(scale.current_readiness).toBe("ready_readonly");
      expect(scale.scaffold_alignment_status).toBe("STANDARD_ALIGNED");
      expect(asStringArray(scale.verdicts)).toEqual(
        expect.arrayContaining(["READY_READONLY", "STANDARD_ALIGNED", "NEEDS_READONLY_REVIEW"])
      );
    }
  });

  it("keeps share and claim safety blockers visible for high-risk scales", () => {
    const matrix = readJson(MATRIX_PATH);
    const scales = asRecordArray(matrix.scales);
    const big5 = byScale(scales, "BIG5_OCEAN");
    const iq = byScale(scales, "IQ_RAVEN");
    const eq = byScale(scales, "EQ_60");
    const riasec = byScale(scales, "RIASEC");

    expect(asStringArray(big5.verdicts)).toContain("BLOCKED_SHARE_SAFETY");
    expect(String(asRecord(big5.share_boundary_status).evidence)).toContain("share_safety_missing_count=1");

    expect(asStringArray(iq.verdicts)).toContain("BLOCKED_SHARE_SAFETY");
    expect(String(asRecord(iq.claim_privacy_safety_gate_status).evidence)).toContain("no diagnostic");
    expect(String(asRecord(iq.claim_privacy_safety_gate_status).evidence)).toContain("no answer-key leakage");

    expect(asStringArray(eq.verdicts)).toContain("BLOCKED_SHARE_SAFETY");
    expect(String(asRecord(eq.claim_privacy_safety_gate_status).evidence)).toContain("no diagnostic");
    expect(String(asRecord(eq.claim_privacy_safety_gate_status).evidence)).toContain("no clinical/medical");

    expect(JSON.stringify(riasec.claim_privacy_safety_gate_status)).toContain("occupation examples examples-only");
    expect(JSON.stringify(riasec.claim_privacy_safety_gate_status)).toContain("deterministic career");
  });

  it("defines the next global task, repo splits, parallel windows, and next 10 goals", () => {
    const matrix = readJson(MATRIX_PATH);
    const sequencing = asRecord(matrix.cross_scale_sequencing);
    const nextGlobalTask = asRecord(sequencing.next_global_task);

    expect(nextGlobalTask.id).toBe("SIX-HUB-FREE-FULL-REPORT-RUNTIME-QA-01");
    expect(asStringArray(nextGlobalTask.required_checks)).toEqual(
      expect.arrayContaining(["pnpm typecheck", "pnpm test:contract", "git diff --check"])
    );
    expect(asRecordArray(sequencing.repo_split_tasks).length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(sequencing.repo_split_tasks)).toContain("fap-api first");
    expect(JSON.stringify(sequencing.parallel_windows)).toContain("MBTI-RESULT-PAGE-AGENT-RUNBOOK-SCHEMA-GATES-01");
    expect(JSON.stringify(sequencing.parallel_windows)).toContain("RIASEC-RESULT-PAGE-AGENT-READONLY-ROUTE-API-PDF-SHARE-REVIEW-01");
    expect(asStringArray(sequencing.hold_tasks)).toEqual(
      expect.arrayContaining([
        "CMS writes/import/publish/media upload",
        "result page indexing",
        "deterministic career recommendation or employment suitability output",
        "IQ/EQ diagnostic, clinical, admissions, hiring, certification, or guaranteed-outcome claims",
      ])
    );
    expect(asStringArray(sequencing.next_10_goals)).toHaveLength(10);
  });

  it("keeps the markdown report aligned with the machine-readable matrix", () => {
    const report = readText(REPORT_PATH);

    expect(report).toContain("Verdict: `SIX_RESULT_PAGE_AGENT_MATRIX_READY`");
    expect(report).toContain("| MBTI | `missing_agent_stack` | `SCAFFOLD_READY`");
    expect(report).toContain("| BIG5_OCEAN | `ready_readonly` | `STANDARD_ALIGNED`");
    expect(report).toContain("share_safety_missing_count=1");
    expect(report).toContain("## Cross-Scale Sequencing");
    expect(report).toContain("## Next 10 Goals");
    expect(report).toContain("## HOLD List");
    expect(report).toContain("It does not mean any result-page agent is production-ready.");
    expect(report).toContain("runtime code changed: no");
    expect(report).toContain("private result data accessed: none");
  });

  it("keeps current branch scope limited to the matrix docs and contract", () => {
    const scopeHelper = readText(SCOPE_HELPER_PATH);

    expect(scopeHelper).toContain("SIX_RESULT_PAGE_AGENT_READINESS_MATRIX_01_ALLOWED_FILES");
    expect(scopeHelper).toContain("codex/six-result-page-agent-readiness-matrix-01");
    expect(scopeHelper).toContain("docs/result-page-agents/six-result-page-agent-readiness-matrix-2026-06-23.md");
    expect(scopeHelper).toContain("docs/result-page-agents/six-result-page-agent-readiness-matrix.v1.json");
    expect(scopeHelper).toContain("tests/contracts/six-result-page-agent-readiness-matrix.contract.test.ts");
  });
});
