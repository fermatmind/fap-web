import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "jest-axe";
import { SelfUnderstandingResources } from "@/components/topics/SelfUnderstandingResources";
import { getRelationshipReadingLinks, getSelfUnderstandingMenu, getSelfUnderstandingResources } from "@/lib/navigation/selfUnderstandingResources";

vi.mock("next/link", () => ({ default: ({ href, children, className }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { prefetch?: boolean }) => <a href={href} className={className}>{children}</a> }));

describe("self-understanding reading directory", () => {
  it.each(["zh", "en"] as const)("connects all six %s menu destinations to three reading paths and a separate assessment", async (locale) => {
    const { container } = render(<SelfUnderstandingResources locale={locale} />);
    const resources = getSelfUnderstandingResources(locale);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(6);
    for (const [index, resource] of resources.entries()) {
      expect(new Set(resource.paths.map((path) => path.href)).size).toBe(3);
      const menuHref = getSelfUnderstandingMenu(locale)[index + 1].href;
      expect(menuHref).toBe(`/topics#${resource.id}`);
      const section = container.querySelector(`#${resource.id}`)!;
      expect(section).not.toBeNull();
      const links = within(section as HTMLElement).getAllByRole("link");
      expect(links).toHaveLength(4);
      expect(links.slice(0, 3).map((link) => link.getAttribute("href"))).toEqual(resource.paths.map((path) => `/${locale}${path.href}`));
      expect(links[3]).toHaveAttribute("href", `/${locale}${resource.testHref}`);
      expect(links.slice(0, 3).every((link) => !link.getAttribute("href")?.match(/\/topics\/(iq|eq|riasec)/))).toBe(true);
    }
    const result = await axe(container);
    expect(result.violations.filter((violation) => violation.id !== "region")).toEqual([]);
  });
  it.each(["zh", "en"] as const)("takes %s readers to actual result guides and candidate selection", (locale) => {
    const resources = getSelfUnderstandingResources(locale);
    expect(resources.find((item) => item.id === "big-five")?.paths[1].href).toBe("/articles/big-five-narrative-portrait");
    expect(resources.find((item) => item.id === "enneagram")?.paths[1].href).toBe("/personality/enneagram#forms");
    expect(resources.find((item) => item.id === "enneagram")?.paths[2].href).toBe("/personality/enneagram#shared_event");
    expect(resources.find((item) => item.id === "iq")?.paths[1].href).toBe("/articles/iq-test-score-and-limits-explained#article-body-markdown-block-35");
    expect(getRelationshipReadingLinks(locale).map((item) => item.href)).toEqual([
      "/articles/emotional-awareness-regulation-and-relationship-practice",
      "/articles/which-love-script-fits-you-best",
      "/personality/enfp#relationships",
    ]);
  });

});
