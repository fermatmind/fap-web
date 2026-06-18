import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";
import {
  SEO_CTA_DEFERRED_ATTRIBUTION_FIELDS,
  buildSeoCtaTrackingPayload,
  extractTargetTestSlugFromHref,
} from "@/lib/tracking/seoCtaAttribution";

describe("SEO page CTA attribution contract", () => {
  it("builds backend-safe CTA attribution metadata for SEO page test-start links", () => {
    const payload = buildSeoCtaTrackingPayload({
      locale: "zh",
      sourceRouteFamily: "article_detail",
      sourceSlug: "mbti-career-guide",
      contentId: 42,
      sourcePath: "/zh/articles/mbti-career-guide",
      href: "/zh/tests/mbti-personality-test-16-personality-types/take",
      ctaId: "start_test",
      attributionPayload: {
        utm_source: "google",
        utm_medium: "cpc",
        utm_campaign: "june_seo_pilot",
      },
    });

    expect(payload).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "june_seo_pilot",
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      article_slug: "mbti-career-guide",
      cta_id: "start_test",
      cta_priority: "contextual",
      entry_surface: "article_detail_seo_cta",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "mbti-career-guide",
      target_test_slug: "mbti-personality-test-16-personality-types",
      source_path: "/zh/articles/mbti-career-guide",
      target_action: "seo_cta_start_test",
      landing_path: "/zh/articles/mbti-career-guide",
      current_path: "/zh/articles/mbti-career-guide",
      locale: "zh",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, {
      ...payload,
      email: "person@example.com",
    })).toEqual({
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "june_seo_pilot",
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      cta_id: "start_test",
      entry_surface: "article_detail_seo_cta",
      source_page_type: "article_detail",
      source_route_family: "article",
      source_slug: "mbti-career-guide",
      target_test_slug: "mbti-personality-test-16-personality-types",
      target_action: "seo_cta_start_test",
      landing_path: "/zh/articles/mbti-career-guide",
      current_path: "/zh/articles/mbti-career-guide",
      locale: "zh",
    });
  });

  it("extracts target test slugs without changing public CTA destinations", () => {
    expect(extractTargetTestSlugFromHref("/en/tests/big-five-personality-test/take?utm_source=google")).toBe(
      "big-five-personality-test"
    );
    expect(extractTargetTestSlugFromHref("/zh/topics/mbti")).toBeNull();
  });

  it("documents attribution fields deferred until backend ingest owns them", () => {
    expect(SEO_CTA_DEFERRED_ATTRIBUTION_FIELDS.map((item) => item.field)).toEqual([
      "source_route_family",
      "source_slug",
      "content_id",
      "topic_id",
      "target_test_slug",
      "cta_id",
      "campaign",
    ]);

    for (const item of SEO_CTA_DEFERRED_ATTRIBUTION_FIELDS) {
      expect(item.reason).toMatch(/backend attribution ingest|UTM/);
    }
  });

  it("uses tracked CTA wrappers only on SEO page CTA paths in PR-SEO-JUNE-02 scope", () => {
    const articlePage = readFileSync("app/(localized)/[locale]/articles/[slug]/page.tsx", "utf8");
    const articleAnswerSurface = readFileSync("components/content/AnswerSurfaceSection.tsx", "utf8");
    const topicPage = readFileSync("app/(localized)/[locale]/topics/[slug]/page.tsx", "utf8");
    const testPage = readFileSync("app/(localized)/[locale]/tests/[slug]/page.tsx", "utf8");

    expect(articlePage).toContain("AnswerSurfaceSection");
    expect(articlePage).toContain("seoCtaAttribution");
    expect(articlePage).toContain('sourceRouteFamily: "article_detail"');
    expect(articlePage).toContain("contentId={article.id}");
    expect(articleAnswerSurface).toContain("SeoTrackedCtaLink");
    expect(topicPage).toContain("renderLandingCta");
    expect(topicPage).toContain('sourceRouteFamily="topic_detail"');
    expect(topicPage).toContain("topicId={topic.id}");
    expect(testPage).toContain('sourceRouteFamily: "test_detail"');
    expect(testPage).toContain("buildSeoCtaTrackingPayload");
  });
});
