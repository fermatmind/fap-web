import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("default not-found contract", () => {
  it("renders a crawl-safe 404 page with one h1 and useful internal links", () => {
    const source = read("app/not-found.tsx");

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
      expect(source).toContain(`href: "${href}"`);
    }
  });
});
