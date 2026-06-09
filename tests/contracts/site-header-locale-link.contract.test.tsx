import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { SiteHeader } from "@/components/layout/SiteHeader";

vi.mock("next/link", () => ({
  default: ({ href, children, className, onClick }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => (
    <a href={href} className={className} onClick={onClick}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/zh/tests/enneagram-personality-test-nine-types/take",
}));

describe("SiteHeader locale link contract", () => {
  it("does not inject live query params into the SSR-rendered locale switch href", () => {
    render(
      <LocaleProvider locale="zh">
        <SiteHeader />
      </LocaleProvider>
    );

    const localeLinks = screen.getAllByRole("link", { name: "EN" });
    expect(localeLinks.length).toBeGreaterThan(0);
    for (const link of localeLinks) {
      expect(link).toHaveAttribute("href", "/en/tests/enneagram-personality-test-nine-types/take");
      expect(link.getAttribute("href")).not.toContain("form=");
    }
  });

  it("does not render the live completed-count social proof in the global header", () => {
    render(
      <LocaleProvider locale="zh">
        <SiteHeader />
      </LocaleProvider>
    );

    expect(screen.queryByText("过去30天已完成")).not.toBeInTheDocument();
    expect(screen.queryByText("次测评")).not.toBeInTheDocument();
  });

  it("keeps the standalone desktop locale switcher SSR-safe when the current URL has query params", () => {
    window.history.replaceState(null, "", "/zh/tests/enneagram-personality-test-nine-types/take?form=enneagram_forced_choice_144");

    render(
      <LocaleProvider locale="zh">
        <LocaleSwitcher />
      </LocaleProvider>
    );

    const link = screen.getByRole("link", { name: "EN" });
    expect(link).toHaveAttribute("href", "/en/tests/enneagram-personality-test-nine-types/take");
    expect(link.getAttribute("href")).not.toContain("form=");
  });
});
