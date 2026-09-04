import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("CJK punctuation typography", () => {
  it("uses sans-serif question marks inside serif display text", () => {
    const css = fs.readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");

    expect(css).toContain('font-family: "FM Punctuation Sans";');
    expect(css).toContain("unicode-range: U+003F;");
    expect(css).toContain("unicode-range: U+FF1F;");
    expect(css).toContain('--font-serif: "FM Punctuation Sans", var(--font-fm-serif);');
  });
});
