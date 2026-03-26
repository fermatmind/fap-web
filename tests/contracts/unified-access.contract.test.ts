import { canEnterReportPage, type AttemptReportAccessView } from "@/lib/access/unifiedAccess";

describe("unified access contract", () => {
  it("requires access state ready even when report is ready", () => {
    const accessView: AttemptReportAccessView = {
      attemptId: "attempt-123",
      accessState: "locked",
      reportState: "ready",
      pdfState: "ready",
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
