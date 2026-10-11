import { act, fireEvent, render, screen } from "@testing-library/react";
import { Suspense } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteHeader } from "@/components/layout/SiteHeader";

const loading = vi.hoisted(() => ({ ready: false, promise: Promise.resolve(), resolve: () => {} }));
vi.mock("next/dynamic", () => ({ default: () => (props: { id: string; triggerId: string }) => {
  if (!loading.ready) throw loading.promise;
  const href = "/en/tests";
  return <div role="menu" id={props.id} aria-labelledby={props.triggerId}><a role="menuitem" href={href}>Browse assessments</a></div>;
} }));
vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));
vi.mock("next/link", () => ({ default: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/components/i18n/LocaleSwitcher", () => ({ LocaleSwitcher: () => null }));
vi.mock("@/components/navigation/PublicNavigationPendingIndicator", () => ({
  PublicNavigationLink: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...props}>{children}</a>,
  PublicNavigationPendingIndicator: () => null,
}));

describe("desktop menu lazy loading", () => {
  beforeEach(() => {
    loading.ready = false;
    loading.promise = new Promise<void>((resolve) => { loading.resolve = resolve; });
  });
  it.each(["Enter", "ArrowDown"])("keeps the focused header visible while %s loads the first menu", async (key) => {
    render(<Suspense fallback={<p>Header suspended</p>}><LocaleProvider locale="en"><SiteHeader /></LocaleProvider></Suspense>);
    const trigger = screen.getByRole("button", { name: "Tests menu" });
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key });
    expect(screen.queryByText("Header suspended")).not.toBeInTheDocument();
    expect(trigger).toBeVisible();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await act(async () => { loading.ready = true; loading.resolve(); await loading.promise; });
    expect(await screen.findByRole("menu")).toBeVisible();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
