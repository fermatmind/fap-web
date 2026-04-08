import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MBTI_ADS_FORBIDDEN_PATTERNS,
  MBTI_ADS_PRIMARY_WHITELIST,
  MBTI_ADS_SECONDARY_WHITELIST,
  MBTI_ADS_SEO_ONLY_PAGES,
  getMbtiAdsSurfacePolicy,
} from "@/lib/mbti/adsPolicy";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("mbti ads whitelist contract", () => {
  it("locks the mbti ads route map into primary, secondary, seo-only, and forbidden surfaces", () => {
    expect(MBTI_ADS_PRIMARY_WHITELIST).toEqual(["/tests/mbti-personality-test-16-personality-types"]);
    expect(MBTI_ADS_SECONDARY_WHITELIST).toEqual([
      "/personality/[type]",
      "/career/recommendations/mbti/[type]",
    ]);
    expect(MBTI_ADS_SEO_ONLY_PAGES).toEqual(["/personality", "/topics", "/topics/mbti"]);
    expect(MBTI_ADS_FORBIDDEN_PATTERNS).toEqual([
      "/result/[id]",
      "/tests/*/take",
      "/orders/*",
      "/payment/*",
      "/share/*",
      "/compare/*",
      "/history/*",
    ]);
  });

  it("classifies mbti ads surfaces with locale-aware routing", () => {
    expect(getMbtiAdsSurfacePolicy("/en/tests/mbti-personality-test-16-personality-types")).toBe("primary");
    expect(getMbtiAdsSurfacePolicy("/zh/personality/intj-a")).toBe("secondary");
    expect(getMbtiAdsSurfacePolicy("/en/career/recommendations/mbti/intj-a")).toBe("secondary");
    expect(getMbtiAdsSurfacePolicy("/zh/personality")).toBe("seo_only");
    expect(getMbtiAdsSurfacePolicy("/en/topics/mbti")).toBe("seo_only");
    expect(getMbtiAdsSurfacePolicy("/en/result/attempt-123")).toBe("forbidden");
    expect(getMbtiAdsSurfacePolicy("/zh/tests/mbti-personality-test-16-personality-types/take")).toBe("forbidden");
  });

  it("keeps the mbti test landing as the primary ads surface with a dominant primary CTA", () => {
    const landing = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const sticky = read("components/business/CTASticky.tsx");

    expect(landing).toContain('data-testid="mbti-ads-primary-whitelist"');
    expect(landing).toContain('data-testid="mbti-landing-primary-cta"');
    expect(landing).toContain('data-testid="mbti-landing-secondary-cta"');
    expect(landing).toContain('data-testid="mbti-landing-cta-guidance"');
    expect(landing).toContain('sourcePath: mbtiLandingPath');
    expect(sticky).toContain('data-testid="mbti-sticky-primary-cta"');
    expect(sticky).toContain('data-testid="mbti-sticky-secondary-cta"');
    expect(sticky).toContain('data-testid="mbti-sticky-mobile-primary-cta"');
    expect(sticky).toContain('sourcePath: mbtiLandingPath');
  });

  it("keeps personality and recommendation detail pages in the ads secondary whitelist with reduced secondary CTA weight", () => {
    const personality = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendation = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(personality).toContain('data-ads-surface="secondary"');
    expect(personality).toContain('data-testid="mbti-personality-primary-cta"');
    expect(personality).toContain('data-testid="mbti-personality-secondary-cta"');
    expect(personality).toContain('data-testid="mbti-personality-cta-guidance"');
    expect(personality).toContain('size: "sm"');
    expect(personality).toContain("sourcePath: canonicalPath");

    expect(recommendation).toContain('data-ads-surface="secondary"');
    expect(recommendation).toContain('data-testid="mbti-career-primary-cta"');
    expect(recommendation).toContain('data-testid="mbti-career-secondary-cta"');
    expect(recommendation).toContain('data-testid="mbti-career-cta-guidance"');
    expect(recommendation).toContain('size: "sm"');
    expect(recommendation).toContain("sourcePath: canonicalPath");
  });

  it("keeps topic and personality index pages as seo-only entry surfaces while preserving landing attribution", () => {
    const personalityIndex = read("app/(localized)/[locale]/personality/page.tsx");
    const topicIndex = read("app/(localized)/[locale]/topics/page.tsx");
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(personalityIndex).toContain('entrySurface: "mbti_personality_index"');
    expect(personalityIndex).toContain("sourcePath: canonicalPath");
    expect(topicIndex).toContain('entrySurface: "mbti_topic_index"');
    expect(topicIndex).toContain("sourcePath: canonicalPath");
    expect(topicDetail).toContain('entrySurface: "mbti_topic_detail"');
    expect(topicDetail).toContain("sourcePath: canonicalPath");
  });
});
