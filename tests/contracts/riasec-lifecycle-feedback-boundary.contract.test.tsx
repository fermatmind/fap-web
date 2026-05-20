import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/lifecycle-feedback-boundaries.projection.json");

function readProjection(): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as Record<string, unknown>;
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
      scores_0_100: { R: 41, I: 88, A: 77, S: 70, E: 38, C: 53 },
      clarity_index: 0.16,
      breadth_index: 0.63,
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

describe("RIASEC lifecycle and feedback boundary consumption", () => {
  it("parses safe lifecycle metadata and safe feedback boundary metadata without rendering deferred modules", () => {
    const viewModel = assembleRiasecResultViewModel(buildReport(readProjection()));

    expect(viewModel.lifecycleCopy).toMatchObject({
      schemaVersion: "riasec.lifecycle_copy.v1",
      contentAuthority: "backend_riasec_lifecycle_assets",
      status: "available",
      snapshotBound: true,
      frontendFallbackAllowed: false,
      measuredPayloadMutationAllowed: false,
      reportSnapshotMutationAllowed: false,
      rawFeedbackPublicExposureAllowed: false,
      internalSnapshotIdPublicExposureAllowed: false,
      lifeStagePublicExposureAllowed: false,
      organizationContextPublicExposureAllowed: false,
    });
    expect(viewModel.lifecycleCopy?.surfaces).toHaveLength(1);
    expect(viewModel.lifecycleCopy?.faqItems).toHaveLength(1);

    expect(viewModel.feedbackOverlay?.actionLab).toMatchObject({
      schemaVersion: "riasec.feedback_action_lab_payload.v1",
      status: "available_static_safe_bridge",
      frontendRendererRequiredForVisibleModule: true,
      publicRawFeedbackAllowed: false,
      affectsMeasuredCode: false,
      affectsScore: false,
      affectsSnapshot: false,
      sharePdfHistoryMeasuredPayloadMutationAllowed: false,
      starterActionCount: 1,
    });
    expect(viewModel.feedbackOverlay?.nextExplorationNodes).toMatchObject({
      schemaVersion: "riasec.next_exploration_nodes_payload.v1",
      status: "available_static_safe_bridge",
      selectionMode: "top_code_dimension_static_starter_nodes_without_feedback_read_model",
      frontendRendererRequiredForVisibleModule: true,
      publicRawFeedbackAllowed: false,
      affectsMeasuredCode: false,
      affectsScore: false,
      affectsSnapshot: false,
      createsCareerMatch: false,
      sharePdfHistoryMeasuredPayloadMutationAllowed: false,
      nodeCount: 1,
    });

    render(<RiasecResultShell locale="zh" viewModel={viewModel} attemptId="attempt_riasec_lifecycle_feedback" />);

    expect(screen.getByTestId("riasec-trusted-result-card")).toBeInTheDocument();
    expect(screen.queryByText("分享默认只展示安全摘要，不带原始分数与反馈明细。")).not.toBeInTheDocument();
    expect(screen.queryByText("已记录：收藏活动。")).not.toBeInTheDocument();
    expect(screen.queryByText("比较两类研究型活动")).not.toBeInTheDocument();
  });

  it("fails closed when lifecycle or feedback payloads allow fallback or measured-payload mutation", () => {
    const unsafeProjection = clone(readProjection());

    (unsafeProjection.lifecycle_copy_v1 as Record<string, unknown>).frontend_fallback_allowed = true;
    ((unsafeProjection.exploration_feedback_overlay_v0_1 as Record<string, unknown>).action_lab_v1 as Record<string, unknown>).affects_score = true;
    ((unsafeProjection.exploration_feedback_overlay_v0_1 as Record<string, unknown>).next_exploration_nodes_v1 as Record<string, unknown>).creates_career_match = true;

    const viewModel = assembleRiasecResultViewModel(buildReport(unsafeProjection));

    expect(viewModel.lifecycleCopy).toBeNull();
    expect(viewModel.feedbackOverlay?.actionLab).toBeNull();
    expect(viewModel.feedbackOverlay?.nextExplorationNodes).toBeNull();
  });

  it("keeps runtime source free of backend lifecycle copy and feedback starter strings", () => {
    const runtimeSource = [
      fs.readFileSync(path.join(ROOT, "lib/riasec/resultAssembler.ts"), "utf8"),
      fs.readFileSync(path.join(ROOT, "components/result/riasec/RiasecResultShell.tsx"), "utf8"),
    ].join("\n");

    [
      "分享默认只展示安全摘要，不带原始分数与反馈明细。",
      "已记录：收藏活动。",
      "比较两类研究型活动",
      "career match",
      "job fit",
      "success prediction",
      "140Q more accurate",
      "职业推荐",
      "岗位匹配",
      "更准确",
    ].forEach((phrase) => {
      expect(runtimeSource).not.toContain(phrase);
    });
  });
});
