import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("spacing tokens contract", () => {
  it("defines base spacing and semantic spacing tokens in globals.css", () => {
    const css = read("app/globals.css");
    const requiredTokens = [
      "--fm-space-0:",
      "--fm-space-1:",
      "--fm-space-2:",
      "--fm-space-3:",
      "--fm-space-4:",
      "--fm-space-5:",
      "--fm-space-6:",
      "--fm-space-7:",
      "--fm-space-8:",
      "--fm-space-10:",
      "--fm-space-12:",
      "--fm-space-14:",
      "--fm-space-16:",
      "--fm-space-20:",
      "--fm-space-24:",
      "--fm-space-30:",
      "--fm-container-gutter:",
      "--fm-pad-card-x:",
      "--fm-pad-card-y:",
      "--fm-pad-btn-md-x:",
      "--fm-pad-btn-md-y:",
      "--fm-pad-badge-x:",
      "--fm-pad-badge-y:",
      "--fm-touch-target-min:",
    ];

    for (const token of requiredTokens) {
      expect(css).toContain(token);
    }
  });

  it("maps container/button/card/badge spacing to semantic tokens", () => {
    const container = read("components/layout/Container.tsx");
    const button = read("components/ui/button.tsx");
    const card = read("components/ui/card.tsx");
    const badge = read("components/ui/badge.tsx");

    expect(container).toContain("px-[var(--fm-container-gutter)]");

    expect(button).toContain("min-h-[var(--fm-touch-target-min)]");
    expect(button).toContain("px-[var(--fm-pad-btn-md-x)]");
    expect(button).toContain("py-[var(--fm-pad-btn-md-y)]");
    expect(button).toContain("px-[var(--fm-pad-btn-sm-x)]");
    expect(button).toContain("py-[var(--fm-pad-btn-sm-y)]");
    expect(button).toContain("px-[var(--fm-pad-btn-lg-x)]");
    expect(button).toContain("py-[var(--fm-pad-btn-lg-y)]");

    expect(card).toContain("px-[var(--fm-pad-card-x)]");
    expect(card).toContain("pb-[var(--fm-pad-card-y)]");
    expect(card).toContain("space-y-[var(--fm-gap-xs)]");

    expect(badge).toContain("px-[var(--fm-pad-badge-x)]");
    expect(badge).toContain("py-[var(--fm-pad-badge-y)]");
  });
});
