import fs from "node:fs";
import path from "node:path";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PublicNavigationLink,
  PublicNavigationPendingIndicator,
} from "@/components/navigation/PublicNavigationPendingIndicator";

const routeState = vi.hoisted(() => ({
  pathname: "/zh/personality",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => routeState.pathname,
  useSearchParams: () => new URLSearchParams(routeState.search),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) => (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        event.preventDefault();
      }}
      {...props}
    >
      {children}
    </a>
  ),
}));

const read = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("public navigation pending feedback", () => {
  it("announces an accessible pending state until the route key changes", () => {
    window.history.replaceState(null, "", routeState.pathname);

    const view = render(
      <>
        <PublicNavigationPendingIndicator locale="zh" />
        <PublicNavigationLink href="/zh/personality/big-five">
          大五人格
        </PublicNavigationLink>
      </>
    );

    fireEvent.click(screen.getByRole("link", { name: "大五人格" }));
    expect(screen.getByRole("status", { name: "页面加载中" })).toHaveAttribute(
      "data-public-navigation-pending",
      "true"
    );

    routeState.pathname = "/zh/personality/big-five";
    window.history.replaceState(null, "", routeState.pathname);
    view.rerender(
      <>
        <PublicNavigationPendingIndicator locale="zh" />
        <PublicNavigationLink href="/zh/personality/big-five">
          大五人格
        </PublicNavigationLink>
      </>
    );

    expect(screen.queryByRole("status", { name: "页面加载中" })).not.toBeInTheDocument();
  });

  it("does not enter pending for modified clicks or the current URL", () => {
    routeState.pathname = "/en/personality";
    routeState.search = "";
    window.history.replaceState(null, "", routeState.pathname);

    render(
      <>
        <PublicNavigationPendingIndicator locale="en" />
        <PublicNavigationLink href="/en/personality">Personality</PublicNavigationLink>
        <PublicNavigationLink href="/en/articles">Articles</PublicNavigationLink>
      </>
    );

    fireEvent.click(screen.getByRole("link", { name: "Personality" }));
    fireEvent.click(screen.getByRole("link", { name: "Articles" }), { metaKey: true });

    expect(screen.queryByRole("status", { name: "Loading page" })).not.toBeInTheDocument();
  });

  it("wires only shared public internal navigation surfaces", () => {
    const header = read("components/layout/SiteHeader.tsx");
    const dropdown = read("components/layout/SiteHeaderDropdownPanel.tsx");
    const footer = read("components/layout/SiteFooter.tsx");
    const localeMenu = read("components/i18n/LocaleSwitcherMenu.tsx");

    expect(header).toContain("<PublicNavigationPendingIndicator locale={locale} />");
    expect(header).toContain("<PublicNavigationLink");
    expect(header).toMatch(/<Link[\s\S]*?href=\{withLocale\("\/results\/lookup"\)\}/);
    expect(dropdown).toContain("<PublicNavigationLink");
    expect(footer).toContain("<PublicNavigationLink");
    expect(localeMenu).toContain("<PublicNavigationLink");
    expect(footer).toContain("<a");
  });
});
