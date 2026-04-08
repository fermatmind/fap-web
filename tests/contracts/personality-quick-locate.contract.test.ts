import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { searchPersonalityQuickLocate, type PersonalityQuickLocateIndex } from "@/lib/mbti/personalityQuickLocate";

describe("personality quick locate contract", () => {
  const pagePath = path.join(process.cwd(), "app/(localized)/[locale]/personality/page.tsx");
  const quickLocatePath = path.join(process.cwd(), "lib/mbti/personalityQuickLocate.ts");
  const pageSource = fs.readFileSync(pagePath, "utf8");
  const quickLocateSource = fs.readFileSync(quickLocatePath, "utf8");
  const index: PersonalityQuickLocateIndex = {
    typeResults: [
      {
        kind: "type",
        typeCode: "INTJ",
        title: "Architect",
        excerpt: "Strategic systems thinker who prefers long-range planning and independent problem-solving.",
        href: "/en/personality/intj-a",
        recommendationHref: "/en/career/recommendations/mbti/intj-a",
        groupKey: "analysts",
        groupTitle: "Analysts",
        keywords: ["intj", "architect", "strategic", "mastermind"],
        launchTier: "stable",
      },
      {
        kind: "type",
        typeCode: "ENFJ",
        title: "Protagonist",
        excerpt: "People-centered organizer who turns shared values into coordinated momentum.",
        href: "/en/personality/enfj-a",
        recommendationHref: "/en/career/recommendations/mbti/enfj-a",
        groupKey: "diplomats",
        groupTitle: "Diplomats",
        keywords: ["enfj", "protagonist", "mentor", "teacher"],
        launchTier: "stable",
      },
    ],
    careerResults: [
      {
        kind: "career",
        title: "Product Manager",
        slug: "product-manager",
        href: "/en/career/jobs/product-manager",
        summary: "Owns strategy, roadmap, and cross-functional delivery.",
        keywords: ["product manager", "roadmap", "strategy"],
      },
    ],
  };

  it("wires the personality hero to a real quick-locate index", () => {
    expect(pageSource).toContain("buildPersonalityQuickLocateIndex({");
    expect(pageSource).toContain("<PersonalityHeroExecutiveSummary");
    expect(pageSource).toContain("quickLocateIndex={quickLocateIndex}");
  });

  it("builds career search entries from CMS-backed jobs", () => {
    expect(quickLocateSource).toContain("listCareerJobsFromCms");
    expect(quickLocateSource).toContain("careerResults");
    expect(quickLocateSource).toContain("recommendationHref");
  });

  it("matches type codes, archetype titles, and career titles", () => {
    expect(searchPersonalityQuickLocate(index, "INTJ").typeResults[0]?.typeCode).toBe("INTJ");
    expect(searchPersonalityQuickLocate(index, "architect").typeResults[0]?.title).toBe("Architect");
    expect(searchPersonalityQuickLocate(index, "product").careerResults[0]?.title).toBe("Product Manager");
  });

  it("keeps an explicit no-result fallback state", () => {
    const emptyResult = searchPersonalityQuickLocate(index, "");
    const missResult = searchPersonalityQuickLocate(index, "zzzz");

    expect(emptyResult.query).toBe("");
    expect(emptyResult.typeResults).toHaveLength(0);
    expect(emptyResult.careerResults).toHaveLength(0);
    expect(missResult.query).toBe("zzzz");
    expect(missResult.typeResults).toHaveLength(0);
    expect(missResult.careerResults).toHaveLength(0);
  });
});
