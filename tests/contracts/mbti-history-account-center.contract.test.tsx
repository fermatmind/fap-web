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

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

describe("MBTI history account-center contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/history/mbti";
    hoisted.search = "";
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
      "carryover_focus_key=growth.next_actions&carryover_reason=unlock_to_continue_focus&recommended_resume_keys=growth.next_actions%7Ccareer.next_step&carryover_scene_keys=growth%7Cwork&carryover_action_keys=weekly_action.theme.name_decision_rule";
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
    expect(screen.getByTestId("mbti-history-carryover-entry")).toHaveTextContent("Next actions");
    expect(screen.getByTestId("mbti-history-continue-cta").getAttribute("href")).toContain(
      "carryover_focus_key=growth.next_actions"
    );
    expect(screen.getByTestId("mbti-history-open-attempt-history-2").getAttribute("href")).toContain(
      "carryover_reason=unlock_to_continue_focus"
    );

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "history_carryover_entry",
        continueTarget: "history_latest_result",
        carryoverFocusKey: "growth.next_actions",
        carryoverReason: "unlock_to_continue_focus",
        recommendedResumeKeys: "growth.next_actions|career.next_step",
        carryoverSceneKeys: "growth|work",
        carryoverActionKeys: "weekly_action.theme.name_decision_rule",
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
        carryoverFocusKey: "growth.next_actions",
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
        carryoverReason: "unlock_to_continue_focus",
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
