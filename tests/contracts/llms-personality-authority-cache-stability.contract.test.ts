import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();

describe("llms.txt personality authority cache stability", () => {
  it("isolates MBTI and Big Five authority budgets so one timeout cannot erase the other cohort", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");
    const personalityBlock = route.slice(
      route.indexOf("async function listPersonalityPaths"),
      route.indexOf("async function listTopicPaths"),
    );

    expect(personalityBlock.match(/withLlmsRouteBudget\(/g)).toHaveLength(3);
    expect(personalityBlock).toContain("listBackendSitemapMbtiPersonalityPaths({ signal })");
    expect(personalityBlock).toContain("listBackendSitemapBigFiveZhPaths({ signal })");
    expect(personalityBlock).toContain("listEnneagramLlmsPaths({ signal })");
    expect(personalityBlock).toContain("mbtiAuthorityAvailable: mbtiPersonalityPaths.length > 0");
  });

  it("does not cache a degraded response that omitted backend-authoritative MBTI URLs", () => {
    const route = fs.readFileSync(path.join(ROOT, "app/llms.txt/route.ts"), "utf8");

    expect(route).toContain("personalityResult.mbtiAuthorityAvailable");
    expect(route).toContain('"public, s-maxage=3600, stale-while-revalidate=86400"');
    expect(route).toContain('"private, no-store, max-age=0"');
    expect(route).not.toMatch(/(?:istj-a|intj-vs-intp|entj-vs-intj)/);
  });
});
