import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { LocaleSwitcher } from "@/components/i18n/LocaleSwitcher";
import { SiteHeader } from "@/components/layout/SiteHeader";

const navigationState = vi.hoisted(() => ({
  pathname: "/zh/tests/enneagram-personality-test-nine-types/take",
}));

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
  usePathname: () => navigationState.pathname,
}));

describe("SiteHeader locale link contract", () => {
  beforeEach(() => {
    navigationState.pathname = "/zh/tests/enneagram-personality-test-nine-types/take";
  });

  it("does not inject live query params into the SSR-rendered locale switch href", async () => {
    render(
      <LocaleProvider locale="zh">
        <SiteHeader />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "语言菜单" }));

    const localeLinks = await screen.findAllByRole("menuitem", { name: "English" });
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

  it.each([
    ["zh", "/"],
    ["zh", "/zh/tests/mbti-personality-test-16-personality-types"],
    ["zh", "/zh/tests"],
    ["zh", "/zh/articles/mbti-basics"],
    ["zh", "/zh/topics/mbti"],
    ["zh", "/zh/career"],
    ["zh", "/zh/personality/intj-a"],
    ["zh", "/zh/tests/enneagram-personality-test-nine-types/take"],
    ["en", "/en"],
    ["en", "/en/personality/intj-a-vs-intj-t"],
    ["en", "/en/tests/mbti-personality-test-16-personality-types"],
    ["en", "/en/articles"],
  ] as const)("keeps the homepage account entry in desktop and mobile headers: %s %s", (locale, pathname) => {
    navigationState.pathname = pathname;
    render(<LocaleProvider locale={locale}><SiteHeader /></LocaleProvider>);
    const label = locale === "zh" ? "我的账户" : "My Account";
    const desktopEntry = screen.getByRole("link", { name: label });
    expect(desktopEntry).toHaveAttribute("href", `/${locale}/results/lookup`);
    fireEvent.click(screen.getByRole("button", { name: locale === "zh" ? "菜单" : "Menu" }));
    const entries = screen.getAllByRole("link", { name: label });
    expect(entries).toHaveLength(2);
    for (const entry of entries) expect(entry).toHaveAttribute("href", `/${locale}/results/lookup`);
    fireEvent.click(entries[1]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the standalone desktop locale switcher SSR-safe when the current URL has query params", async () => {
    window.history.replaceState(null, "", "/zh/tests/enneagram-personality-test-nine-types/take?form=enneagram_forced_choice_144");

    render(
      <LocaleProvider locale="zh">
        <LocaleSwitcher />
      </LocaleProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "语言菜单" }));

    const link = await screen.findByRole("menuitem", { name: "English" });
    expect(link).toHaveAttribute("href", "/en/tests/enneagram-personality-test-nine-types/take");
    expect(link.getAttribute("href")).not.toContain("form=");
  });

  it("renders a full language label and paired locale codes in the desktop menu", async () => {
    render(
      <LocaleProvider locale="zh">
        <LocaleSwitcher />
      </LocaleProvider>
    );

    expect(screen.getByRole("button", { name: "语言菜单" })).toHaveTextContent("简体中文");

    fireEvent.click(screen.getByRole("button", { name: "语言菜单" }));

    expect(await screen.findByRole("menuitem", { name: "简体中文" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("menuitem", { name: "English" })).toHaveAttribute("href", "/en/tests/enneagram-personality-test-nine-types/take");
    expect(screen.getByText("ZH")).toBeInTheDocument();
    expect(screen.getByText("EN")).toBeInTheDocument();
  });
});
