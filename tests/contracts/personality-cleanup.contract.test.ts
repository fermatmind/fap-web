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
  it("frontend next-sitemap keeps public personality landing coverage available", () => {
    const configSource = read("next-sitemap.config.js");
    const { buildStaticGeneratedPaths } = requireFromRoot("./lib/seo/sitemapAuthorityAdapters.cjs") as {
      buildStaticGeneratedPaths: () => string[];
    };

    expect(configSource).toContain("buildStaticGeneratedPaths");
    expect(buildStaticGeneratedPaths()).toEqual(expect.arrayContaining(["/en/personality", "/zh/personality"]));
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

  it("llms.txt personality coverage follows backend sitemap authority without local inference", () => {
    const source = read("app/llms.txt/route.ts");
    const personalityBlock = sliceBetween(
      source,
      "async function listPersonalityPaths(): Promise<PersonalityPathResult>",
      "async function listTopicPaths()",
    );

    expect(personalityBlock).toContain("listBackendSitemapMbtiPersonalityPaths");
    expect(personalityBlock).toContain("listBackendSitemapBigFiveZhPaths");
    expect(personalityBlock).toContain("{ signal }");
    expect(source).toContain("return dedupePaths([...mbtiPersonalityPaths, ...bigFiveZhPaths]);");
    expect(personalityBlock).toContain("...mergePersonalityPaths(mbtiPersonalityPaths, bigFiveZhPaths)");
    expect(personalityBlock).toContain("...enneagramPaths");
    expect(personalityBlock).toContain("mbtiAuthorityAvailable: mbtiPersonalityPaths.length > 0");
    expect(personalityBlock).not.toContain("listPersonalityProfiles");
    expect(personalityBlock).not.toContain("publishedPersonalityVariantSlugs");
    expect(personalityBlock).not.toContain("listMbtiRecommendationTypes()");
    expect(personalityBlock).not.toContain("Fall back to local MBTI coverage");
  });

  it("llms-full.txt personality coverage follows backend sitemap authority without local inference", () => {
    const source = read("app/llms-full.txt/route.ts");
    const personalityBlock = sliceBetween(source, "async function listPersonalityEntries()", "async function listTopicEntries()");

    expect(personalityBlock).toContain("listBackendSitemapMbtiPersonalityPaths");
    expect(personalityBlock).toContain("listBackendSitemapBigFiveZhPaths");
    expect(personalityBlock).toContain("return uniqueEntriesByPath([...mbtiEntries, ...bigFiveZhEntries]);");
    expect(personalityBlock).not.toContain("listPersonalityProfiles");
    expect(personalityBlock).not.toContain("personalityVariantEntriesFromBaseProfile");
    expect(personalityBlock).not.toContain("listMbtiRecommendationTypes()");
    expect(personalityBlock).not.toContain("Fall back to local MBTI coverage");
  });
});
