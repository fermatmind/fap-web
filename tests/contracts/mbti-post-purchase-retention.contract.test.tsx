import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import fixture from "@/tests/fixtures/report_ready.mbti.projection.json";
vi.mock("next/navigation", () => ({ usePathname: () => "/en/result/attempt-123" }));
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackObservableFunnelEvent: vi.fn() }));
vi.mock("@/lib/cms/personality-result-introduction", () => ({ fetchPersonalityResultIntroduction: vi.fn(async () => null) }));
function access(pdfState: "ready" | "locked"): AttemptReportAccessView {
  return { attemptId: "attempt-123", accessState: "ready", reportState: "ready", pdfState, unlockStage: "locked", unlockSource: "none", reasonCode: null, accessLevel: "free", accessMode: "free_full", paywallSuppressed: true, variant: "free", projectionVersion: 1, modulesAllowed: [], modulesPreview: [], actions: { pageHref: null, pdfHref: pdfState === "ready" ? "/v0.3/attempts/attempt-123/result-page.pdf" : null, waitHref: null, historyHref: "/en/history/mbti", lookupHref: null }, meta: { producedAt: null, refreshedAt: null } };
}
describe("MBTI history and PDF after retiring the purchase surface", () => {
  it("retains history access without an order-specific terminal surface", () => {
    render(<RichResultReport locale="en" reportData={fixture as unknown as ReportResponse} accessProjection={access("locked")} />);
    expect(screen.getByRole("link", { name: "View my reports" })).toHaveAttribute("href", "/en/history/mbti");
    expect(screen.queryByTestId("mbti-post-purchase-section")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-offer-comparison")).not.toBeInTheDocument();
  });
  it("downloads through the native authorized PDF callback", async () => {
    const download = vi.fn().mockResolvedValue(undefined);
    render(<RichResultReport locale="en" reportData={fixture as unknown as ReportResponse} accessProjection={access("ready")} onDownloadMbtiPdf={download} />);
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));
    await waitFor(() => expect(download).toHaveBeenCalledOnce());
  });
  it("keeps a legacy paid report from overriding a locked server PDF projection", () => {
    const data = { ...structuredClone(fixture), locked: false, access_level: "paid", variant: "full" } as unknown as ReportResponse;
    render(<RichResultReport locale="en" reportData={data} accessProjection={access("locked")} />);
    expect(screen.queryByRole("button", { name: "Download PDF" })).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-chapter-career")).toBeInTheDocument();
  });
});
