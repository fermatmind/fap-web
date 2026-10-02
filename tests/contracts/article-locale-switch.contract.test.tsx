import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import LocaleSwitcherMenu from "@/components/i18n/LocaleSwitcherMenu";
import { resolveLocaleSwitchHref } from "@/components/i18n/useLocaleSwitchHref";

vi.mock("next/link", () => ({ default: ({ href, children, onClick, prefetch, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => {
  void prefetch;
  return <a href={href} {...props} onClick={(event) => { event.preventDefault(); onClick?.(event); }}>{children}</a>;
} }));

function metadata(canonical: string, alternate?: string) {
  const head = document.createElement("head");
  head.innerHTML = `<link rel="canonical" href="${canonical}">${alternate ? `<link rel="alternate" hreflang="zh-CN" href="${alternate}">` : ""}`;
  return head;
}

afterEach(() => {
  cleanup();
  document.querySelectorAll('[data-locale-test]').forEach((node) => node.remove());
});

describe("Article language navigation authority", () => {
  it("uses a published counterpart with a different slug", () => {
    expect(resolveLocaleSwitchHref("/en/articles/english-copy", "zh", metadata("https://fermatmind.com/en/articles/english-copy", "https://fermatmind.com/zh/articles/chinese-copy"))).toBe("/zh/articles/chinese-copy");
  });

  it.each([
    metadata("https://fermatmind.com/en/articles/current"),
    metadata("https://fermatmind.com/en/articles/previous", "https://fermatmind.com/zh/articles/previous"),
    metadata("https://fermatmind.com/en/articles/current", "https://other.example/zh/articles/current"),
    metadata("https://fermatmind.com/en/articles/current", "https://fermatmind.com/zh/articles/current?private=1"),
  ])("uses the article list when pairing is missing, stale or invalid", (head) => {
    expect(resolveLocaleSwitchHref("/en/articles/current", "zh", head)).toBe("/zh/articles");
  });

  it("keeps other route families unchanged", () => {
    expect(resolveLocaleSwitchHref("/en/support/result-recovery", "zh")).toBe("/zh/support/result-recovery");
    expect(resolveLocaleSwitchHref("/zh/tests/mbti", "en")).toBe("/en/tests/mbti");
  });

  it("renders the published counterpart in the desktop menu", () => {
    const head = metadata("https://fermatmind.com/en/articles/current", "https://fermatmind.com/zh/articles/translated");
    for (const node of Array.from(head.children)) { node.setAttribute("data-locale-test", "true"); document.head.appendChild(node); }
    const onSelect = vi.fn();
    render(<LocaleProvider locale="en"><LocaleSwitcherMenu locale="en" pathname="/en/articles/current" onSelect={onSelect} /></LocaleProvider>);
    const link = screen.getByRole("menuitem", { name: "简体中文" });
    expect(link).toHaveAttribute("href", "/zh/articles/translated");
    fireEvent.click(link);
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it.each(["head", "body"] as const)("updates metadata streamed into %s and rejects a previous page's counterpart during navigation", async (location) => {
    const view = render(<LocaleProvider locale="en"><LocaleSwitcherMenu locale="en" pathname="/en/articles/current" onSelect={() => {}} /></LocaleProvider>);
    expect(screen.getByRole("menuitem", { name: "简体中文" })).toHaveAttribute("href", "/zh/articles");
    await act(async () => {
      for (const node of Array.from(metadata("https://fermatmind.com/en/articles/current", "https://fermatmind.com/zh/articles/translated").children)) {
        node.setAttribute("data-locale-test", "true"); document[location].appendChild(node);
      }
    });
    expect(screen.getByRole("menuitem", { name: "简体中文" })).toHaveAttribute("href", "/zh/articles/translated");
    view.rerender(<LocaleProvider locale="en"><LocaleSwitcherMenu locale="en" pathname="/en/articles/another" onSelect={() => {}} /></LocaleProvider>);
    expect(screen.getByRole("menuitem", { name: "简体中文" })).toHaveAttribute("href", "/zh/articles");
  });
});
