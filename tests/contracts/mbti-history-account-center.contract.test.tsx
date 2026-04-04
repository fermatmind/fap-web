import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MbtiHistoryClient from "@/app/(localized)/[locale]/(app)/history/mbti/MbtiHistoryClient";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/history/mbti",
  search: "",
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
    getMyAttempts: hoisted.getMyAttempts,
  };
});

function createAccessSummary(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    access_state: "ready",
    report_state: "ready",
    pdf_state: "ready",
    unlock_stage: "full",
    unlock_source: "payment",
    reason_code: "report_ready",
    access_level: "full",
    variant: "full",
    modules_allowed: ["core_full", "career", "relationships"],
    modules_preview: [],
    invite_unlock_v1: {
      unlock_stage: "full",
      unlock_source: "payment",
      completed_invitees: 0,
      required_invitees: 2,
      partial_scope: "career",
      label: "Paid unlock active",
      short_label: "Paid unlock",
    },
    actions: {
      page_href: "/result/attempt-history-1",
      pdf_href: "/api/v0.3/attempts/attempt-history-1/report.pdf",
      wait_href: null,
      history_href: "/history/mbti",
      lookup_href: "/orders/lookup",
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
  });

  it("renders history as a workspace-lite re-entry surface with row-level status truth", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "INTJ-A",
          mbti_form_v1: {
            form_code: "mbti_144",
            label: "144-question full version",
            short_label: "144 questions",
            question_count: 144,
            estimated_minutes: 15,
            scale_code: "MBTI",
          },
          access_summary: createAccessSummary(),
        },
        {
          attempt_id: "attempt-history-2",
          scale_code: "MBTI",
          submitted_at: "2026-03-10T09:30:00Z",
          type_code: "ENFP-T",
          mbti_form_v1: {
            form_code: "mbti_93",
            label: "93-question standard version",
            short_label: "93 questions",
            question_count: 93,
            estimated_minutes: 10,
            scale_code: "MBTI",
          },
          access_summary: createAccessSummary({
            access_state: "locked",
            report_state: "ready",
            pdf_state: "unavailable",
            unlock_stage: "partial",
            unlock_source: "invite",
            reason_code: "preview_visible_report_ready",
            access_level: "free",
            variant: "free",
            modules_allowed: ["core_free"],
            modules_preview: ["core_full", "career"],
            invite_unlock_v1: {
              unlock_stage: "partial",
              unlock_source: "invite",
              completed_invitees: 1,
              required_invitees: 2,
              partial_scope: "career",
              label: "Invite unlock 1/2 · Career unlocked",
              short_label: "Invite unlock 1/2",
            },
            actions: {
              page_href: "/result/attempt-history-2",
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<MbtiHistoryClient />);

    expect(screen.getByRole("heading", { level: 1, name: "MBTI Workspace Lite" })).toBeInTheDocument();
    expect(screen.getByText("Re-enter saved MBTI result entries from the current workspace-lite surface.")).toBeInTheDocument();
    expect(
      screen.getByText("Need to recover a purchased report from another device or inbox? Use order lookup.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("This is now your MBTI Workspace Lite entry: continue from saved results here, or recover a purchased report through order lookup.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-recovery-cta")).toHaveAttribute("href", "/en/orders/lookup");

    await waitFor(() => {
      expect(screen.getAllByTestId("mbti-history-card")).toHaveLength(2);
    });

    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveAttribute("href", "/en/result/attempt-history-1");
    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveTextContent("Continue latest full result");
    expect(screen.getByTestId("mbti-history-latest-status")).toHaveTextContent("Latest entry · INTJ-A · MBTI · 144 questions: Full report unlocked · PDF ready · Paid unlock");
    expect(screen.getByTestId("mbti-history-latest-form")).toHaveTextContent("MBTI · 144 questions");
    expect(screen.getByTestId("mbti-history-latest-invite-stage")).toHaveTextContent("Paid unlock");
    expect(screen.getByTestId("mbti-history-list-copy")).toHaveTextContent("Saved result entries");
    expect(screen.getByTestId("mbti-history-open-attempt-history-1")).toHaveAttribute("href", "/en/result/attempt-history-1");
    expect(screen.getByTestId("mbti-history-open-attempt-history-1")).toHaveTextContent("Open full result");
    expect(screen.getByTestId("mbti-history-form-attempt-history-2")).toHaveTextContent("MBTI · 93 questions");
    expect(screen.getByTestId("mbti-history-pdf-attempt-history-1")).toHaveAttribute(
      "href",
      "/api/v0.3/attempts/attempt-history-1/report.pdf"
    );
    expect(screen.getByTestId("mbti-history-status-attempt-history-2")).toHaveTextContent("Preview scope: Full personality reading, Career mapping");
    expect(screen.getByTestId("mbti-history-delivery-attempt-history-2")).toHaveTextContent("PDF not ready");
    expect(screen.getByTestId("mbti-history-invite-summary-attempt-history-2")).toHaveTextContent(
      "Invite unlock 1/2: Invite unlock 1/2 · Career unlocked"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2")).toHaveTextContent("Continue free preview");
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
          mbti_form_v1: {
            form_code: "mbti_93",
            label: "93-question standard version",
            short_label: "93 questions",
            question_count: 93,
            estimated_minutes: 10,
            scale_code: "MBTI",
          },
          access_summary: createAccessSummary({
            attempt_id: "attempt-history-2",
            access_state: "locked",
            report_state: "ready",
            pdf_state: "unavailable",
            reason_code: "preview_visible_report_ready",
            access_level: "free",
            variant: "free",
            modules_allowed: ["core_free"],
            modules_preview: ["core_full"],
            actions: {
              page_href: "/result/attempt-history-2",
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
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
    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveTextContent("Continue latest free preview");
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
    expect(screen.getByTestId("mbti-history-open-attempt-history-2")).toHaveTextContent("Continue free preview");
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

    expect(screen.getByRole("heading", { level: 1, name: "MBTI Workspace Lite" })).toBeInTheDocument();
    expect(screen.getByText("这里是你当前身份下的 MBTI Workspace Lite 回访入口，可继续已保存的结果入口。")).toBeInTheDocument();
    expect(screen.getByText("需要跨设备或通过购买邮箱找回已购报告，请使用订单找回。")).toBeInTheDocument();
    expect(screen.getByText("这里现在就是你的 MBTI Workspace Lite 入口：继续查看当前结果，或用订单找回恢复已购报告。")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-recovery-cta")).toHaveAttribute("href", "/zh/orders/lookup");

    await waitFor(() => {
      expect(screen.getByTestId("mbti-history-empty")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-history-empty")).toHaveTextContent("当前身份下还没有 MBTI Workspace Lite 入口");
    expect(screen.getByTestId("mbti-history-empty-start")).toHaveAttribute(
      "href",
      "/zh/tests/mbti-personality-test-16-personality-types/take"
    );
    expect(screen.getByTestId("mbti-history-empty-start")).toHaveTextContent("去做 MBTI 测试");
    expect(screen.getByTestId("mbti-history-empty-recovery")).toHaveAttribute("href", "/zh/orders/lookup");
    expect(screen.getByTestId("mbti-history-empty-recovery")).toHaveTextContent("找回已购报告");
  });

  it("renders unavailable rows without pretending they are normal result entries", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-deleted-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "INFP-T",
          access_summary: createAccessSummary({
            access_state: "deleted",
            report_state: "deleted",
            pdf_state: "unavailable",
            reason_code: "projection_deleted",
            access_level: "free",
            variant: "free",
            modules_allowed: ["core_free"],
            modules_preview: [],
            actions: {
              page_href: null,
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
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

    expect(screen.queryByTestId("mbti-history-continue-cta")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-status-attempt-history-deleted-1")).toHaveTextContent(
      "This workspace entry is not currently available for direct re-entry. Use order lookup first."
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-deleted-1")).toBeDisabled();
    expect(screen.queryByTestId("mbti-history-pdf-attempt-history-deleted-1")).not.toBeInTheDocument();
  });

  it("does not mislabel locked full rows as unlocked full reports", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-locked-full-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ISTJ-A",
          access_summary: createAccessSummary({
            access_state: "locked",
            report_state: "ready",
            pdf_state: "unavailable",
            reason_code: "recovery_available",
            access_level: "full",
            variant: "full",
            modules_allowed: ["core_full", "career", "relationships"],
            modules_preview: [],
            actions: {
              page_href: "/result/attempt-history-locked-full-1",
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
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

    expect(screen.getByTestId("mbti-history-latest-status")).not.toHaveTextContent("Full report unlocked");
    expect(screen.getByTestId("mbti-history-open-attempt-history-locked-full-1")).toHaveTextContent("Continue locked entry");
    expect(screen.getByTestId("mbti-history-status-attempt-history-locked-full-1")).toHaveTextContent(
      "This workspace entry is still locked. Re-open the result page to check the current state or use order lookup if you need recovery."
    );
    expect(screen.queryByTestId("mbti-history-pdf-attempt-history-locked-full-1")).not.toBeInTheDocument();
  });

  it("renders unlocked rows with online access when the PDF is not ready yet", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-full-no-pdf-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ENTJ-A",
          access_summary: createAccessSummary({
            access_state: "ready",
            report_state: "ready",
            pdf_state: "pending",
            reason_code: "pdf_generating",
            access_level: "full",
            variant: "full",
            actions: {
              page_href: "/result/attempt-history-full-no-pdf-1",
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
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

    expect(screen.getByTestId("mbti-history-latest-status")).toHaveTextContent("Full report unlocked");
    expect(screen.getByTestId("mbti-history-latest-status")).toHaveTextContent("PDF not ready");
    expect(screen.getByTestId("mbti-history-open-attempt-history-full-no-pdf-1")).toHaveTextContent("Open full result");
    expect(screen.queryByTestId("mbti-history-pdf-attempt-history-full-no-pdf-1")).not.toBeInTheDocument();
  });

  it("routes processing and restoring rows through wait truth for both latest and row CTAs", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-processing-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ENTP-T",
          access_summary: createAccessSummary({
            access_state: "locked",
            report_state: "pending",
            pdf_state: "unavailable",
            reason_code: "projection_pending",
            access_level: "free",
            variant: "free",
            actions: {
              page_href: "/result/attempt-history-processing-1",
              pdf_href: null,
              wait_href: "/result/attempt-history-processing-1",
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
        },
        {
          attempt_id: "attempt-history-restoring-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-11T09:30:00Z",
          type_code: "ISFP-A",
          access_summary: createAccessSummary({
            access_state: "locked",
            report_state: "restoring",
            pdf_state: "unavailable",
            reason_code: "projection_restoring",
            access_level: "free",
            variant: "free",
            actions: {
              page_href: "/result/attempt-history-restoring-1",
              pdf_href: null,
              wait_href: "/result/attempt-history-restoring-1",
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
        },
      ],
      meta: {
        current_page: 1,
        last_page: 1,
      },
    });

    render(<MbtiHistoryClient />);

    await waitFor(() => {
      expect(screen.getAllByTestId("mbti-history-card")).toHaveLength(2);
    });

    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveTextContent("Continue latest processing entry");
    expect(screen.getByTestId("mbti-history-continue-cta")).toHaveAttribute("href", "/en/result/attempt-history-processing-1");
    expect(screen.getByTestId("mbti-history-open-attempt-history-processing-1")).toHaveTextContent("Continue processing entry");
    expect(screen.getByTestId("mbti-history-open-attempt-history-processing-1")).toHaveAttribute(
      "href",
      "/en/result/attempt-history-processing-1"
    );
    expect(screen.getByTestId("mbti-history-status-attempt-history-restoring-1")).toHaveTextContent(
      "This workspace entry is being restored. Use the waiting entry to continue from the current result page."
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-restoring-1")).toHaveTextContent("Continue restoring entry");
  });

  it("keeps processing rows on processing wording when wait truth is temporarily unavailable", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-processing-nowait-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ENTP-T",
          access_summary: createAccessSummary({
            access_state: "locked",
            report_state: "pending",
            pdf_state: "unavailable",
            reason_code: "projection_pending",
            access_level: "free",
            variant: "free",
            actions: {
              page_href: "/result/attempt-history-processing-nowait-1",
              pdf_href: null,
              wait_href: null,
              history_href: "/history/mbti",
              lookup_href: "/orders/lookup",
            },
          }),
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

    expect(screen.queryByTestId("mbti-history-continue-cta")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-history-status-attempt-history-processing-nowait-1")).toHaveTextContent(
      "This workspace entry is still preparing. Use the waiting entry to continue from the current result page."
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-processing-nowait-1")).toHaveTextContent("Preparing result");
  });

  it("keeps rows without access_summary in syncing state instead of unavailable wording", async () => {
    hoisted.getMyAttempts.mockResolvedValue({
      items: [
        {
          attempt_id: "attempt-history-syncing-1",
          scale_code: "MBTI",
          submitted_at: "2026-03-12T09:30:00Z",
          type_code: "ESFJ-A",
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

    expect(screen.getByTestId("mbti-history-status-attempt-history-syncing-1")).toHaveTextContent(
      "This workspace entry has not synced its current access state yet. Refresh later or use order lookup if you purchased access."
    );
    expect(screen.getByTestId("mbti-history-delivery-attempt-history-syncing-1")).toHaveTextContent("Delivery syncing");
    expect(screen.getByTestId("mbti-history-open-attempt-history-syncing-1")).toHaveTextContent("Status syncing");
  });
});
