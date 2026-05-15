import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { canRenderRichResultReport, resolveReportScaleCode } from "@/components/result/RichResultReport";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { RIASEC_TRACKING_EVENTS } from "@/lib/riasec/tracking";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const DEEP_PROJECTION_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-v1.projection.json");
const TRUSTED_PROJECTION_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json");
const MATRIX_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/deep-copy-fixture-matrix.v1.json");

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  trackObservableFunnelEvent: vi.fn(),
  createAttemptShare: vi.fn(),
  writeText: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
  trackObservableFunnelEvent: hoisted.trackObservableFunnelEvent,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");
  return {
    ...actual,
    createAttemptShare: hoisted.createAttemptShare,
  };
});

type DeepSlot = Record<string, unknown>;
type Matrix = {
  authority: {
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
  cases: Array<{ id: string; coverage: string[] }>;
};

function readText(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function projectionFrom(filePath: string): Record<string, unknown> {
  const fixture = readJson<Record<string, unknown>>(filePath);
  return clone((fixture.projection as Record<string, unknown> | undefined) ?? fixture);
}

function reportFrom(projection: Record<string, unknown>, formCode = "riasec_140"): ReportResponse {
  return {
    ok: true,
    scale_code: "RIASEC",
    type_code: "IAS",
    riasec_form_v1: {
      form_code: formCode,
      label: formCode === "riasec_140" ? "RIASEC 140Q" : "RIASEC 60Q",
      question_count: formCode === "riasec_140" ? 140 : 60,
      estimated_minutes: formCode === "riasec_140" ? 18 : 8,
    },
    riasec_public_projection_v2: projection,
  } as unknown as ReportResponse;
}

function addContextCard(projection: Record<string, unknown>, slotKey: string, slotName: string, title: string): void {
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
    frontend_fallback_allowed: false,
    status: "authored",
    content_status: "authored",
    state: {
      slot_name: slotName,
      layer_state: "agreement",
    },
    content: {
      title,
      summary: `${title} summary`,
    },
  });
}

function trackPayloads(eventName: string): Record<string, unknown>[] {
  return hoisted.trackEvent.mock.calls
    .filter(([name]) => name === eventName)
    .map(([, payload]) => payload as Record<string, unknown>);
}

function expectNoUnsafeTrackingFields(payload: Record<string, unknown>): void {
  [
    "raw_scores",
    "scores",
    "raw_feedback",
    "feedback_text",
    "fit_score",
    "match_score",
    "career_success_probability",
    "occupation_recommendation",
  ].forEach((field) => {
    expect(payload).not.toHaveProperty(field);
  });
}

