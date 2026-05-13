import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const MATRIX_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-fixture-matrix.v1.json");
const BASE_PROJECTION_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-v1.projection.json");

type Visibility = "visible" | "collapsed" | "hidden";
type DeepContentMode = "authored_subset" | "missing_envelope" | "pending_slots";

type MatrixCase = {
  id: string;
  coverage: string[];
  form_code: "riasec_60" | "riasec_140";
  profile_shape: string;
  quality_state: string;
  near_tie_state: string;
  alternate_codes?: string[];
  deep_content_mode: DeepContentMode;
  deep_slot_ids: string[];
  module_visibility: Record<string, Visibility>;
};

type FixtureMatrix = {
  schema_version: string;
  runtime_status: string;
  authority: {
    content_source: string;
    frontend_interpretation_inference_allowed: boolean;
    frontend_editorial_fallback_allowed: boolean;
    missing_content_behavior: string;
    pending_content_behavior: string;
  };
  career_boundary: {
    occupation_examples_policy: string;
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
  forbidden_claim_fragments: string[];
  cases: MatrixCase[];
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

function buildReport(projection: Record<string, unknown>): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: String((projection.form as { form_code?: unknown }).form_code ?? "riasec_60"),
      label: "RIASEC fixture",
      question_count: Number((projection.form as { question_count?: unknown }).question_count ?? 60),
      estimated_minutes: 8,
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

function projectionForCase(matrixCase: MatrixCase): Record<string, unknown> {
  const projection = clone(readJson<Record<string, unknown>>(BASE_PROJECTION_PATH));
  const form = projection.form as Record<string, unknown>;
  form.form_code = matrixCase.form_code;
  form.form_kind = matrixCase.form_code === "riasec_140" ? "contextual" : "standard";
  form.question_count = matrixCase.form_code === "riasec_140" ? 140 : 60;
  form.score_space_version = matrixCase.form_code === "riasec_140"
    ? "riasec_140_work_daily_context_space.v1"
    : "riasec_60_likert5_activity_sum_space.v1";
  form.compare_compatibility_group = `RIASEC:${matrixCase.form_code}:${form.score_space_version}`;

  const quality = projection.quality as Record<string, unknown>;
  quality.quality_state = matrixCase.quality_state;
  quality.grade = matrixCase.quality_state === "low_quality" ? "C" : "A";
  quality.low_quality_strength = matrixCase.quality_state === "low_quality"
    ? "low_quality_boundary_triggered"
    : "not_triggered";

  const interpretation = projection.interpretation_state as Record<string, unknown>;
  interpretation.profile_shape = matrixCase.profile_shape;
  interpretation.near_tie_state = {
    state: matrixCase.near_tie_state,
    dimensions: matrixCase.near_tie_state === "none" ? [] : ["I", "A"],
  };
  interpretation.alternate_code = {
    show: Boolean(matrixCase.alternate_codes?.length),
    codes: matrixCase.alternate_codes ?? [],
    display_boundary: matrixCase.alternate_codes?.length ? "reading aid only, not a measured result" : "",
  };

  const modulePolicy = projection.module_visibility_policy as Record<string, unknown>;
  modulePolicy.quality_state = matrixCase.quality_state;
  modulePolicy.profile_shape = matrixCase.profile_shape;
  modulePolicy.form_code = matrixCase.form_code;
  modulePolicy.modules = Object.entries(matrixCase.module_visibility).map(([key, visibility]) => ({
    key,
    visibility,
    reason: `${matrixCase.id}_${key}`,
  }));

  if (matrixCase.deep_content_mode === "missing_envelope") {
    delete projection.deep_content_slots_v1;
    return projection;
  }

  const envelope = projection.deep_content_slots_v1 as Record<string, unknown>;
  envelope.slots = (envelope.slots as Array<Record<string, unknown>>).filter((slot) =>
    matrixCase.deep_slot_ids.includes(String(slot.slot_id))
  );

  if (matrixCase.deep_content_mode === "pending_slots") {
    const firstSlot = clone((readJson<Record<string, unknown>>(BASE_PROJECTION_PATH).deep_content_slots_v1 as Record<string, unknown>).slots as Array<Record<string, unknown>>)[0];
    envelope.slots = [
      {
        ...firstSlot,
        status: "pending",
        content_status: "pending",
        content: {
          title: "Pending matrix slot should not render",
        },
      },
    ];
  }

  return projection;
}

describe("RIASEC deep copy fixture matrix", () => {
  it("covers required V11 deep-content runtime states", () => {
    const matrix = readJson<FixtureMatrix>(MATRIX_PATH);

    expect(matrix.schema_version).toBe("riasec.deep_copy_fixture_matrix.v1");
    expect(matrix.runtime_status).toBe("deep_copy_runtime_acceptance_fixture_matrix");
    expect(matrix.authority).toMatchObject({
      content_source: "riasec_public_projection_v2.deep_content_slots_v1",
      frontend_interpretation_inference_allowed: false,
      frontend_editorial_fallback_allowed: false,
      missing_content_behavior: "omit_module_fail_closed",
      pending_content_behavior: "omit_module_fail_closed",
    });
    expect(matrix.career_boundary).toMatchObject({
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
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
  });

  it("renders authored slots and fails closed for missing or pending matrix cases", () => {
    const matrix = readJson<FixtureMatrix>(MATRIX_PATH);

    for (const matrixCase of matrix.cases) {
      cleanup();
      const viewModel = assembleRiasecResultViewModel(buildReport(projectionForCase(matrixCase)));
      const renderedSlotIds = viewModel.deepContentSlots?.slots.map((slot) => slot.slotId) ?? [];

      expect(renderedSlotIds).toEqual(matrixCase.deep_slot_ids);
      expect(viewModel.moduleVisibilityPolicy?.fallbackPolicy.frontendInferenceAllowed).toBe(false);
      expect(viewModel.moduleVisibilityPolicy?.modules.find((module) => module.key === "unknown_future_module")).toBeUndefined();

      render(<RiasecResultShell locale="zh" viewModel={viewModel} />);

      if (matrixCase.deep_slot_ids.length === 0) {
        expect(screen.queryByTestId("riasec-deep-content-slots")).not.toBeInTheDocument();
        expect(screen.queryByText("Pending matrix slot should not render")).not.toBeInTheDocument();
      } else {
        expect(screen.getByTestId("riasec-deep-content-slots")).toBeInTheDocument();
        expect(screen.getAllByTestId("riasec-deep-content-slot")).toHaveLength(matrixCase.deep_slot_ids.length);
      }
    }
  });

  it("keeps examples-only career boundaries and blocks unsupported claim fragments", () => {
    const matrix = readJson<FixtureMatrix>(MATRIX_PATH);
    const examplesCase = matrix.cases.find((matrixCase) => matrixCase.id === "examples_only_career_content");
    if (!examplesCase) {
      throw new Error("missing examples-only career fixture case");
    }

    const viewModel = assembleRiasecResultViewModel(buildReport(projectionForCase(examplesCase)));
    expect(viewModel.activityExplorer).toMatchObject({
      status: "content_examples_only",
      sourceStatus: "content_example_not_registry_match",
      registrySourceConnected: false,
      fitScoreAllowed: false,
      successPredictionAllowed: false,
    });
    expect(viewModel.trustedResultCard).toMatchObject({
      rawScoreDeltaAllowed: false,
      occupationExamplesPolicy: matrix.career_boundary.occupation_examples_policy,
    });

    const scannedText = [
      readText("lib/riasec/resultAssembler.ts"),
      readText("components/result/riasec/RiasecResultShell.tsx"),
      readText("tests/contracts/fixtures/riasec/deep-copy-v1.projection.json"),
    ].join("\n");

    for (const fragment of matrix.forbidden_claim_fragments) {
      expect(scannedText).not.toContain(fragment);
    }
  });
});
