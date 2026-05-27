import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const KNOWN_MISSING_CONTENT_HELP_POLICY_PATHS = [
  "/en/help/about",
  "/en/help/contact",
  "/en/help/faq",
  "/en/help/for-business-and-research",
  "/en/help/team",
  "/en/help/used-and-mentioned",
  "/zh/help/about",
  "/zh/help/contact",
  "/zh/help/faq",
  "/zh/help/for-business-and-research",
  "/en/brand",
  "/en/careers",
  "/en/charter",
  "/en/foundation",
  "/en/policies",
  "/zh/policies",
];

function collectFooterHrefs(locale: "en" | "zh"): string[] {
  render(
    <LocaleProvider locale={locale}>
      <SiteFooter />
    </LocaleProvider>
  );

  return screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href") || "")
    .filter(Boolean);
}

describe("GLOBAL-EN-ZH-PARITY-FOOTER-NAV-PARITY-01", () => {
  it("renders the same footer group architecture for English and Chinese", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter />
      </LocaleProvider>
    );

    expect(screen.getByTestId("site-footer-group-tests")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer-group-articles")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer-group-company")).toBeInTheDocument();
    expect(screen.getByTestId("site-footer-group-policies")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/en/about");
  });

  it("does not expose known content help policy hard-404 paths from footer links", () => {
    const hrefs = [...collectFooterHrefs("en"), ...collectFooterHrefs("zh")];

    for (const path of KNOWN_MISSING_CONTENT_HELP_POLICY_PATHS) {
      expect(hrefs, path).not.toContain(path);
    }
  });

  it("does not expose known content help policy hard-404 paths from header dropdown navigation", () => {
    const hrefs = ["en", "zh"].flatMap((locale) =>
      getHeaderDropdownMenus(locale as "en" | "zh").flatMap((menu) =>
        menu.items.map((item) => `/${locale}${item.href}`)
      )
    );

    for (const path of KNOWN_MISSING_CONTENT_HELP_POLICY_PATHS) {
      expect(hrefs, path).not.toContain(path);
    }
  });
});
