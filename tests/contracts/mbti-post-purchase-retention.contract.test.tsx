import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import reportReadyMbtiFreeFixture from "@/tests/fixtures/report_ready.mbti.free.json";

const hoisted = vi.hoisted(() => ({
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/result/attempt-unlocked-123",
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createReportFixture(): ReportResponse {
  return structuredClone(reportReadyMbtiFreeFixture) as ReportResponse;
}

function createUnlockedFixture(): ReportResponse {
  const reportData = createReportFixture();
  reportData.locked = false;
  reportData.variant = "full";
  reportData.access_level = "paid";
  reportData.modules_allowed = ["core_full", "career", "relationships"];
  return reportData;
}

describe("MBTI post-purchase retention contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the unlocked terminal surface and flips sticky/mobile/footer CTAs to history", () => {
    const reportData = createUnlockedFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const terminalSurface = screen.getByTestId("mbti-post-purchase-section");
    const offerComparison = screen.getByTestId("mbti-offer-comparison");
    const footer = screen.getByTestId("mbti-footer-cta");
    const stickyRail = screen.getByTestId("mbti-sticky-rail");
    const mobileChrome = screen.getByTestId("mbti-mobile-chrome");

    expect(terminalSurface).toBeInTheDocument();
    expect(within(terminalSurface).getByText("已解锁完整报告")).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("button", { name: "下载 PDF" })).toBeInTheDocument();
    expect(within(terminalSurface).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");
    expect(within(terminalSurface).getByRole("link", { name: "订单找回" })).toHaveAttribute("href", "/zh/orders/lookup");

    expect(within(stickyRail).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");
    expect(within(mobileChrome).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");
    expect(within(footer).getByRole("link", { name: "我的 MBTI 报告" })).toHaveAttribute("href", "/zh/history/mbti");

    expect(offerComparison.compareDocumentPosition(terminalSurface) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(terminalSurface.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("keeps the locked result on the existing checkout/offers wiring", () => {
    const reportData = createReportFixture();

    render(<RichResultReport locale="zh" reportData={reportData} />);

    const stickyRail = screen.getByTestId("mbti-sticky-rail");
    const mobileChrome = screen.getByTestId("mbti-mobile-chrome");
    const footer = screen.getByTestId("mbti-footer-cta");

    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(within(stickyRail).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offers");
    expect(within(mobileChrome).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offers");
    expect(within(footer).getByRole("link", { name: "解锁完整报告" })).toHaveAttribute("href", "#offers");
  });
});
