import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Gotenberg result print route contract", () => {
  it("adds a private noindex result print route without changing the report PDF API route", () => {
    const printRoutePath = "app/(localized)/[locale]/(app)/result/[id]/print/page.tsx";
    const printRoute = read(printRoutePath);
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const accessNormalizer = read("lib/access/unifiedAccess.ts");

    expect(existsSync(path.join(ROOT, printRoutePath))).toBe(true);
    expect(printRoute).toContain("robots: NOINDEX_ROBOTS");
    expect(printRoute).toContain('export const dynamic = "force-dynamic"');
    expect(printRoute).toContain("export const revalidate = 0");
    expect(printRoute).toContain('data-private-result-print-root="true"');
    expect(printRoute).toContain('data-gotenberg-result-print-root="true"');
    expect(printRoute).toContain('data-pdf-mode="true"');
    expect(printRoute).toContain('data-pdf-ready="false"');
    expect(printRoute).toContain("RESULT_PAGE_SNAPSHOT_SURFACE");
    expect(printRoute).toContain("verifyResultPagePdfToken");
    expect(printRoute).toContain('errorCode={!surfaceIsValid ? "PDF_SURFACE_MISMATCH" : "PDF_AUTH_INVALID"}');
    expect(printRoute).toContain("data-pdf-error={errorCode}");
    expect(printRoute).toContain('data-surface-mismatch={errorCode === "PDF_SURFACE_MISMATCH" ? "true" : undefined}');
    expect(printRoute).toContain("loadResultPrintBootstrap");
    expect(printRoute).toContain('data-pdf-bootstrap={printBootstrap.report ? "server" : "failed"}');
    expect(printRoute).toContain("searchParams?: Promise<Record<string, string | string[] | undefined>>");
    expect(printRoute).toContain("firstQueryValue(query.access_token) ?? firstQueryValue(query.result_access_token)");
    expect(printRoute).toContain("printAccessToken={printAccessToken}");
    expect(printRoute).toContain("printSnapshotRoute");
    expect(printRoute).toContain("printSnapshotSurface={RESULT_PAGE_SNAPSHOT_SURFACE}");
    expect(printRoute).toContain("initialReportAccess={printBootstrap.reportAccess}");
    expect(printRoute).toContain("initialReportData={printBootstrap.report}");
    expect(printRoute).toContain("printBootstrapError={printBootstrap.error}");
    expect(printRoute).toContain("pdf-mode");
    expect(resultPage).not.toContain("mbti.result_page_export.v1");
    expect(resultPage).not.toContain("mbti.result_page_snapshot.v3");
    expect(resultPage).not.toContain("verifyResultPagePdfToken");
    expect(resultPage).not.toContain("data-pdf-ready");
    expect(accessNormalizer).toContain('normalizeReportActionHref(raw.actions?.pdf_href, locale, "pdf")');
  });

  it("keeps print mode on the shared result renderer and removes interactive recovery chrome", () => {
    const resultClient = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    const printBootstrap = read("app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap.ts");

    expect(resultClient).toContain("printMode = false");
    expect(resultClient).toContain("printMode?: boolean");
    expect(resultClient).toContain("printSnapshotRoute?: boolean");
    expect(resultClient).toContain("printSnapshotSurface?: string | null");
    expect(resultClient).toContain("RESULT_PAGE_SNAPSHOT_SURFACE");
    expect(resultClient).toContain("printSnapshotContractValid");
    expect(resultClient).toContain("resolvePdfRenderBlocker");
    expect(resultClient).toContain("PDF_PLACEHOLDER_CONTENT");
    expect(resultClient).toContain("PDF_RENDER_BLOCKER_PRESENT");
    expect(resultClient).toContain("printAccessToken?: string | null");
    expect(resultClient).toContain("initialReportAccess?: AttemptReportAccessResponse | null");
    expect(resultClient).toContain("initialReportData?: ReportResponse | null");
    expect(resultClient).toContain("printBootstrapError?: string | null");
    expect(resultClient).toContain("initialPrintBootstrapReady");
    expect(resultClient).toContain("initialPrintBootstrapFailed");
    expect(resultClient).toContain("usePrintAccessTokenOnly");
    expect(resultClient).toContain("skipAuth: true, includeAnonId: false");
    expect(resultClient).toContain("if (printMode) {");
    expect(resultClient).toContain("window.__FERMAT_PDF_READY__ = true");
    expect(resultClient).toContain("window.__FERMAT_PDF_ERROR__");
    expect(resultClient).toContain("pdfReadyMarkerMounted");
    expect(resultClient).toContain('id="fermat-pdf-ready"');
    expect(resultClient).toContain('data-pdf-ready="true"');
    expect(resultClient).toContain("MBTI_PDF_READY_ANCHORS");
    expect(resultClient).toContain("MBTI_PDF_READY_ANCHOR_TIMEOUT_MS = 8000");
    expect(resultClient).toContain("MBTI_PDF_ASSET_READY_TIMEOUT_MS = 2000");
    expect(resultClient).toContain("waitForMbtiPdfReadyAnchors(MBTI_PDF_READY_ANCHOR_TIMEOUT_MS)");
    expect(resultClient).toContain("waitForPdfFonts(MBTI_PDF_ASSET_READY_TIMEOUT_MS)");
    expect(resultClient).toContain("waitForPdfImages(MBTI_PDF_ASSET_READY_TIMEOUT_MS)");
    expect(resultClient).toContain("image.addEventListener(\"error\", () => resolve(), { once: true })");
    expect(resultClient).toContain('"mbti-desktop-traits"');
    expect(resultClient).toContain('"mbti-desktop-career"');
    expect(resultClient).toContain('"mbti-desktop-growth"');
    expect(resultClient).toContain('"mbti-desktop-relationships"');
    expect(resultClient).toContain("renderOptionalEmailRecoveryCard");
    expect(resultClient).toContain("printMode ? null : renderEmailRecoveryCard()");
    expect(resultClient).toContain("installPrivateResultPrintUrlRedaction(locale)");
    expect(printBootstrap).toContain("X-Result-Access-Token");
    expect(printBootstrap).toContain("X-FAP-Locale");
    expect(printBootstrap).toContain("/report-access");
    expect(printBootstrap).toContain("/report");
  });

  it("routes MBTI result PDF downloads to the strict result-page export endpoint", () => {
    const api = read("lib/api/v0_3.ts");
    const apiBase = read("lib/api-base.ts");
    const button = read("components/commerce/AttemptPdfDownloadButton.tsx");
    const mbtiPostPurchase = read("components/result/mbti/MbtiPostPurchaseSection.tsx");
    const mbtiShell = read("components/result/mbti/MbtiResultShell.tsx");

    expect(api).toContain("getAttemptResultPagePdfUrl");
    expect(api).toContain("/v0.3/attempts/${attemptId}/result-page.pdf");
    expect(api).toContain("fetchAttemptResultPagePdfWithMeta");
    expect(button).toContain('exportSurface?: "report" | "result_page"');
    expect(button).toContain('exportSurface === "result_page"');
    expect(mbtiPostPurchase).toContain('exportSurface="result_page"');
    expect(mbtiShell).toContain("getAttemptResultPagePdfUrl({ attemptId: resultPagePdfAttemptId })");
    expect(apiBase).toContain("RESULT_PRINT_API_PROXY_SELECTOR");
    expect(apiBase).toContain('[data-gotenberg-result-print-root="true"][data-pdf-mode="true"]');
    expect(apiBase).toContain("isResultPrintApiProxyPage()");
    expect(apiBase).toContain("buildSameOriginApiUrl(normalizedPath)");
  });

  it("keeps the MBTI result modules available to the print route through the shared renderer", () => {
    const richReport = read("components/result/RichResultReport.tsx");
    const mbtiRail = read("components/result/mbti/MbtiStickyRail.tsx");
    const mbtiChapter = read("components/result/mbti/MbtiChapterSection.tsx");

    expect(richReport).toContain("<MbtiResultShell");
    expect(mbtiRail).toContain("1 人格特质");
    expect(mbtiRail).toContain("2 职业路径");
    expect(mbtiRail).toContain("3 个人成长");
    expect(mbtiRail).toContain("4 关系模式");
    expect(mbtiChapter).toContain('anchor: "traits"');
    expect(mbtiChapter).toContain('anchor: "career"');
    expect(mbtiChapter).toContain('anchor: "growth"');
    expect(mbtiChapter).toContain('anchor: "relationships"');
  });
});
