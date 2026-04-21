import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteFooter } from "@/components/layout/SiteFooter";

describe("site footer routing contract", () => {
  it("does not expose english content-page links when CMS has no english content_pages baseline", () => {
    render(
      <LocaleProvider locale="en">
        <SiteFooter />
      </LocaleProvider>
    );

    expect(screen.queryByRole("link", { name: "About us" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Careers" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Terms of use" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Privacy policy" })).not.toBeInTheDocument();
  });

  it("keeps chinese content-page links visible for the published zh-CN CMS baseline", () => {
    render(
      <LocaleProvider locale="zh">
        <SiteFooter />
      </LocaleProvider>
    );

    expect(screen.getByRole("link", { name: "关于我们" })).toHaveAttribute("href", "/zh/about");
    expect(screen.getByRole("link", { name: "工作机会" })).toHaveAttribute("href", "/zh/careers");
    expect(screen.getByRole("link", { name: "使用条款" })).toHaveAttribute("href", "/zh/terms");
    expect(screen.getByRole("link", { name: "隐私政策" })).toHaveAttribute("href", "/zh/privacy");
  });
});
