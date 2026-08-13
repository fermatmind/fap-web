import {
  canEnterReportPage,
  normalizeAttemptReportAccess,
  type AttemptReportAccessView,
} from "@/lib/access/unifiedAccess";

describe("unified access contract", () => {
  it("preserves the backend free-full policy and paywall suppression", () => {
    const view = normalizeAttemptReportAccess({
      ok: true,
      attempt_id: "attempt-free",
      access_mode: "free_full",
      access_state: "ready",
      report_state: "ready",
      pdf_state: "ready",
      unlock_stage: "full",
      unlock_source: "none",
      paywall_suppressed: true,
      actions: { page_href: "/attempts/attempt-free/result", pdf_href: "/attempts/attempt-free/report.pdf" },
    }, "zh");

    expect(view?.accessMode).toBe("free_full");
    expect(view?.paywallSuppressed).toBe(true);
    expect(canEnterReportPage(view)).toBe(true);
  });

  it("requires access state ready even when report is ready", () => {
    const accessView: AttemptReportAccessView = {
      attemptId: "attempt-123",
      accessState: "locked",
      reportState: "ready",
      pdfState: "ready",
      unlockStage: "locked",
      unlockSource: "none",
      reasonCode: "projection_missing_result_ready",
      accessLevel: null,
      variant: null,
      projectionVersion: 1,
      modulesAllowed: [],
      modulesPreview: [],
      actions: {
        pageHref: "/attempts/attempt-123/result",
        pdfHref: "/attempts/attempt-123/report.pdf",
        waitHref: "/pay/wait",
        historyHref: "/history/mbti",
        lookupHref: "/orders/lookup",
      },
      meta: {
        producedAt: "2026-03-24T10:00:00.000Z",
        refreshedAt: "2026-03-24T10:00:00.000Z",
      },
    };

    expect(canEnterReportPage(accessView)).toBe(false);
  });

  it("allows entering when both report and access states are ready with a page href", () => {
    const accessView: AttemptReportAccessView = {
      attemptId: "attempt-123",
      accessState: "ready",
      reportState: "ready",
      pdfState: "ready",
      unlockStage: "full",
      unlockSource: "payment",
      reasonCode: "report_ready",
      accessLevel: null,
      variant: null,
      projectionVersion: 1,
      modulesAllowed: [],
      modulesPreview: [],
      actions: {
        pageHref: "/attempts/attempt-123/result",
        pdfHref: "/attempts/attempt-123/report.pdf",
        waitHref: "/pay/wait",
        historyHref: "/history/mbti",
        lookupHref: "/orders/lookup",
      },
      meta: {
        producedAt: "2026-03-24T10:00:00.000Z",
        refreshedAt: "2026-03-24T10:00:00.000Z",
      },
    };

    expect(canEnterReportPage(accessView)).toBe(true);
  });

  it("requires a page href to allow entering", () => {
    const accessView: AttemptReportAccessView = {
      attemptId: "attempt-123",
      accessState: "ready",
      reportState: "ready",
      pdfState: "ready",
      unlockStage: "full",
      unlockSource: "invite",
      reasonCode: null,
      accessLevel: null,
      variant: null,
      projectionVersion: 1,
      modulesAllowed: [],
      modulesPreview: [],
      actions: {
        pageHref: null,
        pdfHref: "/attempts/attempt-123/report.pdf",
        waitHref: "/pay/wait",
        historyHref: null,
        lookupHref: "/orders/lookup",
      },
      meta: {
        producedAt: "2026-03-24T10:00:00.000Z",
        refreshedAt: "2026-03-24T10:00:00.000Z",
      },
    };

    expect(canEnterReportPage(accessView)).toBe(false);
  });
});
