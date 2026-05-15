import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  appendSeoCtaContextParamsToHref,
  buildSeoAttemptStartAttributionFromSearchParams,
  buildSeoCtaNavigationHref,
  extractSeoCtaContextParamsFromRecord,
} from "@/lib/tracking/seoCtaAttribution";

describe("SEO-OPS-02 article CTA attribution contract", () => {
  it("preserves safe article UTM and CTA context in test CTA navigation hrefs", () => {
    const href = buildSeoCtaNavigationHref({
      locale: "zh",
      sourceRouteFamily: "article_detail",
      sourceSlug: "holland-career-interest-test-can-and-cannot-tell-you",
      contentId: 88,
      sourcePath: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
      href: "/zh/tests/holland-career-interest-test-riasec",
      ctaId: "riasec_article_primary",
      targetTestSlug: "holland-career-interest-test-riasec",
      attributionParams: {
        utm_source: "codex_qa",
        utm_medium: "controlled_pilot",
        utm_campaign: "seo_pilot_acceptance",
        utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
        gclid: "safe-click-id",
      },
    });

    expect(href).toContain("/zh/tests/holland-career-interest-test-riasec?");
    expect(href).toContain("utm_source=codex_qa");
    expect(href).toContain("utm_medium=controlled_pilot");
    expect(href).toContain("utm_campaign=seo_pilot_acceptance");
    expect(href).toContain("utm_content=holland-career-interest-test-can-and-cannot-tell-you");
    expect(href).toContain("gclid=safe-click-id");
    expect(href).toContain("source_route_family=article");
    expect(href).toContain("source_page_type=article_detail");
    expect(href).toContain("source_slug=holland-career-interest-test-can-and-cannot-tell-you");
    expect(href).toContain("cta_id=riasec_article_primary");
    expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(href).toContain("test_slug=holland-career-interest-test-riasec");
    expect(href).toContain("landing_path=%2Fzh%2Farticles%2Fholland-career-interest-test-can-and-cannot-tell-you");
    expect(href).not.toContain("email=");
    expect(href).not.toContain("ignored=");
  });

  it("can build article CTA hrefs from stored attribution when router search params are empty", () => {
    const href = buildSeoCtaNavigationHref({
      locale: "zh",
      sourceRouteFamily: "article_detail",
      sourceSlug: "holland-career-interest-test-can-and-cannot-tell-you",
      contentId: 88,
      sourcePath: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
      href: "/zh/tests/holland-career-interest-test-riasec",
      ctaId: "riasec_article_primary",
      targetTestSlug: "holland-career-interest-test-riasec",
      attributionParams: {
        utm_source: "codex_qa",
        utm_medium: "controlled_pilot",
        utm_campaign: "postdeploy_verify",
        utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      },
    });

    expect(href).toContain("utm_source=codex_qa");
    expect(href).toContain("utm_medium=controlled_pilot");
    expect(href).toContain("utm_campaign=postdeploy_verify");
    expect(href).toContain("utm_content=holland-career-interest-test-can-and-cannot-tell-you");
    expect(href).toContain("source_page_type=article_detail");
    expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
  });

  it("keeps test detail to take navigation from dropping article CTA context", () => {
    const inboundContext = extractSeoCtaContextParamsFromRecord({
      source_route_family: "article",
      source_page_type: "article_detail",
      source_slug: "holland-career-interest-test-can-and-cannot-tell-you",
      cta_id: "riasec_article_primary",
      target_test_slug: "holland-career-interest-test-riasec",
      landing_path: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa",
      email: "person@example.com",
    });
    const takeHref = appendSeoCtaContextParamsToHref(
      "/zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa",
      inboundContext
    );

    expect(takeHref).toContain("/zh/tests/holland-career-interest-test-riasec/take?");
    expect(takeHref).toContain("utm_source=codex_qa");
    expect(takeHref).toContain("source_route_family=article");
    expect(takeHref).toContain("source_slug=holland-career-interest-test-can-and-cannot-tell-you");
    expect(takeHref).toContain("cta_id=riasec_article_primary");
    expect(takeHref).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(takeHref).not.toContain("email=");
  });

  it("maps safe article CTA query context into RIASEC attempts/start metadata", () => {
    const searchParams = new URLSearchParams({
      utm_source: "codex_qa",
      utm_medium: "controlled_pilot",
      utm_campaign: "seo_pilot_acceptance",
      utm_term: "career_interest",
      utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      gclid: "safe-click-id",
      source_route_family: "article",
      source_page_type: "article_detail",
      source_slug: "holland-career-interest-test-can-and-cannot-tell-you",
      cta_id: "riasec_article_primary",
      target_action: "seo_cta_riasec_article_primary",
      target_test_slug: "holland-career-interest-test-riasec",
      landing_path: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa",
      email: "person@example.com",
      order_no: "ord_unsafe",
      arbitrary: "drop-me",
    });

    const result = buildSeoAttemptStartAttributionFromSearchParams({
      searchParams,
      currentPath: "/zh/tests/holland-career-interest-test-riasec/take?utm_source=codex_qa&email=person%40example.com",
      fallbackTestSlug: "holland-career-interest-test-riasec",
      fallbackSourcePageType: "tests_take_page",
      fallbackTargetAction: "start_riasec_test",
    });

    expect(result.attribution).toEqual({
      landing_path: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa",
      utm: {
        source: "codex_qa",
        medium: "controlled_pilot",
        campaign: "seo_pilot_acceptance",
        term: "career_interest",
        content: "holland-career-interest-test-can-and-cannot-tell-you",
      },
    });
    expect(result.meta).toMatchObject({
      source_route_family: "article",
      source_page_type: "article_detail",
      source_slug: "holland-career-interest-test-can-and-cannot-tell-you",
      cta_id: "riasec_article_primary",
      target_action: "seo_cta_riasec_article_primary",
      target_test_slug: "holland-career-interest-test-riasec",
      test_slug: "holland-career-interest-test-riasec",
      utm_source: "codex_qa",
      utm_campaign: "seo_pilot_acceptance",
      gclid: "safe-click-id",
    });
    expect(JSON.stringify(result)).not.toContain("person@example.com");
    expect(JSON.stringify(result)).not.toContain("person%40example.com");
    expect(JSON.stringify(result)).not.toContain("ord_unsafe");
    expect(JSON.stringify(result)).not.toContain("drop-me");
  });

  it("keeps stored UTM explicit in RIASEC attempts/start meta when take URL lacks query UTM", () => {
    const result = buildSeoAttemptStartAttributionFromSearchParams({
      searchParams: new URLSearchParams({
        source_page_type: "tests_take_page",
        target_action: "start_riasec_test",
        test_slug: "holland-career-interest-test-riasec",
      }),
      currentPath: "/zh/tests/holland-career-interest-test-riasec/take?form=riasec_60",
      storedAttribution: {
        utm_source: "codex_qa",
        utm_medium: "controlled_pilot",
        utm_campaign: "postdeploy_verify",
        utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
        landing_path:
          "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
      },
      fallbackTestSlug: "holland-career-interest-test-riasec",
      fallbackSourcePageType: "tests_take_page",
      fallbackTargetAction: "start_riasec_test",
    });

    expect(result.meta).toMatchObject({
      utm_source: "codex_qa",
      utm_medium: "controlled_pilot",
      utm_campaign: "postdeploy_verify",
      utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      source_page_type: "tests_take_page",
      target_action: "start_riasec_test",
      test_slug: "holland-career-interest-test-riasec",
    });
    expect(result.attribution).toEqual({
      landing_path:
        "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=postdeploy_verify&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
      utm: {
        source: "codex_qa",
        medium: "controlled_pilot",
        campaign: "postdeploy_verify",
        term: null,
        content: "holland-career-interest-test-can-and-cannot-tell-you",
      },
    });
  });

  it("wires article CTA, test detail, and RIASEC take through shared attribution helpers", () => {
    const seoCtaLink = readFileSync("components/cta/SeoTrackedCtaLink.tsx", "utf8");
    const articlePage = readFileSync("app/(localized)/[locale]/articles/[slug]/page.tsx", "utf8");
    const testDetailPage = readFileSync("app/(localized)/[locale]/tests/[slug]/page.tsx", "utf8");
    const riasecTake = readFileSync("app/(localized)/[locale]/tests/[slug]/take/RiasecTakeClient.tsx", "utf8");

    expect(articlePage).toContain("SeoTrackedCtaLink");
    expect(seoCtaLink).toContain("buildSeoCtaNavigationHref");
    expect(seoCtaLink).toContain("extractAttributionParamsFromSearchParams");
    expect(seoCtaLink).toContain("readStoredTrackingAttributionPayload");
    expect(seoCtaLink).toContain("extractAttributionParamsFromRecord");
    expect(testDetailPage).toContain("extractSeoCtaContextParamsFromRecord");
    expect(testDetailPage).toContain("appendSeoCtaContextParamsToHref");
    expect(riasecTake).toContain("buildSeoAttemptStartAttributionFromSearchParams");
    expect(riasecTake).toContain("...attributionContext.meta");
    expect(riasecTake).toContain("...attributionContext.attribution");
  });
});
