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
    expect(printRoute).toContain("loadResultPrintBootstrap");
    expect(printRoute).toContain('data-pdf-bootstrap={printBootstrap.report ? "server" : "failed"}');
    expect(printRoute).toContain("searchParams?: Promise<Record<string, string | string[] | undefined>>");
    expect(printRoute).toContain("firstQueryValue(query.access_token) ?? firstQueryValue(query.result_access_token)");
    expect(printRoute).toContain("printAccessToken={printAccessToken}");
    expect(printRoute).toContain("initialReportAccess={printBootstrap.reportAccess}");
    expect(printRoute).toContain("initialReportData={printBootstrap.report}");
    expect(printRoute).toContain("printBootstrapError={printBootstrap.error}");
    expect(printRoute).toContain("pdf-mode");
    expect(resultPage).toContain('data-private-result-print-root="true"');
    expect(resultPage).toContain("mbti.result_page_export.v2");
    expect(resultPage).toContain('data-pdf-mode={pdfMode ? "true" : undefined}');
    expect(resultPage).toContain('data-pdf-ready={pdfMode ? "false" : undefined}');
    expect(resultPage).toContain("verifyResultPagePdfToken");
    expect(accessNormalizer).toContain('normalizeReportActionHref(raw.actions?.pdf_href, locale, "pdf")');
  });

  it("renders MBTI print mode through a clean PDF shell and removes interactive recovery chrome", () => {
    const resultClient = read("app/(localized)/[locale]/(app)/result/[id]/ResultClient.tsx");
    const pdfShell = read("components/result/mbti/MbtiResultPdfShell.tsx");
    const printBootstrap = read("app/(localized)/[locale]/(app)/result/[id]/print/resultPrintBootstrap.ts");

    expect(resultClient).toContain("printMode = false");
    expect(resultClient).toContain("printMode?: boolean");
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
    expect(resultClient).toContain("MBTI_PDF_REQUIRED_SELECTORS");
    expect(resultClient).toContain("MBTI_PDF_BLOCKER_SELECTORS");
    expect(resultClient).toContain("MBTI_PDF_READY_SECTION_TIMEOUT_MS = 8000");
    expect(resultClient).toContain("MBTI_PDF_ASSET_READY_TIMEOUT_MS = 2000");
    expect(resultClient).toContain("waitForMbtiPdfReadySections(MBTI_PDF_READY_SECTION_TIMEOUT_MS)");
    expect(resultClient).toContain("waitForPdfFonts(MBTI_PDF_ASSET_READY_TIMEOUT_MS)");
    expect(resultClient).toContain("waitForPdfImages(MBTI_PDF_ASSET_READY_TIMEOUT_MS)");
    expect(resultClient).toContain("image.addEventListener(\"error\", () => resolve(), { once: true })");
    expect(resultClient).toContain('data-pdf-section="personality-traits"');
    expect(resultClient).toContain('data-pdf-section="career-path"');
    expect(resultClient).toContain('data-pdf-section="personal-growth"');
    expect(resultClient).toContain('data-pdf-section="relationships"');
    expect(resultClient).toContain('[data-pdf-placeholder="true"]');
    expect(resultClient).toContain('[data-cookie-banner="true"]');
    expect(resultClient).toContain('[data-site-header="true"]');
    expect(resultClient).toContain('[data-site-footer="true"]');
    expect(resultClient).toContain('[data-result-sidebar="true"]');
    expect(resultClient).toContain('[data-result-tools="true"]');
    expect(resultClient).toContain('[data-result-workspace="true"]');
    expect(resultClient).toContain('[data-pdf-loading="true"]');
    expect(resultClient).toContain('[data-pdf-exclude-visible="true"]');
    expect(resultClient).toContain("<MbtiResultPdfShell");
    expect(resultClient).toContain("renderOptionalEmailRecoveryCard");
    expect(resultClient).toContain("printMode ? null : renderEmailRecoveryCard()");
    expect(pdfShell).toContain('data-testid="mbti-result-pdf-shell"');
    expect(pdfShell).toContain('data-result-pdf-root="true"');
    expect(pdfShell).toContain('data-pdf-section={pdfSection.key}');
    expect(pdfShell).toContain('"personality-traits"');
    expect(pdfShell).toContain('"career-path"');
    expect(pdfShell).toContain('"personal-growth"');
    expect(pdfShell).toContain('"relationships"');
    expect(pdfShell).toContain('data-pdf-placeholder="true"');
    expect(pdfShell).toContain('data-pdf-error="PDF_PLACEHOLDER_CONTENT"');
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

  it("keeps blockers and print CSS out of the result-page PDF", () => {
    const globals = read("app/globals.css");
    const cookieBanner = read("components/legal/CookieBanner.tsx");
    const header = read("components/layout/SiteHeader.tsx");
    const footer = read("components/layout/SiteFooter.tsx");
    const rail = read("components/result/mbti/clone/MbtiCloneRail.tsx");

    expect(globals).toContain("@page");
    expect(globals).toContain("size: A4");
    expect(globals).toContain("print-color-adjust: exact");
    expect(globals).toContain('[data-result-pdf-root="true"]');
    expect(globals).toContain('[data-cookie-banner="true"]');
    expect(globals).toContain('[data-result-sidebar="true"]');
    expect(globals).toContain('[data-result-tools="true"]');
    expect(globals).toContain('[data-result-workspace="true"]');
    expect(cookieBanner).toContain('pathname.includes("/result/") && pathname.endsWith("/print")');
    expect(cookieBanner).toContain('data-cookie-banner="true"');
    expect(cookieBanner).toContain("cookie-banner");
    expect(header).toContain('data-site-header="true"');
    expect(footer).toContain('data-site-footer="true"');
    expect(rail).toContain('data-result-sidebar="true"');
  });
});
