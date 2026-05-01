import { describe, expect, it } from "vitest";
import { normalizeAttemptReportAccess } from "@/lib/access/unifiedAccess";
import { normalizeRecommendedReadHref, normalizeReportActionHref } from "@/lib/access/reportActionUrls";

describe("report action URL safety contract", () => {
  it("keeps report actions on allowed first-party paths", () => {
    expect(normalizeReportActionHref("/result/attempt-1", "en", "page")).toBe("/en/result/attempt-1");
    expect(normalizeReportActionHref("https://www.fermatmind.com/zh/result/attempt-1?from=history", "en", "page")).toBe(
      "/zh/result/attempt-1?from=history"
    );
    expect(normalizeReportActionHref("/api/v0.3/attempts/attempt-1/report.pdf?inline=1", "en", "pdf")).toBe(
      "/api/v0.3/attempts/attempt-1/report.pdf?inline=1"
    );
    expect(normalizeReportActionHref("/history/big5", "zh", "history")).toBe("/zh/history/big5");
    expect(normalizeReportActionHref("/orders/lookup", "en", "lookup")).toBe("/en/orders/lookup");
  });

  it("rejects unsafe schemes and unexpected external report action destinations", () => {
    expect(normalizeReportActionHref("javascript:alert(1)", "en", "page")).toBeNull();
    expect(normalizeReportActionHref("data:text/html,alert(1)", "en", "page")).toBeNull();
    expect(normalizeReportActionHref("https://evil.example/result/attempt-1", "en", "page")).toBeNull();
    expect(normalizeReportActionHref("https://api.fermatmind.com/api/v0.3/attempts/attempt-1/report.pdf", "en", "pdf")).toBeNull();
    expect(normalizeReportActionHref("/api/v0.3/attempts/attempt-1/report.pdf", "en", "page")).toBeNull();
  });

  it("normalizes access projections without preserving unsafe action URLs", () => {
    const view = normalizeAttemptReportAccess(
      {
        ok: true,
        attempt_id: "attempt-1",
        access_state: "ready",
        report_state: "ready",
        pdf_state: "ready",
        actions: {
          page_href: "https://evil.example/result/attempt-1",
          pdf_href: "javascript:alert(1)",
          wait_href: "/pay/wait?order_no=ord_1",
          history_href: "https://fermatmind.com/en/history/mbti",
          lookup_href: "/orders/lookup",
        },
      },
      "en"
    );

    expect(view?.actions.pageHref).toBeNull();
    expect(view?.actions.pdfHref).toBeNull();
    expect(view?.actions.waitHref).toBe("/en/pay/wait?order_no=ord_1");
    expect(view?.actions.historyHref).toBe("/en/history/mbti");
    expect(view?.actions.lookupHref).toBe("/en/orders/lookup");
  });

  it("keeps recommended reads on first-party content paths only", () => {
    expect(normalizeRecommendedReadHref("/en/articles/how-to-read-results")).toBe("/en/articles/how-to-read-results");
    expect(normalizeRecommendedReadHref("https://fermatmind.com/zh/topics/mbti?ref=result")).toBe("/zh/topics/mbti?ref=result");
    expect(normalizeRecommendedReadHref("https://api.fermatmind.com/articles/private")).toBeNull();
    expect(normalizeRecommendedReadHref("/api/v0.3/articles/private")).toBeNull();
    expect(normalizeRecommendedReadHref("blob:https://fermatmind.com/id")).toBeNull();
  });
});
