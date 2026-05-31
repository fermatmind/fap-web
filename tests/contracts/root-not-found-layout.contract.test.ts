import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("root not-found layout contract", () => {
  it("keeps 404 boundaries inside route groups with root layouts", () => {
    expect(fs.existsSync(path.join(ROOT, "app/not-found.tsx"))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, "app/(root)/layout.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "app/(root)/not-found.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "app/(localized)/[locale]/layout.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, "app/(localized)/[locale]/not-found.tsx"))).toBe(true);
  });

  it("preserves crawl-safe 404 metadata and public recovery links", () => {
    const rootSource = read("app/(root)/not-found.tsx");
    const localizedSource = read("app/(localized)/[locale]/not-found.tsx");

    for (const source of [rootSource, localizedSource]) {
      expect(source.match(/<h1/g)?.length ?? 0).toBe(1);
      expect(source).toContain("robots");
      expect(source).toContain("index: false");
      expect(source).toContain("/en/tests");
      expect(source).toContain("/en/personality");
      expect(source).toContain("/en/career");
      expect(source).toContain("/en/articles");
      expect(source).toContain("/en/support");
      expect(source).toContain("/zh/tests");
      expect(source).toContain("/zh/personality");
      expect(source).toContain("/zh/career");
      expect(source).toContain("/zh/articles");
      expect(source).toContain("/zh/support");
    }
  });

  it("does not put soft-404 wording into route-group not-found component bodies", () => {
    const rootSource = read("app/(root)/not-found.tsx");
    const localizedSource = read("app/(localized)/[locale]/not-found.tsx");

    for (const source of [rootSource, localizedSource]) {
      expect(source).not.toContain("Page Not Found");
      expect(source).not.toContain("Page not found");
      expect(source).not.toContain(">404<");
      expect(source).not.toContain("This link is no longer available");
    }
  });
});
