import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MbtiHistoryClient from "@/app/(localized)/[locale]/(app)/history/mbti/MbtiHistoryClient";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/history/mbti",
  search: "",
  fetchAttemptReportAccess: vi.fn(),
  getMyAttempts: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchAttemptReportAccess: hoisted.fetchAttemptReportAccess,
    getMyAttempts: hoisted.getMyAttempts,
  };
});

function createAccessProjection(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    ok: true,
    attempt_id: "attempt-history-1",
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    reason_code: "report_ready",
    projection_version: 1,
    actions: {
      page_href: "/result/attempt-history-1",
      pdf_href: "/api/v0.3/attempts/attempt-history-1/report.pdf",
      history_href: "/history/mbti",
      lookup_href: "/orders/lookup",
    },
    meta: {
      produced_at: "2026-03-22T10:00:00Z",
      refreshed_at: "2026-03-22T10:00:00Z",
    },
    ...overrides,
  };
}

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("MBTI history account-center contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/mbti";
    hoisted.search = "";
    hoisted.fetchAttemptReportAccess.mockResolvedValue(createAccessProjection());
  });

  it("renders history as the saved-results entry while preserving the report action", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "INTJ-A",
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<MbtiHistoryClient />);

    expect(screen.getByRole("heading", { level: 1, name: "My MBTI Results" })).toBeInTheDocument();
    expect(screen.getByText("Your completed MBTI results are kept here for direct re-entry.")).toBeInTheDocument();
    expect(
      screen.getByText("Need to recover a purchased report from another device or inbox? Use order lookup.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is now your MBTI Workspace Lite entry: continue from saved results here, or recover a purchased report through order lookup.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-recovery-cta")).toHaveAttribute("href", "/en/orders/lookup");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-history-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveAttribute("href", "/en/result/attempt-history-1");
    expect(screen.getByTestId("mbti-history-list-copy")).toHaveTextContent("Saved MBTI results");
    expect(screen.getByTestId("mbti-history-open-attempt-history-1")).toHaveAttribute("href", "/en/result/attempt-history-1");
    expect(screen.getByRole("link", { name: "View report" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save|bookmark|favorite/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /save|bookmark|favorite/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId("order-delivery-actions")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /Order status/i })).not.toBeInTheDocument();
  });

  it("renders carryover guidance and preserves continuity query on history re-entry links", async () => {
    hoisted.search =
      "carryover_focus_key=career.work_experiments&carryover_reason=adaptive_next_best_action&recommended_resume_keys=career.work_experiments%7Cgrowth.next_actions&carryover_scene_keys=growth%7Cwork&carryover_action_keys=work_experiment.theme.name_decision_rule%7Cweekly_action.theme.name_decision_rule&feedback_sentiment=negative&feedback_coverage=explainability_only&action_completion_tendency=repeatable&last_deep_read_section=traits.close_call_axes&current_intent_cluster=clarify_type&journey_contract_version=action_journey.v1&journey_fingerprint=journey-fixture-1&journey_scope=result_revisit&journey_state=refine_after_feedback&progress_state=repeatable&journey_action_focus_key=weekly_action.theme.name_decision_rule&recommended_next_pulse_keys=growth.watchouts%7Cread-explain&revisit_reorder_reason=reorder_after_feedback&pulse_state=recalibrate&pulse_prompt_keys=pulse.review_feedback_signal%7Cpulse.refine_focus&adaptive_contract_version=mbti.adaptive_selection.v1&adaptive_fingerprint=adaptive-fixture-1&selection_rewrite_reason=career_followthrough_loop&next_best_action_key=work_experiment.theme.name_decision_rule&next_best_action_section=career.work_experiments&next_best_action_reason=career_followthrough_loop&memory_contract_version=mbti.longitudinal_memory.v1&memory_fingerprint=memory-fixture-1&memory_scope=identity_recent_mbti_window&memory_state=resume_ready&memory_progression_state=reading_loop&section_history_keys=traits.close_call_axes%7Cgrowth.next_actions&behavior_delta_keys=behavior.revisit.repeat&dominant_interest_keys=explainability%7Cgrowth&resume_bias_keys=traits.why_this_type%7Cgrowth.next_actions&memory_rewrite_keys=rewrite.reason.refine_type_clarity&memory_rewrite_reason=refine_type_clarity";
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-2",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ENFP-T",
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<MbtiHistoryClient />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-history-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-history-carryover-entry")).toHaveTextContent("Continue the current focus");
    expect(screen.getByTestId("mbti-history-carryover-entry")).toHaveTextContent("Work experiments");
    expect(screen.getByTestId("mbti-history-carryover-entry")).toHaveTextContent(
      "This continue entry has been switched to the next step that looks most useful from your recent feedback and action results."
    );
    expect(screen.getByTestId("mbti-history-journey-context")).toHaveTextContent("Refine the current focus after feedback");
    expect(screen.getByTestId("mbti-history-journey-context")).toHaveTextContent("Repeatable now");
    expect(screen.getByTestId("mbti-history-journey-context")).toHaveTextContent(
      "This revisit reorders around your feedback"
    );
    expect(screen.getByTestId("mbti-history-adaptive-context")).toHaveTextContent("Adaptive continue guidance");
    expect(screen.getByTestId("mbti-history-adaptive-context")).toHaveTextContent("Work experiment");
    expect(screen.getByTestId("mbti-history-adaptive-context")).toHaveAttribute(
      "data-adaptive-fingerprint",
      "adaptive-fixture-1"
    );
    expect(screen.getByTestId("mbti-history-adaptive-context")).toHaveAttribute(
      "data-selection-rewrite-reason",
      "career_followthrough_loop"
    );
    expect(screen.getByTestId("mbti-history-adaptive-context")).toHaveAttribute(
      "data-next-best-action-key",
      "work_experiment.theme.name_decision_rule"
    );
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "carryover_focus_key=career.work_experiments"
    );
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "journey_state=refine_after_feedback"
    );
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "adaptive_contract_version=mbti.adaptive_selection.v1"
    );
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "adaptive_fingerprint=adaptive-fixture-1"
    );
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "next_best_action_key=work_experiment.theme.name_decision_rule"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "carryover_reason=adaptive_next_best_action"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "current_intent_cluster=clarify_type"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "pulse_state=recalibrate"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "adaptive_contract_version=mbti.adaptive_selection.v1"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "next_best_action_key=work_experiment.theme.name_decision_rule"
    );

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "history_action_journey_context",
        journeyContractVersion: "action_journey.v1",
        journeyFingerprint: "journey-fixture-1",
        journeyScope: "result_revisit",
        journeyState: "refine_after_feedback",
        progressState: "repeatable",
        pulseState: "recalibrate",
        adaptiveContractVersion: "mbti.adaptive_selection.v1",
        adaptiveFingerprint: "adaptive-fixture-1",
        selectionRewriteReason: "career_followthrough_loop",
        nextBestActionKey: "work_experiment.theme.name_decision_rule",
        nextBestActionSection: "career.work_experiments",
        nextBestActionReason: "career_followthrough_loop",
      })
    );

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "history_carryover_entry",
        continueTarget: "history_latest_result",
        carryoverFocusKey: "career.work_experiments",
        carryoverReason: "adaptive_next_best_action",
        recommendedResumeKeys: "career.work_experiments|growth.next_actions",
        carryoverSceneKeys: "growth|work",
        carryoverActionKeys: "work_experiment.theme.name_decision_rule|weekly_action.theme.name_decision_rule",
        feedbackSentiment: "negative",
        feedbackCoverage: "explainability_only",
        actionCompletionTendency: "repeatable",
        lastDeepReadSection: "traits.close_call_axes",
        currentIntentCluster: "clarify_type",
        adaptiveContractVersion: "mbti.adaptive_selection.v1",
        adaptiveFingerprint: "adaptive-fixture-1",
        selectionRewriteReason: "career_followthrough_loop",
        nextBestActionKey: "work_experiment.theme.name_decision_rule",
        nextBestActionSection: "career.work_experiments",
        nextBestActionReason: "career_followthrough_loop",
      })
    );

    fireEvent.click(screen.getByTestId("mbti-history-continue-cta"));
    fireEvent.click(screen.getByTestId("mbti-history-open-attempt-history-2"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "history_continue_latest",
        interaction: "click",
        continueTarget: "history_latest_result",
        ctaKey: "history_continue_latest",
        attempt_id: "attempt-history-2",
        carryoverFocusKey: "career.work_experiments",
        feedbackSentiment: "negative",
        feedbackCoverage: "explainability_only",
        actionCompletionTendency: "repeatable",
        lastDeepReadSection: "traits.close_call_axes",
        currentIntentCluster: "clarify_type",
        journeyContractVersion: "action_journey.v1",
        journeyState: "refine_after_feedback",
        progressState: "repeatable",
        pulseState: "recalibrate",
        adaptiveContractVersion: "mbti.adaptive_selection.v1",
        adaptiveFingerprint: "adaptive-fixture-1",
        selectionRewriteReason: "career_followthrough_loop",
        nextBestActionKey: "work_experiment.theme.name_decision_rule",
        nextBestActionSection: "career.work_experiments",
        nextBestActionReason: "career_followthrough_loop",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "history_saved_result_entry",
        interaction: "click",
        continueTarget: "history_saved_result",
        ctaKey: "history_saved_result",
        attempt_id: "attempt-history-2",
        carryoverReason: "adaptive_next_best_action",
        feedbackSentiment: "negative",
        feedbackCoverage: "explainability_only",
        actionCompletionTendency: "repeatable",
        lastDeepReadSection: "traits.close_call_axes",
        currentIntentCluster: "clarify_type",
        journeyContractVersion: "action_journey.v1",
        journeyState: "refine_after_feedback",
        progressState: "repeatable",
        pulseState: "recalibrate",
        adaptiveContractVersion: "mbti.adaptive_selection.v1",
        adaptiveFingerprint: "adaptive-fixture-1",
        selectionRewriteReason: "career_followthrough_loop",
        nextBestActionKey: "work_experiment.theme.name_decision_rule",
        nextBestActionSection: "career.work_experiments",
        nextBestActionReason: "career_followthrough_loop",
      })
    );
  });

  it("renders the zh empty state with both account-center actions", async () => {
    hoisted.pathname = "/zh/history/mbti";
    hoisted.getMyAttempts.mockResolvedValue({
      items: [],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<MbtiHistoryClient />);

    expect(screen.getByRole("heading", { level: 1, name: "我的 MBTI 结果" })).toBeInTheDocument();
    expect(screen.getByText("这里保存你当前身份下的 MBTI 历史结果，可直接再次进入。")).toBeInTheDocument();
    expect(screen.getByText("需要跨设备或通过购买邮箱找回已购报告，请使用订单找回。")).toBeInTheDocument();
    expect(screen.getByText("这里现在就是你的 MBTI Workspace Lite 入口：继续查看当前结果，或用订单找回恢复已购报告。")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-recovery-cta")).toHaveAttribute("href", "/zh/orders/lookup");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-history-empty")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-history-empty-start")).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.getByTestId("mbti-history-empty-start")).toHaveTextContent("去做 MBTI 测试");
    expect(screen.getByTestId("mbti-history-empty-recovery")).toHaveAttribute("href", "/zh/orders/lookup");
    expect(screen.getByTestId("mbti-history-empty-recovery")).toHaveTextContent("找回已购报告");
  });
});
