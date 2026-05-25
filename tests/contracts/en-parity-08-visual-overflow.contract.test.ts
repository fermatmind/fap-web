import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("EN-PARITY-08 visual overflow source contract", () => {
  it("allows the homepage hero H1 to wrap instead of forcing a desktop single line", () => {
    const source = readSource("components/marketing/HomePageExperience.tsx");

    expect(source).toContain("text-balance break-words");
    expect(source).not.toMatch(/<h1[^>]*md:whitespace-nowrap[^>]*>[\s\S]*\{copy\.hero\.title\}/);
  });

  it("allows the test detail hero H1 to wrap long localized titles", () => {
    const source = readSource("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(source).toContain("title={heroTitleDisplay.plain}");
    expect(source).toContain("max-w-full text-balance break-words");
    expect(source).not.toMatch(/<h1[^>]*md:whitespace-nowrap[^>]*>[\s\S]*\{heroTitleDisplay\.multilineFallback/);
  });
});
