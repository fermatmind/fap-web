import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("default not-found contract", () => {
  it("renders crawl-safe route-group 404 pages with one h1 and useful internal links", () => {
    const sources = [
      read("app/(root)/not-found.tsx"),
      read("app/(localized)/[locale]/not-found.tsx"),
    ];

    expect(fs.existsSync(path.join(ROOT, "app/not-found.tsx"))).toBe(false);

    for (const source of sources) {
      expect(source.match(/<h1/g)?.length ?? 0).toBe(1);
      expect(source).toContain("robots");
      expect(source).toContain("index: false");

      for (const href of [
        "/en/tests",
        "/en/personality",
        "/en/career",
        "/en/articles",
        "/en/support",
        "/zh/tests",
        "/zh/personality",
        "/zh/career",
        "/zh/articles",
        "/zh/support",
      ]) {
        expect(source).toContain(href);
      }
    }
  });

  it("keeps serialized not-found boundaries free of soft-404 body phrases", () => {
    const sources = [
      read("app/(root)/not-found.tsx"),
      read("app/(localized)/[locale]/not-found.tsx"),
    ];

    for (const source of sources) {
      expect(source).not.toContain("Page Not Found");
      expect(source).not.toContain("Page not found");
      expect(source).not.toContain(">404<");
      expect(source).not.toContain("This link is no longer available");
    }
  });
});
