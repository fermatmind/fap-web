import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("Next static generation timeout", () => {
  it("keeps static generation timeout explicit for heavyweight localized test pages", () => {
    const nextConfig = read("next.config.mjs");

    expect(nextConfig).toMatch(/staticPageGenerationTimeout:\s*240\b/);
  });
});
