import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RiasecResultShell } from "@/components/result/riasec/RiasecResultShell";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { RIASEC_TRACKING_EVENTS } from "@/lib/riasec/tracking";
import type { ReportResponse } from "@/lib/api/v0_3";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/riasec/trusted-result-v1_5.projection.json");

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

function buildReport(): ReportResponse {
  const fixture = JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as {
    scale_code: "RIASEC";
    projection: Record<string, unknown>;
  };

  return {
    ok: true,
    scale_code: fixture.scale_code,
    type_code: "RIA",
    riasec_public_projection_v2: fixture.projection,
  } as ReportResponse;
}

function payloadsFor(eventName: string): Record<string, unknown>[] {
  return hoisted.trackEvent.mock.calls
    .filter(([name]) => name === eventName)
    .map(([, payload]) => payload as Record<string, unknown>);
}

function expectNoForbiddenPayloadFields(payload: Record<string, unknown>) {
  for (const forbidden of [
    "raw_scores",
    "scores",
    "raw_feedback",
    "feedback_text",
    "holland_code",
    "measured_holland_code",
    "fit_score",
    "match_score",
    "career_success_probability",
    "occupation_recommendation",
  ]) {
    expect(payload).not.toHaveProperty(forbidden);
  }
}

describe("RIASEC runtime analytics dispatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.createAttemptShare.mockResolvedValue({
      ok: true,
      share_url: "/zh/share/share-riasec",
    });
    hoisted.writeText.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: hoisted.writeText,
      },
    });
  });

  it("dispatches result, activity explorer, feedback overlay, and share events without raw scores or raw feedback", async () => {
    const viewModel = assembleRiasecResultViewModel(buildReport());

    render(<RiasecResultShell locale="zh" attemptId="attempt-riasec" viewModel={viewModel} />);

    await waitFor(() => {
      expect(payloadsFor(RIASEC_TRACKING_EVENTS.resultView)).toHaveLength(1);
      expect(payloadsFor(RIASEC_TRACKING_EVENTS.activityExplorerView)).toHaveLength(1);
      expect(payloadsFor(RIASEC_TRACKING_EVENTS.feedbackOverlayView)).toHaveLength(1);
    });

    for (const payload of [
      ...payloadsFor(RIASEC_TRACKING_EVENTS.resultView),
      ...payloadsFor(RIASEC_TRACKING_EVENTS.activityExplorerView),
      ...payloadsFor(RIASEC_TRACKING_EVENTS.feedbackOverlayView),
    ]) {
      expect(payload).toMatchObject({
        scale_code: "RIASEC",
        form_code: "riasec_60",
        score_space_version: "riasec_60_likert5_activity_sum_space.v1",
        projection_version: "riasec.public_projection.v2",
        snapshot_bound: true,
        activity_explorer_status: "content_examples_only",
        activity_source_status: "content_example_not_registry_match",
        feedback_overlay_status: "overlay_contract_only",
        feedback_stream_status: "not_connected_v0_1",
        raw_feedback_included: false,
        occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
        locale: "zh",
      });
      expectNoForbiddenPayloadFields(payload);
    }

    fireEvent.click(screen.getByRole("button", { name: "分享结果" }));

    await waitFor(() => {
      expect(hoisted.createAttemptShare).toHaveBeenCalledWith({
        attemptId: "attempt-riasec",
        locale: "zh",
      });
      expect(payloadsFor(RIASEC_TRACKING_EVENTS.shareView)).toHaveLength(1);
    });

    const sharePayload = payloadsFor(RIASEC_TRACKING_EVENTS.shareView)[0] ?? {};
    expect(sharePayload).toMatchObject({
      scale_code: "RIASEC",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
    });
    expectNoForbiddenPayloadFields(sharePayload);
  });
});
