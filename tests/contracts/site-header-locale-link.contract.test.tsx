import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { SiteHeader } from "@/components/layout/SiteHeader";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    onClick,
    role,
    "aria-current": ariaCurrent,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    role?: string;
    "aria-current"?: React.AriaAttributes["aria-current"];
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} className={className} onClick={onClick} role={role} aria-current={ariaCurrent}>
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

    fireEvent.click(screen.getByRole("button", { name: "语言菜单" }));

    const localeLinks = screen.getAllByRole("menuitem", { name: "English" });
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

    fireEvent.click(screen.getByRole("button", { name: "语言菜单" }));

    const link = screen.getByRole("menuitem", { name: "English" });
    expect(link).toHaveAttribute("href", "/en/tests/enneagram-personality-test-nine-types/take");
    expect(link.getAttribute("href")).not.toContain("form=");
  });
});
