import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const DEEP_PROJECTION_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-v1.projection.json");
const MATRIX_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-fixture-matrix.v1.json");

type DeepSlot = Record<string, unknown>;

type FixtureMatrix = {
  authority: {
    frontend_interpretation_inference_allowed: boolean;
    frontend_editorial_fallback_allowed: boolean;
  };
  career_boundary: {
    examples_not_matches: boolean;
    fit_score_allowed: boolean;
    ranking_allowed: boolean;
    success_prediction_allowed: boolean;
  };
  feedback_boundary: {
    feedback_changes_measured_code: boolean;
    feedback_changes_scores: boolean;
    feedback_changes_snapshot: boolean;
  };
  cases: Array<{ id: string; coverage: string[] }>;
};

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function deepProjection(): Record<string, unknown> {
  return clone(readJson<Record<string, unknown>>(DEEP_PROJECTION_PATH));
}

function buildReport(projection: Record<string, unknown>): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: "riasec_140",
      label: "RIASEC 140Q",
      question_count: 140,
      estimated_minutes: 18,
    },
    riasec_public_projection_v1: {
      top_code: "IAS",
      primary_type: "I",
      secondary_type: "A",
      tertiary_type: "S",
      scores_0_100: { R: 42, I: 88, A: 74, S: 69, E: 36, C: 51 },
      clarity_index: 0.18,
      breadth_index: 0.67,
      quality_grade: "A",
      quality_flags: [],
      dimension_labels: {
        R: "现实型",
        I: "研究型",
        A: "艺术型",
        S: "社会型",
        E: "企业型",
        C: "常规型",
      },
    },
    riasec_public_projection_v2: projection,
  } as unknown as ReportResponse;
}

function add140QCardSlot(projection: Record<string, unknown>, slotKey: string, slotName: string, title: string): void {
  const envelope = projection.deep_content_slots_v1 as Record<string, unknown>;
  const slots = envelope.slots as DeepSlot[];
  const taskSlot = slots.find((slot) => slot.slot_key === "140q_task_card_copy");
  if (!taskSlot) {
    throw new Error("missing 140Q task slot fixture");
  }

  slots.push({
    ...clone(taskSlot),
    slot_key: slotKey,
    slot_id: `${slotKey}:${slotName}`,
    module_key: "140q_context_cards",
    status: "authored",
    content_status: "authored",
    frontend_fallback_allowed: false,
    state: {
      slot_name: slotName,
      layer_state: "agreement",
    },
    content: {
      title,
      question: `${title} question`,
      summary: `${title} summary`,
      what_user_sees: [`${title} signal`],
    },
  });
}

describe("RIASEC V11 deep copy smoke acceptance", () => {
  it("renders the backend-authoritative deep content smoke path without local editorial fallback", () => {
    const projection = deepProjection();
    add140QCardSlot(projection, "140q_environment_card_copy", "environment_card", "Backend fixture 140Q environment card");
    add140QCardSlot(projection, "140q_role_card_copy", "role_responsibility_card", "Backend fixture 140Q role card");

    const viewModel = assembleRiasecResultViewModel(buildReport(projection));

    expect(viewModel.deepContentSlots).toMatchObject({
      schemaVersion: "riasec.deep_content_slots.v1",
      contentAuthority: "backend_riasec_deep_copy_slot_registry",
      snapshotBound: true,
      sourcePolicy: {
        frontendFallbackAllowed: false,
        missingContentBehavior: "omit_module_fail_closed",
        pendingContentBehavior: "omit_module_fail_closed",
        unknownSlotBehavior: "hidden",
      },
      slotVisibilityPolicy: {
        frontendInferenceAllowed: false,
        hiddenSlotsOmitted: true,
        pendingOrUnavailableSlotsOmitted: true,
      },
    });
    expect(viewModel.moduleVisibilityPolicy?.fallbackPolicy.frontendInferenceAllowed).toBe(false);

    render(<RiasecResultShell locale="zh" viewModel={viewModel} attemptId="attempt_riasec_v11_smoke" />);

    expect(screen.getByTestId("riasec-trusted-result-card")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-deep-content-slots")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I dimension title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I_A blend title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture 140Q task card")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture 140Q environment card")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture 140Q role card")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture structure title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture aspirations title")).toBeInTheDocument();
  });

  it("freezes deep-copy state, share/PDF/history, and Technical Note acceptance coverage", () => {
    const matrix = readJson<FixtureMatrix>(MATRIX_PATH);
    const smokeSource = readText("tests/contracts/riasec-trusted-result-v15-smoke-acceptance.contract.test.ts");
    const covered = new Set(matrix.cases.flatMap((matrixCase) => matrixCase.coverage));

    [
      "clear_code",
      "blended_code",
      "broad_profile",
      "near_tie",
      "low_quality",
      "140Q layer narrative",
      "structural difference",
      "missing deep content slot",
      "examples-only career content",
    ].forEach((requiredCoverage) => {
      expect(covered.has(requiredCoverage), requiredCoverage).toBe(true);
    });

    expect(matrix.authority).toMatchObject({
      frontend_interpretation_inference_allowed: false,
      frontend_editorial_fallback_allowed: false,
    });
    expect(matrix.career_boundary).toMatchObject({
      examples_not_matches: true,
      fit_score_allowed: false,
      ranking_allowed: false,
      success_prediction_allowed: false,
    });
    expect(matrix.feedback_boundary).toMatchObject({
      feedback_changes_measured_code: false,
      feedback_changes_scores: false,
      feedback_changes_snapshot: false,
    });

    [
      "fetchAttemptResult",
      "fetchAttemptReport",
      "fetchAttemptReportAccess",
      "createAttemptShare",
      "getShareSummary",
      "getMyAttempts",
      "fetchAttemptReportPdfWithMeta",
      "fetchRiasecTechnicalNote",
      "snapshotBound: true",
      "rawScoreDeltaAllowed: false",
      "sharePdfExposureAllowed: false",
    ].forEach((requiredSmokeAssertion) => {
      expect(smokeSource).toContain(requiredSmokeAssertion);
    });
  });

  it("keeps no-go claims out of runtime source and backend-authority deep fixtures", () => {
    const runtimeAndFixtureText = [
      readText("lib/riasec/resultAssembler.ts"),
      readText("components/result/riasec/RiasecResultShell.tsx"),
      readText("tests/contracts/fixtures/riasec/deep-copy-v1.projection.json"),
    ].join("\n");

    [
      "Matches",
      "career recommendation",
      "job fit",
      "success probability",
      "hiring suitability",
      "140Q more accurate",
      "60Q/140Q raw delta",
      "更准确",
      "140Q 更准",
      "岗位匹配",
      "成功率",
      "招聘筛选",
    ].forEach((forbiddenClaim) => {
      expect(runtimeAndFixtureText).not.toContain(forbiddenClaim);
    });
  });
});
