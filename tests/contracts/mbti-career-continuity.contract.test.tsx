import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MbtiCareerContinuityTelemetry } from "@/components/career/MbtiCareerContinuityTelemetry";
import type { MbtiContinuityViewModel } from "@/lib/mbti/publicProjection";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

class MockIntersectionObserver {
  private callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  disconnect(): void {}

  observe(target: Element): void {
    this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }

  unobserve(): void {}

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe("MBTI career continuity telemetry contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
  });

  it("tracks carryover exposure and read-depth on the career recommendation surface", async () => {
    const continuity: MbtiContinuityViewModel = {
      carryoverFocusKey: "career.next_step",
      carryoverReason: "continue_career_bridge",
      recommendedResumeKeys: ["career.next_step", "career.work_experiments"],
      carryoverSceneKeys: ["work", "growth"],
      carryoverActionKeys: ["career_next_step.theme.clarify_decision_criteria"],
      feedbackSentiment: "positive",
      feedbackCoverage: "action_only",
      actionCompletionTendency: "repeatable",
      lastDeepReadSection: "career.work_experiments",
      currentIntentCluster: "career_move",
    };

    render(
      <>
        <div id="recommended-roles" />
        <MbtiCareerContinuityTelemetry locale="en" continuity={continuity} typeCode="INTJ-A" />
      </>
    );

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "career_continuity_entry",
          continueTarget: "career_recommendation",
          typeCode: "INTJ-A",
          carryoverFocusKey: "career.next_step",
          carryoverReason: "continue_career_bridge",
          recommendedResumeKeys: "career.next_step|career.work_experiments",
          carryoverSceneKeys: "work|growth",
          carryoverActionKeys: "career_next_step.theme.clarify_decision_criteria",
          feedbackSentiment: "positive",
          feedbackCoverage: "action_only",
          actionCompletionTendency: "repeatable",
          lastDeepReadSection: "career.work_experiments",
          currentIntentCluster: "career_move",
        })
      );
    });

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_interaction",
        expect.objectContaining({
          visual_kind: "career_continuity_entry",
          interaction: "continue_read_depth",
          sectionKey: "career.recommended_roles",
          continueTarget: "career_recommendation",
          carryoverFocusKey: "career.next_step",
          feedbackSentiment: "positive",
          feedbackCoverage: "action_only",
          actionCompletionTendency: "repeatable",
          lastDeepReadSection: "career.work_experiments",
          currentIntentCluster: "career_move",
        })
      );
    });
  });
});
