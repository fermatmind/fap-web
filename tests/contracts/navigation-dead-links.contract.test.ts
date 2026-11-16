import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { getHeaderDropdownMenus } from "@/lib/navigation/headerDropdownMenus";

const ROOT = process.cwd();
const HEADER_ARTICLE_LINKS = [
  "/articles/mbti-basics",
  "/articles/mbti-growth-guide",
  "/articles/big-five-tool-guide",
  "/articles/eq-test-tool-guide",
];

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("navigation dead link contract", () => {
  it("uses the verified article shortcuts in each language header and keeps the footer on directory links", () => {
    for (const locale of ["zh", "en", "zh-TW"] as const) {
      const articlesMenu = getHeaderDropdownMenus(locale).find((menu) => menu.key === "articles");
      expect(articlesMenu?.items.map((item) => item.href)).toEqual(["/articles", ...HEADER_ARTICLE_LINKS]);
    }

    const footer = read("components/layout/SiteFooter.tsx");

    for (const href of [...HEADER_ARTICLE_LINKS, "/articles/mbti-narrative-portrait"]) {
      expect(footer).not.toContain(`href: "${href}"`);
    }
    expect(footer).not.toContain('{ href: "/articles", label: "All articles" }');
    expect(footer).toContain('{ href: "/topics", label: "Understand yourself" }');
    expect(footer).toContain('{ href: "/career/guides", label: "Career Guides" }');
    expect(footer).toContain('{ href: "/articles", label: dict.header.articles }');
    expect(footer).not.toContain('{ href: "/articles", label: "Research reports" }');
    expect(footer).toContain('{ href: "/science", label: "Assessment science" }');
    expect(footer).toContain('{ href: "/method-boundaries", label: "Method boundaries" }');
    expect(footer).toContain('{ href: "/item-design-notes", label: "Item design notes" }');
    expect(footer).toContain('{ href: "/reliability-validity", label: "Reliability & validity" }');
    expect(footer).toContain('{ href: "/data-privacy", label: "Data notes" }');
    expect(footer).toContain('{ href: "/common-misconceptions", label: "Common misconceptions" }');
  });
});
