import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const ROOT = process.cwd();
const KNOWN_EN_ARTICLE_404_LINKS = [
  "/articles/mbti-basics",
  "/articles/mbti-growth-guide",
  "/articles/mbti-narrative-portrait",
  "/articles/big-five-tool-guide",
  "/articles/eq-test-tool-guide",
];

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("navigation dead link contract", () => {
  it("does not expose known missing english article detail links from header or footer navigation", () => {
    const articlesMenu = getHeaderDropdownMenus("en").find((menu) => menu.key === "articles");
    expect(articlesMenu?.items.map((item) => item.href)).toEqual(["/articles"]);

    for (const href of KNOWN_EN_ARTICLE_404_LINKS) {
      expect(articlesMenu?.items.some((item) => item.href === href)).toBe(false);
    }

    const footer = read("components/layout/SiteFooter.tsx");

    for (const href of KNOWN_EN_ARTICLE_404_LINKS) {
      expect(footer).not.toContain(`href: "${href}"`);
    }
    expect(footer).not.toContain('{ href: "/articles", label: "All articles" }');
    expect(footer).toContain('{ href: "/topics", label: "Topics" }');
    expect(footer).toContain('{ href: "/career/guides", label: "Assessment Guides" }');
    expect(footer).toContain('{ href: "/articles", label: "Journal" }');
    expect(footer).toContain('{ href: "/articles", label: "Research reports" }');
    expect(footer).toContain('{ href: "/science", label: "Assessment science" }');
    expect(footer).toContain('{ href: "/method-boundaries", label: "Method boundaries" }');
    expect(footer).toContain('{ href: "/item-design-notes", label: "Item design notes" }');
    expect(footer).toContain('{ href: "/reliability-validity", label: "Reliability & validity" }');
    expect(footer).toContain('{ href: "/data-privacy", label: "Data notes" }');
    expect(footer).toContain('{ href: "/common-misconceptions", label: "Common misconceptions" }');
  });
});
