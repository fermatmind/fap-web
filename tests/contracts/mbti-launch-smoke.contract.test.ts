import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  MBTI_ADS_LAUNCH_MANIFEST,
  MBTI_ADS_LAUNCH_SIGNAL_EVENTS,
  MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS,
  MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES,
  MBTI_ADS_STABLE_SMOKE_LOCALES,
  getMbtiAdsLaunchTier,
  getMbtiAdsSurfacePolicy,
  getMbtiStableLaunchSmokeEntries,
  getMbtiStableLaunchSmokeMatrix,
} from "@/lib/mbti/adsPolicy";
import { filterTrackingPayload, TRACKING_EVENTS } from "@/lib/tracking/events";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("mbti launch smoke contract", () => {
  it("builds the stable launch smoke list from the manifest without candidate or forbidden pages", () => {
    const entries = getMbtiStableLaunchSmokeEntries("en");
    const paths = entries.map((entry) => entry.path);

    expect(paths).toEqual([
      "/en/tests/mbti-personality-test-16-personality-types",
      "/en/personality/intj-a",
      "/en/personality/infj-a",
      "/en/personality/istj-a",
      "/en/personality/enfj-a",
      "/en/career/recommendations/mbti/intj-a",
      "/en/career/recommendations/mbti/entj-a",
      "/en/career/recommendations/mbti/infj-a",
      "/en/career/recommendations/mbti/istj-a",
      "/en/personality",
      "/en/topics/mbti",
    ]);

    for (const entry of entries) {
      expect(getMbtiAdsSurfacePolicy(entry.path)).toBe(entry.surface);
      if (entry.typeCode) {
        expect(getMbtiAdsLaunchTier(entry.typeCode)).toBe("stable");
      }
      expect(entry.path.includes("/take")).toBe(false);
      expect(getMbtiAdsSurfacePolicy(entry.path)).not.toBe("forbidden");
    }

    for (const candidateType of MBTI_ADS_SECONDARY_WHITELIST_CANDIDATE_TYPES) {
      expect(paths.some((path) => path.includes(`/${candidateType.toLowerCase()}-a`))).toBe(false);
      expect(getMbtiAdsLaunchTier(candidateType)).toBe("candidate");
    }
  });

  it("keeps launch signal requirements aligned with the stable-launch manifest", () => {
    expect(MBTI_ADS_LAUNCH_MANIFEST.stableSmokePersonalityTypes).toEqual([
      "INTJ",
      "INFJ",
      "ISTJ",
      "ENFJ",
    ]);
    expect(MBTI_ADS_LAUNCH_MANIFEST.stableSmokeRecommendationTypes).toEqual([
      "INTJ",
      "ENTJ",
      "INFJ",
      "ISTJ",
    ]);
    expect(MBTI_ADS_LAUNCH_MANIFEST.stableSmokeLocales).toEqual(MBTI_ADS_STABLE_SMOKE_LOCALES);
    expect(MBTI_ADS_LAUNCH_MANIFEST.launchSignalEvents).toEqual(MBTI_ADS_LAUNCH_SIGNAL_EVENTS);
    expect(MBTI_ADS_LAUNCH_MANIFEST.launchSignalRequirements).toEqual(MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS);
  });

  it("builds the stable launch smoke matrix for both public locales", () => {
    const matrix = getMbtiStableLaunchSmokeMatrix();

    expect(Object.keys(matrix)).toEqual(["en", "zh"]);
    expect(matrix.en).toEqual(getMbtiStableLaunchSmokeEntries("en"));
    expect(matrix.zh).toEqual(getMbtiStableLaunchSmokeEntries("zh"));

    for (const locale of MBTI_ADS_STABLE_SMOKE_LOCALES) {
      for (const entry of matrix[locale]) {
        expect(entry.path.startsWith(`/${locale}/`)).toBe(true);
        expect(getMbtiAdsSurfacePolicy(entry.path)).toBe(entry.surface);
      }
    }
  });

  it("preserves launch attribution fields for landing, click, and start events", () => {
    const payload = {
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_144",
      entry_surface: "mbti_career_recommendation_detail",
      source_page_type: "career_recommendation_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/en/career/recommendations/mbti/intj-a",
      locale: "en",
      scaleCode: "MBTI",
      attempt_id: "attempt-start-123",
      attemptIdMasked: "abc123...xyz9",
      disclaimer_version: "v1",
      token: "forbidden",
      answers: "forbidden",
    };

    const landing = filterTrackingPayload(TRACKING_EVENTS.LANDING_VIEW, payload);
    const click = filterTrackingPayload(TRACKING_EVENTS.START_CLICK, payload);
    const start = filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, payload);

    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.landing_view) {
      expect(landing).toHaveProperty(key);
    }
    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.start_click) {
      expect(click).toHaveProperty(key);
    }
    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.start_attempt) {
      expect(start).toHaveProperty(key);
    }

    expect(click).not.toHaveProperty("token");
    expect(start).not.toHaveProperty("answers");
  });

  it("preserves launch-critical result and checkout signal fields", () => {
    const resultPayload = filterTrackingPayload(TRACKING_EVENTS.VIEW_RESULT, {
      attempt_id: "attempt-123",
      form_code: "mbti_144",
      locale: "en",
      locked: true,
      attemptIdMasked: "abc123...xyz9",
      answers: "forbidden",
    });

    const unlockPayload = filterTrackingPayload(TRACKING_EVENTS.CLICK_UNLOCK, {
      attempt_id: "attempt-123",
      form_code: "mbti_144",
      locale: "en",
      sku: "MBTI_REPORT_FULL_199",
      attemptIdMasked: "abc123...xyz9",
      token: "forbidden",
    });

    const orderPayload = filterTrackingPayload(TRACKING_EVENTS.CREATE_ORDER, {
      attempt_id: "attempt-123",
      orderNoMasked: "ord_html_1",
      form_code: "mbti_144",
      locale: "en",
      sku: "MBTI_REPORT_FULL_199",
      attemptIdMasked: "abc123...xyz9",
      token: "forbidden",
    });

    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.view_result) {
      expect(resultPayload).toHaveProperty(key);
    }
    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.click_unlock) {
      expect(unlockPayload).toHaveProperty(key);
    }
    for (const key of MBTI_ADS_LAUNCH_SIGNAL_REQUIREMENTS.create_order) {
      expect(orderPayload).toHaveProperty(key);
    }
  });

  it("keeps the launch smoke surfaces wired to landing-first public entry points", () => {
    const whitelistContract = read("tests/contracts/mbti-ads-whitelist.contract.test.ts");
    const landingPage = read("app/(localized)/[locale]/tests/[slug]/page.tsx");
    const personalityPage = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendationPage = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const topicPage = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(whitelistContract).toContain("routes public mbti discovery entry points to the landing page instead of the take page");
    expect(landingPage).toContain('data-testid="mbti-ads-primary-whitelist"');
    expect(landingPage).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(personalityPage).toContain('data-testid="mbti-personality-primary-cta"');
    expect(personalityPage).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(recommendationPage).toContain('data-testid="mbti-career-primary-cta"');
    expect(recommendationPage).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(topicPage).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
  });
});
