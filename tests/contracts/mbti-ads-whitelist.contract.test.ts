import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MBTI_ADS_LAUNCH_MANIFEST,
  MBTI_ADS_FORBIDDEN_PATTERNS,
  MBTI_ADS_PRIMARY_WHITELIST,
  MBTI_ADS_SECONDARY_WHITELIST,
  MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES,
  MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES,
  MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES,
  MBTI_ADS_SEO_ONLY_PAGES,
  getMbtiAdsLaunchTier,
  getMbtiAdsSurfacePolicy,
  getMbtiSecondaryWhitelistHoldTypes,
  isMbtiSecondaryWhitelistCandidate,
  isMbtiSecondaryWhitelistStable,
} from "@/lib/mbti/adsPolicy";
import { MBTI_TYPE_CODES } from "@/lib/mbti/mbtiTypeContentPack";

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

  it("locks the mbti secondary whitelist into stable and candidate type tiers", () => {
    expect(MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES).toEqual([
      "INTP",
      "INTJ",
      "ENTJ",
      "INFJ",
      "INFP",
      "ENFJ",
      "ISTJ",
      "ISFJ",
      "ESTJ",
      "ESFJ",
    ]);

    expect(MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES).toEqual([
      "ENTP",
      "ENFP",
      "ISTP",
      "ISFP",
      "ESTP",
      "ESFP",
    ]);
  });

  it("keeps the launch tier helpers locale-agnostic and non-overlapping", () => {
    const stable = new Set(MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES);
    const candidate = new Set(MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES);

    for (const typeCode of MBTI_TYPE_CODES) {
      if (stable.has(typeCode as (typeof MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES)[number])) {
        expect(isMbtiSecondaryWhitelistStable(typeCode)).toBe(true);
        expect(getMbtiAdsLaunchTier(typeCode)).toBe("stable");
      }

      if (candidate.has(typeCode as (typeof MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES)[number])) {
        expect(isMbtiSecondaryWhitelistCandidate(typeCode)).toBe(true);
        expect(getMbtiAdsLaunchTier(typeCode)).toBe("candidate");
      }
    }

    for (const typeCode of MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES) {
      expect(candidate.has(typeCode as (typeof MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES)[number])).toBe(false);
    }

    expect(getMbtiAdsLaunchTier("entp")).toBe("candidate");
    expect(getMbtiAdsLaunchTier("intj")).toBe("stable");
    expect(getMbtiAdsLaunchTier("xxxx")).toBe("hold");
    expect(getMbtiSecondaryWhitelistHoldTypes()).toEqual([]);
  });

  it("keeps the type-tier rollout exhaustive across all 16 mbti canonical types", () => {
    expect(new Set(MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES)).toEqual(new Set(MBTI_TYPE_CODES));
    expect(new Set(MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES).size).toBe(MBTI_TYPE_CODES.length);
    expect(new Set(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistAllTypes)).toEqual(new Set(MBTI_TYPE_CODES));
    expect(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistHoldTypes).toEqual([]);
  });

  it("keeps a single launch manifest for ops-readable mbti ads rollout", () => {
    expect(MBTI_ADS_LAUNCH_MANIFEST.primaryWhitelistPages).toEqual(MBTI_ADS_PRIMARY_WHITELIST);
    expect(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistPages).toEqual(MBTI_ADS_SECONDARY_WHITELIST);
    expect(MBTI_ADS_LAUNCH_MANIFEST.seoOnlyPages).toEqual(MBTI_ADS_SEO_ONLY_PAGES);
    expect(MBTI_ADS_LAUNCH_MANIFEST.forbiddenPatterns).toEqual(MBTI_ADS_FORBIDDEN_PATTERNS);
    expect(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistAllTypes).toEqual(
      MBTI_ADS_SECONDARY_WHITELIST_ALL_TYPES
    );
    expect(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistStableTypes).toEqual(
      MBTI_ADS_SECONDARY_WHITELIST_STABLE_TYPES
    );
    expect(MBTI_ADS_LAUNCH_MANIFEST.secondaryWhitelistCandidateTypes).toEqual(
      MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES
    );
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
    expect(landing).toContain('sourcePath: mbtiLandingPath');
    expect(sticky).toContain('data-testid="mbti-sticky-primary-cta"');
    expect(sticky).toContain('data-testid="mbti-sticky-secondary-cta"');
    expect(sticky).toContain('data-testid="mbti-sticky-mobile-primary-cta"');
    expect(sticky).toContain('sourcePath: mbtiLandingPath');
  });

  it("routes public mbti discovery entry points to the landing page while keeping account CTAs out of take flow", () => {
    const headerMenus = read("lib/navigation/headerDropdownMenus.ts");
    const siteHeader = read("components/layout/SiteHeader.tsx");
    const hero = read("components/marketing/HeroSection.tsx");
    const socialProof = read("components/marketing/SocialProofSection.tsx");

    expect(headerMenus).toContain('/tests/mbti-personality-test-16-personality-types", label: "MBTI personality test"');
    expect(headerMenus).toContain('/tests/mbti-personality-test-16-personality-types", label: "MBTI 性格测试"');
    expect(headerMenus).not.toContain('/tests/mbti-personality-test-16-personality-types/take", label: "MBTI personality test"');
    expect(siteHeader).toContain('href={withLocale("/results/lookup")}');
    expect(siteHeader).not.toContain('href={withLocale("/tests/mbti-personality-test-16-personality-types/take")}');
    expect(hero).toContain('href={withLocale("/tests/mbti-personality-test-16-personality-types")}');
    expect(socialProof).toContain('href={withLocale("/tests/mbti-personality-test-16-personality-types")}');
  });

  it("keeps personality and recommendation detail pages in the ads secondary whitelist with reduced secondary CTA weight", () => {
    const personality = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendation = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(personality).toContain('data-ads-surface="secondary"');
    expect(personality).toContain('data-testid="mbti-personality-primary-cta"');
    expect(personality).toContain('size: "sm"');
    expect(personality).toContain("sourcePath: canonicalPath");

    expect(recommendation).toContain('data-ads-surface="secondary"');
    expect(recommendation).toContain('data-testid="mbti-career-primary-cta"');
    expect(recommendation).toContain('data-testid="mbti-career-secondary-cta"');
    expect(recommendation).toContain("sourcePath: canonicalPath");
  });

  it("keeps topic and personality index pages as seo-only entry surfaces while preserving landing attribution", () => {
    const personalityIndex = read("app/(localized)/[locale]/personality/page.tsx");
    const topicIndex = read("app/(localized)/[locale]/topics/page.tsx");
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(personalityIndex).toContain('entrySurface: "mbti_personality_index"');
    expect(personalityIndex).toContain("sourcePath: canonicalPath");
    expect(topicIndex).not.toContain('entrySurface: "mbti_topic_index"');
    expect(topicIndex).not.toContain("sourcePath: canonicalPath");
    expect(topicDetail).toContain('entrySurface: "mbti_topic_detail"');
    expect(topicDetail).toContain("sourcePath: canonicalPath");
  });
});
