import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import { getMbtiDesktopAnchorHash } from "@/components/result/mbti/mbtiDesktopAnchorTargets";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { MbtiAccessHubV1Raw } from "@/lib/mbti/accessHub";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
  fetchAttemptReportPdf: vi.fn(),
  openWindow: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-unlocked-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    fetchAttemptReportPdf: hoisted.fetchAttemptReportPdf,
  };
});

function getPrimaryByTestId(testId: string): HTMLElement {
  const [node] = screen.getAllByTestId(testId);
  if (!node) {
    throw new Error(`Missing test id: ${testId}`);
  }

  return node;
}

function getDesktopStickyRail(): HTMLElement {
  return within(screen.getByTestId("mbti-desktop-clone-shell")).getByTestId("mbti-sticky-rail");
}

function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
}

function createUnlockedFixture(): ReportResponse {
  const reportData = createReportFixture();
  reportData.locked = false;
  reportData.variant = "full";
  reportData.access_level = "paid";
  reportData.modules_allowed = ["core_full", "career", "relationships"];
  reportData.mbti_access_hub_v1 = createMbtiAccessHubRaw("attempt-unlocked-123", "ord_post_purchase_001");
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
      compare_invite_id: null,
    },
    workspace_lite: {
      has_entry: true,
      entry_kind: "mbti_history",
      attempt_id: attemptId,
    },
  };
}

describe("MBTI post-purchase retention contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "open").mockImplementation(hoisted.openWindow);
  });

  it("renders the unlocked terminal surface and flips sticky/mobile/footer CTAs to history", () => {
    const reportData = createUnlockedFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const terminalSurface = getPrimaryByTestId("mbti-post-purchase-section");
    const footer = screen.getByTestId("mbti-footer-cta");
    const stickyRail = getDesktopStickyRail();

    expect(terminalSurface).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
    expect(within(terminalSurface).getByText("已解锁完整报告")).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("button", { name: "下载 PDF" })).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");
    expect(within(terminalSurface).getByRole("link", { name: "订单详情" })).toHaveAttribute("href", "/zh/orders/ord_post_purchase_001");
    expect(within(terminalSurface).getByRole("link", { name: "订单找回" })).toHaveAttribute("href", "/zh/orders/lookup");
    expect(within(terminalSurface).queryByRole("link", { name: "查看报告" })).not.toBeInTheDocument();

    expect(within(stickyRail).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");

    expect(terminalSurface.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("prefers hub pdf authority on the unlocked terminal surface", async () => {
    const reportData = createUnlockedFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    fireEvent.click(getPrimaryByTestId("mbti-post-purchase-download"));

    await waitFor(() => {
      expect(hoisted.openWindow).toHaveBeenCalledWith(
        "/api/v0.3/attempts/attempt-unlocked-123/report.pdf",
        "_blank",
        "noopener,noreferrer"
      );
    });
    expect(hoisted.fetchAttemptReportPdf).not.toHaveBeenCalled();
  });

  it("keeps the locked result on the existing checkout/offers wiring", () => {
    const reportData = createReportFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const stickyRail = getDesktopStickyRail();
    const footer = screen.getByTestId("mbti-footer-cta");

    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(within(stickyRail).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull")
    );
    expect(screen.queryByTestId("mbti-mobile-chrome")).not.toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute(
      "href",
      getMbtiDesktopAnchorHash("offerFull")
    );
  });
});
