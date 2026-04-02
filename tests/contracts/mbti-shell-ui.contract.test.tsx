import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import { applyMbtiPhase2Fixture } from "@/tests/helpers/mbtiPhase2Fixture";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";
import reportReadyMbtiProjectionFixture from "@/tests/fixtures/report_ready.mbti.projection.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
}

function createLockedProjectionFixture(): ReportResponse {
  const reportData = applyMbtiPhase2Fixture(
    structuredClone(reportReadyMbtiProjectionFixture) as ReportResponse
  );
  reportData.mbti_preview_v1 = {
    mode: "none",
    modules: [],
    sections: [],
  };

  return reportData;
}

function createMbtiAccessHubRaw(attemptId: string, orderNo: string): MbtiAccessHubV1Raw {
  return {
    access_state: "ready",
    report_access: {
      can_view_report: true,
      attempt_id: attemptId,
      order_no: orderNo,
      report_url: `/api/v0.3/attempts/${attemptId}/report`,
      source: "report_gate",
    },
    pdf_access: {
      can_download_pdf: true,
      report_pdf_url: `/api/v0.3/attempts/${attemptId}/report.pdf`,
      source: "attempt_pdf",
    },
    recovery: {
      can_lookup_order: true,
      can_request_claim_email: true,
      can_resend: true,
      attempt_id: attemptId,
      share_id: null,
      compare_invite_id: "cmp_invite_123",
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}

function createUnlockedFixture(): ReportResponse {
  const reportData = structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
  reportData.locked = false;
  reportData.variant = "full";
  reportData.access_level = "paid";
  reportData.modules_allowed = ["core_full", "career", "relationships"];
  reportData.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-unlocked-123", "ord_post_purchase_001");
  return reportData;
}

describe("MBTI shell UI contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.sessionStorage.clear();
  });

  it("renders the locked current shell path without dormant modules", () => {
    render(<RichResultReport locale="zh" reportData={createLockedProjectionFixture()} />);

    const stickyRail = getPrimaryByTestId("mbti-sticky-rail");

    expect(screen.getByTestId("mbti-result-shell")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-hero")).toBeInTheDocument();
    expect(getPrimaryByTestId("mbti-offer-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-footer-cta")).toBeInTheDocument();
    expect(stickyRail).toBeInTheDocument();
    expect(screen.getByTestId("mbti-mobile-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-recommended-reads")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-traits")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-growth")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-relationships")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(within(stickyRail).getByText("2 Your Career Path")).toBeInTheDocument();
    expect(within(stickyRail).getByText("4 Your Relationships")).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-footer-cta")).getByRole("button", { name: "分享结果" })).toBeInTheDocument();

    expect(
      within(stickyRail).getByRole("link", { name: "解锁完整报告" })
    ).toHaveAttribute("href", "#offer-full");
  });

  it("renders the unlocked workspace in the main offer slot", () => {
    render(<RichResultReport locale="zh" reportData={createUnlockedFixture()} />);

    const terminalSurface = getPrimaryByTestId("mbti-post-purchase-section");
    const stickyRail = getPrimaryByTestId("mbti-sticky-rail");
    const footer = screen.getByTestId("mbti-footer-cta");

    expect(screen.queryByTestId("mbti-recommended-reads")).not.toBeInTheDocument();
    expect(terminalSurface).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(within(terminalSurface).getByRole("button", { name: "下载 PDF" })).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
    expect(within(terminalSurface).getByRole("link", { name: "关系回访入口" })).toHaveAttribute(
      "href",
      "/zh/relationships/mbti"
    );
    expect(within(stickyRail).getByRole("link", { name: "结果工作台" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
    expect(within(footer).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute(
      "href",
      "/zh/history/mbti"
    );
  });
});
