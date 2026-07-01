import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("private result print chrome contract", () => {
  it("uses a runtime snapshot shell for the v4 private result print route", () => {
    const resultPrintPage = read("app/(localized)/[locale]/(app)/result/[id]/print/page.tsx");
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const localizedLayout = read("app/(localized)/[locale]/layout.tsx");
    const proxy = read("proxy.ts");
    const globals = read("app/globals.css");

    expect(proxy).toContain('RESULT_PAGE_SNAPSHOT_SURFACE = "mbti.result_page_snapshot.v4"');
    expect(proxy).toContain('RESULT_PAGE_SNAPSHOT_SHELL_HEADER = "x-fermat-result-print-snapshot-shell"');
    expect(proxy).toContain("isResultPageSnapshotPrintRequest(pathname, request.nextUrl.searchParams.get(\"surface\"))");
    expect(proxy).toContain('requestHeaders.delete(RESULT_PAGE_SNAPSHOT_SHELL_HEADER)');
    expect(proxy).toContain('requestHeaders.set(RESULT_PAGE_SNAPSHOT_SHELL_HEADER, "true")');
    expect(proxy).toContain('/^\\/result\\/[^/]+\\/print\\/?$/i.test(strippedPath)');
    expect(resultPrintPage).toContain('data-private-result-print-root="true"');
    expect(resultPage).not.toContain('data-private-result-print-root="true"');
    expect(localizedLayout).toContain('RESULT_PAGE_SNAPSHOT_SHELL_HEADER = "x-fermat-result-print-snapshot-shell"');
    expect(localizedLayout).toContain("useResultPrintSnapshotShell");
    expect(localizedLayout).toContain('data-pdf-snapshot-shell={useResultPrintSnapshotShell ? "true" : undefined}');
    expect(localizedLayout).toContain("{useResultPrintSnapshotShell ? (");
    expect(localizedLayout).toContain("<SiteChrome productPriority={productPriority}>{children}</SiteChrome>");
    expect(localizedLayout).toContain("<CookieBanner />");
    expect(globals).toContain("@media print");
    expect(globals).toContain('body:has([data-private-result-print-root="true"]) [data-private-result-print-hidden="true"]');
    expect(globals).toContain('body:has([data-private-result-print-root="true"]) :is(');
    expect(globals).toContain("header,");
    expect(globals).toContain("footer,");
    expect(globals).toContain("nav,");
    expect(globals).toContain('[role="navigation"]');
    expect(globals).toContain(".fm-header-dropdown-panel");
    expect(globals).toContain(".fm-site-footer-light");
    expect(globals).toContain(".fm-section-footer");
    expect(globals).toContain(".fm-social-rail");
    expect(globals).toContain(".fm-social-list");
    expect(globals).toContain(".fm-social-badge");
    expect(globals).toContain(".fm-social-tooltip");
    expect(globals).toContain(".fm-social-qr-panel");
    expect(globals).toContain("display: none !important");
  });

  it("keeps the snapshot shell header scoped away from ordinary result pages and unknown surfaces", () => {
    const proxy = read("proxy.ts");

    expect(proxy).toContain("surface !== RESULT_PAGE_SNAPSHOT_SURFACE");
    expect(proxy).toContain("return false;");
    expect(proxy).toContain("stripLocalePrefix(pathname)");
    expect(proxy).not.toContain('/^\\/result\\/[^/]+\\/?$/i.test(strippedPath)');
    expect(proxy).not.toContain("request.nextUrl.searchParams.has(\"pdf\")");
  });

  it("keeps footer/nav leak labels only inside globally hidden chrome", () => {
    const siteHeader = read("components/layout/SiteHeader.tsx");
    const siteFooter = read("components/layout/SiteFooter.tsx");
    const globals = read("app/globals.css");

    for (const labelKey of ["dict.header.tests", "dict.header.articles", "dict.header.personality", "dict.header.career", "dict.header.help", "dict.header.business"]) {
      expect(siteHeader).toContain(labelKey);
    }

    for (const labelKey of ["footerGroupTitles.tests", "footerGroupTitles.articles", "footerGroupTitles.company", "footerGroupTitles.policies"]) {
      expect(siteFooter).toContain(labelKey);
    }
    expect(siteFooter).toContain("研究与方法");

    expect(siteHeader).toContain('data-private-result-print-hidden="true"');
    expect(siteFooter).toContain('data-private-result-print-hidden="true"');
    expect(globals).toContain('body:has([data-private-result-print-root="true"]) :is(');
    expect(globals).not.toMatch(/@media print\s*\{[\s\S]*?(?:header|footer|nav)\s*\{\s*display:\s*none\s*!important/);
  });

  it("does not change global footer IA or social link rendering", () => {
    const siteFooter = read("components/layout/SiteFooter.tsx");

    expect(siteFooter).toContain("footerGroups.map");
    expect(siteFooter).toContain("FOOTER_SOCIAL_ITEMS");
    expect(siteFooter).toContain("fm-social-badge--footer");
    expect(siteFooter).toContain("href={withLocale(item.href)}");
  });
});
