import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("global interaction lazy-loading boundary", () => {
  it("loads the footer QR image only while its trigger is active", () => {
    const rail = read("components/layout/SiteFooterSocialRail.tsx");
    const panel = read("components/layout/SiteFooterQrPanel.tsx");

    expect(rail).toContain('dynamic(() => import("@/components/layout/SiteFooterQrPanel"))');
    expect(rail).toContain("item.qrImageSrc && activeSocialKey === item.key");
    expect(panel).not.toMatch(/\bpriority\b/);
  });

  it("splits desktop dropdown and locale options from their trigger bundles", () => {
    const header = read("components/layout/SiteHeader.tsx");
    const localeSwitcher = read("components/i18n/LocaleSwitcher.tsx");

    expect(header).toContain('import("@/components/layout/SiteHeaderDropdownPanel")');
    expect(header).toContain("isOpen && items.length > 0");
    expect(localeSwitcher).toContain('dynamic(() => import("@/components/i18n/LocaleSwitcherMenu"))');
    expect(localeSwitcher).toContain("open ? (");
  });
});
