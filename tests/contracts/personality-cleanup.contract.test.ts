import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const requireFromRoot = createRequire(path.join(ROOT, "package.json"));

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function sliceBetween(source: string, start: string, end: string): string {
  const startIndex = source.indexOf(start);
  const endIndex = source.indexOf(end, startIndex + start.length);

  if (startIndex === -1 || endIndex === -1) {
    return "";
  }

  return source.slice(startIndex, endIndex);
}

describe("personality cleanup contract", () => {
  it("frontend next-sitemap no longer generates personality list or detail authority", async () => {
    const config = requireFromRoot("./next-sitemap.config.js");
    const additionalPaths = await config.additionalPaths();
    const locs = additionalPaths.map((entry: { loc?: string }) => String(entry?.loc ?? ""));

    expect(locs.some((loc: string) => /^\/(en|zh)\/personality(?:\/|$)/.test(loc))).toBe(false);
  });

  it("personality detail page no longer imports or uses the local mbti fallback", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('from "@/lib/cms/personality"');
    expect(source).not.toContain("getMbtiRecommendation");
    expect(source).not.toContain("buildFallbackFaqItems");
    expect(source).not.toContain("buildFallbackAnswerFirst");
    expect(source).toContain('return { title: "Not Found", robots: { index: false, follow: false } };');
    expect(source).toContain("return notFound();");
  });

  it("llms.txt personality coverage is cms-driven and has no local fallback branch", () => {
    const source = read("app/llms.txt/route.ts");
    const personalityBlock = sliceBetween(source, "async function listPersonalityPaths()", "async function listTopicPaths()");

    expect(personalityBlock).toContain("listPersonalityProfiles");
    expect(personalityBlock).toContain("item.isIndexable");
    expect(personalityBlock).toContain("return [];");
    expect(personalityBlock).not.toContain("listMbtiRecommendationTypes()");
    expect(personalityBlock).not.toContain("Fall back to local MBTI coverage");
  });

  it("llms-full.txt personality coverage is cms-driven and has no local fallback branch", () => {
    const source = read("app/llms-full.txt/route.ts");
    const personalityBlock = sliceBetween(source, "async function listPersonalityEntries()", "async function listTopicEntries()");

    expect(personalityBlock).toContain("listPersonalityProfiles");
    expect(personalityBlock).toContain("item.isIndexable");
    expect(personalityBlock).toContain("return [];");
    expect(personalityBlock).not.toContain("listMbtiRecommendationTypes()");
    expect(personalityBlock).not.toContain("Fall back to local MBTI coverage");
  });
});
