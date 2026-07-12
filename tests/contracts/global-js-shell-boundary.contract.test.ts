import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function read(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), file), "utf8");
}

describe("global JS shell boundary", () => {
  it("keeps the page shell and static footer navigation as server components", () => {
    const chrome = read("components/layout/SiteChrome.tsx");
    const footer = read("components/layout/SiteFooter.tsx");

    expect(chrome).not.toContain('"use client"');
    expect(footer).not.toContain('"use client"');
    expect(chrome).toContain("<SiteFooter locale={locale} />");
    expect(footer).toContain("<SiteFooterSocialRail locale={locale} />");
  });

  it("isolates existing interactive chrome into explicit client islands", () => {
    expect(read("components/layout/SiteHeader.tsx")).toContain('"use client"');
    expect(read("components/layout/SiteFooterSocialRail.tsx")).toContain('"use client"');
    expect(read("components/legal/CookieBanner.tsx")).toContain('"use client"');
  });

  it("passes the server-resolved locale into both site chrome layouts", () => {
    expect(read("app/(root)/layout.tsx")).toContain('<SiteChrome locale="zh" productPriority={productPriority}>');
    expect(read("app/(localized)/[locale]/layout.tsx")).toContain(
      "<SiteChrome locale={resolvedLocale} productPriority={productPriority}>"
    );
  });
});
