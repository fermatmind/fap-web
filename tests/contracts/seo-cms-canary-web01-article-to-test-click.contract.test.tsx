import { fireEvent, render, screen } from "@testing-library/react";
import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";
import {
  buildSeoCtaTrackingPayload,
  deriveSeoCtaPriorityFromKey,
  extractPublicTestDetailPathFromHref,
} from "@/lib/tracking/seoCtaAttribution";
import { mapTrackingEventToGa4Name } from "@/lib/tracking/client";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";
import { trackEvent } from "@/lib/analytics";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/articles/mbti-vs-holland-career-choice",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/lib/analytics", () => ({
  trackEvent: vi.fn(),
}));

const articleSlug = "mbti-vs-holland-career-choice";
const translationGroupId = "tg-mbti-vs-holland-career";

function buildArticlePayload(locale: "en" | "zh", href: string, ctaId: string, index: number) {
  const sourcePath = `/${locale}/articles/${locale === "zh" ? articleSlug : "mbti-vs-holland-code-career-choice"}`;
  return buildSeoCtaTrackingPayload({
    locale,
    sourceRouteFamily: "article_detail",
    sourceSlug: sourcePath.split("/").at(-1) ?? articleSlug,
    sourcePath,
    href,
    ctaId,
    ctaPriority: deriveSeoCtaPriorityFromKey(ctaId, index),
    translationGroupId,
    targetTestSlug: href.split("/").at(-1) ?? null,
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("SEO-CMS-CANARY-WEB-01 article-to-test click contract", () => {
  it("emits article_to_test_click once for structured article CTA clicks", () => {
    render(
      <SeoTrackedCtaLink
        href="/zh/tests/holland-career-interest-test-riasec"
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={articleSlug}
        sourcePath="/zh/articles/mbti-vs-holland-career-choice"
        contentId={88}
        translationGroupId={translationGroupId}
        ctaId="primary_riasec"
        ctaPriority="primary"
        targetTestSlug="holland-career-interest-test-riasec"
        onClick={(event) => event.preventDefault()}
      >
        Start RIASEC
      </SeoTrackedCtaLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "Start RIASEC" }));

    expect(trackEvent).toHaveBeenCalledTimes(1);
    expect(trackEvent).toHaveBeenCalledWith(
      TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK,
      expect.objectContaining({
        locale: "zh",
        article_slug: articleSlug,
        translation_group_id: translationGroupId,
        cta_id: "primary_riasec",
        cta_priority: "primary",
        target_test_slug: "holland-career-interest-test-riasec",
        source_path: "/zh/articles/mbti-vs-holland-career-choice",
        destination_path: "/zh/tests/holland-career-interest-test-riasec",
      })
    );
    expect(trackEvent).not.toHaveBeenCalledWith("start_attempt", expect.anything());
  });

  it("distinguishes zh/en RIASEC primary, MBTI secondary, and Big Five tertiary CTA targets", () => {
    const cases = [
      ["zh", "/zh/tests/holland-career-interest-test-riasec", "primary_riasec", "primary"],
      ["zh", "/zh/tests/mbti-personality-test-16-personality-types", "secondary_mbti", "secondary"],
      ["zh", "/zh/tests/big-five-personality-test-ocean-model", "tertiary_big_five", "tertiary"],
      ["en", "/en/tests/holland-career-interest-test-riasec", "primary_riasec", "primary"],
      ["en", "/en/tests/mbti-personality-test-16-personality-types", "secondary_mbti", "secondary"],
      ["en", "/en/tests/big-five-personality-test-ocean-model", "tertiary_big_five", "tertiary"],
    ] as const;

    for (const [locale, href, ctaId, priority] of cases) {
      const payload = buildArticlePayload(locale, href, ctaId, cases.findIndex((item) => item[2] === ctaId));
      expect(payload).toMatchObject({
        locale,
        translation_group_id: translationGroupId,
        cta_id: ctaId,
        cta_priority: priority,
        target_test_slug: href.split("/").at(-1),
        destination_path: href,
      });
    }
  });

  it("rejects private, external, unsafe, and tokenized article CTA destinations", () => {
    const forbidden = [
      "/zh/tests/holland-career-interest-test-riasec/take",
      "/zh/tests/holland-career-interest-test-riasec/result",
      "/zh/tests/holland-career-interest-test-riasec/orders",
      "/zh/tests/holland-career-interest-test-riasec/share",
      "/zh/tests/holland-career-interest-test-riasec/pay",
      "/zh/tests/holland-career-interest-test-riasec/payment",
      "/zh/tests/holland-career-interest-test-riasec/history",
      "/zh/tests/holland-career-interest-test-riasec?token=secret",
      "https://evil.example/zh/tests/holland-career-interest-test-riasec",
      "javascript:alert(1)",
    ];

    for (const href of forbidden) {
      expect(extractPublicTestDetailPathFromHref(href, "zh")).toBeNull();
      const payload = buildArticlePayload("zh", href, "primary_riasec", 0);
      expect(payload.destination_path).toBeUndefined();
    }
  });

  it("maps article_to_test_click to its own GA4 event name and filters sensitive fields", () => {
    expect(mapTrackingEventToGa4Name(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK)).toBe("article_to_test_click");

    const filtered = filterTrackingPayload(TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK, {
      ...buildArticlePayload("zh", "/zh/tests/holland-career-interest-test-riasec", "primary_riasec", 0),
      email: "person@example.com",
      token: "secret",
      checkout_url: "https://pay.example/secret",
      unexpected: "drop-me",
    });

    expect(filtered).toMatchObject({
      locale: "zh",
      article_slug: articleSlug,
      translation_group_id: translationGroupId,
      cta_id: "primary_riasec",
      cta_priority: "primary",
      target_test_slug: "holland-career-interest-test-riasec",
      source_path: "/zh/articles/mbti-vs-holland-career-choice",
      destination_path: "/zh/tests/holland-career-interest-test-riasec",
    });
    expect(JSON.stringify(filtered)).not.toContain("person@example.com");
    expect(JSON.stringify(filtered)).not.toContain("secret");
    expect(JSON.stringify(filtered)).not.toContain("drop-me");
  });

  it("lets /api/track accept and filter article_to_test_click without forwarding when no targets are configured", async () => {
    const previousTargets = {
      MBTI_ATTRIBUTION_INGEST_ENDPOINT: process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT,
      ANALYTICS_ENDPOINT: process.env.ANALYTICS_ENDPOINT,
      EDM_ENDPOINT: process.env.EDM_ENDPOINT,
    };
    delete process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT;
    delete process.env.ANALYTICS_ENDPOINT;
    delete process.env.EDM_ENDPOINT;

    try {
      const response = await postTrackingEvent(new NextRequest("https://fermatmind.com/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          eventName: TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK,
          anonymousId: "anon-article-click",
          path: "/zh/articles/mbti-vs-holland-career-choice",
          payload: {
            ...buildArticlePayload("zh", "/zh/tests/holland-career-interest-test-riasec", "primary_riasec", 0),
            email: "person@example.com",
            token: "secret",
          },
        }),
      }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({ ok: true, forwarded: 0 });
    } finally {
      process.env.MBTI_ATTRIBUTION_INGEST_ENDPOINT = previousTargets.MBTI_ATTRIBUTION_INGEST_ENDPOINT;
      process.env.ANALYTICS_ENDPOINT = previousTargets.ANALYTICS_ENDPOINT;
      process.env.EDM_ENDPOINT = previousTargets.EDM_ENDPOINT;
    }
  });
});
