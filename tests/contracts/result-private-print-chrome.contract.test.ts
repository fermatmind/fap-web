import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("private result print chrome contract", () => {
  it("marks private result pages as the only print context that hides global chrome", () => {
    const resultPage = read("app/(localized)/[locale]/(app)/result/[id]/page.tsx");
    const siteHeader = read("components/layout/SiteHeader.tsx");
    const siteFooter = read("components/layout/SiteFooter.tsx");
    const globals = read("app/globals.css");

    expect(resultPage).toContain('data-private-result-print-root="true"');
    expect(siteHeader).toContain('data-private-result-print-hidden="true"');
    expect(siteFooter).toContain('data-private-result-print-hidden="true"');
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
