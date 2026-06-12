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
    expect(globals).toContain("display: none !important");
  });

  it("does not change global footer IA or social link rendering", () => {
    const siteFooter = read("components/layout/SiteFooter.tsx");

    expect(siteFooter).toContain("footerGroups.map");
    expect(siteFooter).toContain("FOOTER_SOCIAL_ITEMS");
    expect(siteFooter).toContain("fm-social-badge--footer");
    expect(siteFooter).toContain("href={withLocale(item.href)}");
  });
});
