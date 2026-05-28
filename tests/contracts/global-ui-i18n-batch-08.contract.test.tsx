import fs from "node:fs";
import path from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getDictSync } from "@/lib/i18n/getDict";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const ROOT = process.cwd();
const UI_FAMILIES = [
  "common",
  "tests",
  "lang",
  "cookie",
  "footer",
  "commerce",
  "result",
  "orders",
  "history",
  "email",
  "support",
] as const;

const UNAVAILABLE_CONTENT_HELP_POLICY_PATHS = [
  "/en/help/about",
  "/en/help/contact",
  "/en/help/faq",
  "/en/help/for-business-and-research",
  "/zh/help/about",
  "/zh/help/contact",
  "/zh/help/faq",
  "/zh/help/for-business-and-research",
];

function keyPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return [`${prefix}[]`];
  if (!value || typeof value !== "object") return [prefix];

  return Object.entries(value)
    .flatMap(([key, child]) => keyPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function footerHrefs(locale: "en" | "zh"): string[] {
  cleanup();
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

describe("GLOBAL-EN-ZH-GLOBAL-UI-I18N-BATCH-08", () => {
  it("keeps global UI dictionary families shape-aligned across English and Chinese", () => {
    const en = getDictSync("en");
    const zh = getDictSync("zh");

    for (const family of UI_FAMILIES) {
      expect(keyPaths(en[family]), family).toEqual(keyPaths(zh[family]));
    }
  });

  it("renders footer group labels from the locale dictionary instead of hardcoded component copy", () => {
    const en = getDictSync("en");
    const zh = getDictSync("zh");
    const footerSource = fs.readFileSync(path.join(ROOT, "components/layout/SiteFooter.tsx"), "utf8");

    const englishFooter = render(
      <LocaleProvider locale="en">
        <SiteFooter />
      </LocaleProvider>
    );
    expect(screen.getByTestId("site-footer-group-tests")).toHaveTextContent(en.footer.groupTitles.tests);
    expect(screen.getByTestId("site-footer-group-articles")).toHaveTextContent(en.footer.groupTitles.articles);
    expect(screen.getByTestId("site-footer-group-company")).toHaveTextContent(en.footer.groupTitles.company);
    expect(screen.getByTestId("site-footer-group-policies")).toHaveTextContent(en.footer.groupTitles.policies);
    expect(screen.getByText(en.footer.tailnote)).toBeInTheDocument();

    englishFooter.unmount();

    render(
      <LocaleProvider locale="zh">
        <SiteFooter />
      </LocaleProvider>
    );
    expect(screen.getByTestId("site-footer-group-tests")).toHaveTextContent(zh.footer.groupTitles.tests);
    expect(screen.getByTestId("site-footer-group-articles")).toHaveTextContent(zh.footer.groupTitles.articles);
    expect(screen.getByTestId("site-footer-group-company")).toHaveTextContent(zh.footer.groupTitles.company);
    expect(screen.getByTestId("site-footer-group-policies")).toHaveTextContent(zh.footer.groupTitles.policies);
    expect(screen.getByText(zh.footer.tailnote)).toBeInTheDocument();

    expect(footerSource).not.toContain("See the Micro. Lead the Macro.");
    expect(footerSource).not.toContain("测量自己，看见职业，训练未来。");
  });

  it("keeps unavailable content authority targets out of frontend-owned nav and footer UI", () => {
    const headerHrefs = (["en", "zh"] as const).flatMap((locale) =>
      getHeaderDropdownMenus(locale).flatMap((menu) =>
        menu.items.map((item) => `/${locale}${item.href}`)
      )
    );
    const hrefs = [...headerHrefs, ...footerHrefs("en"), ...footerHrefs("zh")];

    for (const path of UNAVAILABLE_CONTENT_HELP_POLICY_PATHS) {
      expect(hrefs, path).not.toContain(path);
    }
  });
});