describe("RIASEC V11 launch acceptance smoke", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createAttemptShare.mockResolvedValue({
      ok: true,
      share_url: "/zh/share/riasec-launch-smoke",
    });
    hoisted.writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: hoisted.writeText,
      },
    });
  });

  it("accepts RIASEC as a rich result scale so result and report routes use the snapshot projection", () => {
    const report = reportFrom(projectionFrom(DEEP_PROJECTION_PATH), "riasec_60");

    expect(resolveReportScaleCode(report)).toBe("RIASEC");
    expect(canRenderRichResultReport(report)).toBe(true);
  });

  it("renders the V11 result structure from backend deep slots and fails closed for unsafe slots", () => {
    const projection = projectionFrom(DEEP_PROJECTION_PATH);
    addContextCard(projection, "140q_environment_card_copy", "environment_card", "Backend launch environment card");
    addContextCard(projection, "140q_role_card_copy", "role_responsibility_card", "Backend launch role card");
    const envelope = projection.deep_content_slots_v1 as Record<string, unknown>;
    const slots = envelope.slots as DeepSlot[];
    slots.push(
      {
        ...clone(slots[0]),
        slot_id: "dimension_deep_copy:pending-launch",
        status: "pending",
        content_status: "pending",
        content: { title: "Pending launch slot should not render" },
      },
      {
        ...clone(slots[0]),
        slot_key: "future_launch_slot",
        slot_id: "future_launch_slot:fixture",
        content: { title: "Unknown launch slot should not render" },
      },
    );

    const viewModel = assembleRiasecResultViewModel(reportFrom(projection));
    render(<RiasecResultShell locale="zh" viewModel={viewModel} attemptId="attempt_riasec_launch" />);

    expect(screen.getByTestId("riasec-trusted-result-card")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-six-dimension-map")).toBeInTheDocument();
    expect(screen.getByTestId("riasec-deep-content-slots")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I dimension title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture I_A blend title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture 140Q task card")).toBeInTheDocument();
    expect(screen.getByText("Backend launch environment card")).toBeInTheDocument();
    expect(screen.getByText("Backend launch role card")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture structure title")).toBeInTheDocument();
    expect(screen.getByText("Backend fixture aspirations title")).toBeInTheDocument();
    expect(screen.queryByText("Pending launch slot should not render")).not.toBeInTheDocument();
    expect(screen.queryByText("Unknown launch slot should not render")).not.toBeInTheDocument();

    expect(viewModel.deepContentSlots?.sourcePolicy).toMatchObject({
      frontendFallbackAllowed: false,
      missingContentBehavior: "omit_module_fail_closed",
      pendingContentBehavior: "omit_module_fail_closed",
      unknownSlotBehavior: "hidden",
    });
  });

  it("freezes production route, report, share, PDF, history, Technical Note, and matrix acceptance coverage", () => {
    const matrix = readJson<Matrix>(MATRIX_PATH);
    const smokeSource = readText("tests/contracts/riasec-trusted-result-v15-smoke-acceptance.contract.test.ts");
    const routeFiles = [
      "app/(localized)/[locale]/(app)/result/[id]/page.tsx",
      "app/(localized)/[locale]/attempts/[attemptId]/report/page.tsx",
      "app/(localized)/[locale]/share/[id]/page.tsx",
      "app/(localized)/[locale]/(app)/history/riasec/page.tsx",
      "app/(localized)/[locale]/tests/[slug]/technical-note/page.tsx",
    ];

    routeFiles.forEach((routeFile) => {
      expect(fs.existsSync(path.join(ROOT, routeFile)), routeFile).toBe(true);
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

    const coverage = new Set(matrix.cases.flatMap((matrixCase) => matrixCase.coverage));
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
      expect(coverage.has(requiredCoverage), requiredCoverage).toBe(true);
    });

    expect(matrix.authority).toMatchObject({
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
  });

  it("dispatches RIASEC launch analytics without raw score, raw feedback, fit, or match payload fields", async () => {
    const viewModel = assembleRiasecResultViewModel(reportFrom(projectionFrom(TRUSTED_PROJECTION_PATH), "riasec_60"));

    render(<RiasecResultShell locale="zh" attemptId="attempt-riasec-launch" viewModel={viewModel} />);

    await waitFor(() => {
      expect(trackPayloads(RIASEC_TRACKING_EVENTS.resultView)).toHaveLength(1);
      expect(trackPayloads(RIASEC_TRACKING_EVENTS.activityExplorerView)).toHaveLength(1);
      expect(trackPayloads(RIASEC_TRACKING_EVENTS.feedbackOverlayView)).toHaveLength(1);
    });

    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));

    await waitFor(() => {
      expect(trackPayloads(RIASEC_TRACKING_EVENTS.shareView)).toHaveLength(1);
    });

    for (const payload of hoisted.trackEvent.mock.calls.map(([, payload]) => payload as Record<string, unknown>)) {
      expect(payload).toMatchObject({
        scale_code: "RIASEC",
        snapshot_bound: true,
        raw_feedback_included: false,
        occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      });
      expectNoUnsafeTrackingFields(payload);
    }
  });

  it("keeps launch no-go claims out of runtime source and backend-authority fixtures", () => {
    const scannedText = [
      readText("lib/riasec/resultAssembler.ts"),
      readText("components/result/riasec/RiasecResultShell.tsx"),
      readText("lib/riasec/tracking.ts"),
      readText("tests/contracts/fixtures/riasec/deep-copy-v1.projection.json"),
      readText("tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json"),
    ].join("\n");

    [
      "Matches",
      "job fit",
      "success probability",
      "hiring suitability",
      "140Q more accurate",
      "raw score delta",
      "更准确",
      "140Q 更准",
      "岗位匹配",
      "成功率",
      "招聘筛选",
    ].forEach((forbiddenClaim) => {
      expect(scannedText).not.toContain(forbiddenClaim);
    });
  });
});
