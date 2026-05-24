import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const validatorModuleUrl = pathToFileURL(path.join(ROOT, "scripts/validate-staging-cms-baseline.mjs")).href;
const EN_LOCALE = { app: "en", api: "en" };

type RecommendedArticleValidator = {
  validateRecommendedArticlesExactCount: (
    items: unknown[],
    locale: { app: string; api: string }
  ) => { ok: boolean; count: number; expected: number; articles: unknown[] };
};

function currentChangedFiles(): string[] {
  const files = new Set<string>();

  const collect = (args: string[]) => {
    const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
    for (const line of output.split("\n")) {
      const file = line.trim();
      if (file && !file.startsWith(".playwright-mcp/")) {
        files.add(file);
      }
    }
  };

  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    collect(args);
  }

  if (files.size === 0) {
    try {
      const base = execFileSync("git", ["merge-base", "origin/main", "HEAD"], {
        cwd: ROOT,
        encoding: "utf8",
      }).trim();
      collect(["diff", "--name-only", base, "HEAD"]);
    } catch {
      collect(["diff", "--name-only", "HEAD~1", "HEAD"]);
    }
  }

  return [...files].sort();
}

function article(index: number, overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    slug: `recommended-${index}`,
    title: `Recommended ${index}`,
    locale: "en",
    status: "published",
    is_public: true,
    ...overrides,
  };
}

async function loadValidator(): Promise<RecommendedArticleValidator> {
  return import(validatorModuleUrl) as Promise<RecommendedArticleValidator>;
}

describe("staging CMS baseline recommended article validation", () => {
  it("accepts exactly six published public recommended articles", async () => {
    const { validateRecommendedArticlesExactCount } = await loadValidator();
    const result = validateRecommendedArticlesExactCount(
      Array.from({ length: 6 }, (_, index) => article(index + 1)),
      EN_LOCALE
    );

    expect(result).toMatchObject({
      ok: true,
      count: 6,
      expected: 6,
    });
    expect(result.articles).toHaveLength(6);
  });

  it("rejects seven published public recommended articles before any display truncation", async () => {
    const { validateRecommendedArticlesExactCount } = await loadValidator();
    const result = validateRecommendedArticlesExactCount(
      Array.from({ length: 7 }, (_, index) => article(index + 1)),
      EN_LOCALE
    );

    expect(result).toMatchObject({
      ok: false,
      count: 7,
      expected: 6,
    });
    expect(result.articles).toHaveLength(7);
  });

  it("keeps the PR-WEB-SEC-17 changed files inside scope", () => {
    const changed = currentChangedFiles();

    expect(changed).toEqual(expect.arrayContaining(["tests/contracts/staging-cms-baseline-validator.contract.test.ts"]));
    expect(changed.every(isCurrentRiasecPack12AllowedFile), changed.join("\n")).toBe(true);
  });
});
