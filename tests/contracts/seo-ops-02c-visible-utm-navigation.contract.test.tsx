import { trackEvent } from "@/lib/analytics";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";
import { appendAttributionParamsToHref, extractAttributionParamsFromSearchParams } from "@/lib/tracking/attribution";
import {
  appendSeoCtaContextParamsToHref,
  buildSeoCtaNavigationHref,
  extractSeoCtaContextParamsFromSearchParams,
} from "@/lib/tracking/seoCtaAttribution";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

describe("SEO-OPS-02C visible UTM navigation contract", () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
    window.localStorage.clear();
    hoisted.search = "";
    hoisted.pathname = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
    window.history.pushState({}, "", hoisted.pathname);
  });

  it("tracks article CTA attribution from the browser URL when App Router search params are empty", () => {
    window.history.pushState(
      {},
      "",
      "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=seo_pilot_acceptance_r2&utm_content=holland-career-interest-test-can-and-cannot-tell-you&email=person%40example.com&debug=unsafe"
    );

    render(
      <SeoTrackedCtaLink
        href="/zh/tests/holland-career-interest-test-riasec"
        sourceRouteFamily="article_detail"
        sourceSlug="holland-career-interest-test-can-and-cannot-tell-you"
        sourcePath="/zh/articles/holland-career-interest-test-can-and-cannot-tell-you"
        contentId={88}
        ctaId="riasec_article_primary"
        targetTestSlug="holland-career-interest-test-riasec"
        locale="zh"
      >
        FermatMind 霍兰德职业兴趣测试
      </SeoTrackedCtaLink>
    );

    const link = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试" });

    expect(link.getAttribute("href")).toBe("/zh/tests/holland-career-interest-test-riasec");
    link.addEventListener("click", event => event.preventDefault(), { once: true });
    fireEvent.click(link);
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith("article_to_test_click", expect.objectContaining({
      utm_source: "codex_qa",
      utm_medium: "controlled_pilot",
      utm_campaign: "seo_pilot_acceptance_r2",
      utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      source_page_type: "article_detail",
      target_test_slug: "holland-career-interest-test-riasec",
    }));
    expect(vi.mocked(trackEvent).mock.calls[0]?.[1]).not.toHaveProperty("email");
  });

  it("keeps safe UTM and CTA context explicit from article CTA through test detail into take URL", () => {
    const articleCtaHref = buildSeoCtaNavigationHref({
      locale: "zh",
      sourceRouteFamily: "article_detail",
      sourceSlug: "holland-career-interest-test-can-and-cannot-tell-you",
      contentId: 88,
      sourcePath: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=seo_pilot_acceptance_r2&utm_content=holland-career-interest-test-can-and-cannot-tell-you",
      href: "/zh/tests/holland-career-interest-test-riasec",
      ctaId: "riasec_article_primary",
      targetTestSlug: "holland-career-interest-test-riasec",
      attributionParams: {
        utm_source: "codex_qa",
        utm_medium: "controlled_pilot",
        utm_campaign: "seo_pilot_acceptance_r2",
        utm_content: "holland-career-interest-test-can-and-cannot-tell-you",
      },
    });
    const articleCtaUrl = new URL(articleCtaHref, "https://fermatmind.com");
    const takeHref = appendSeoCtaContextParamsToHref(
      appendAttributionParamsToHref(
        "/zh/tests/holland-career-interest-test-riasec/take?form=riasec_60",
        extractAttributionParamsFromSearchParams(articleCtaUrl.searchParams)
      ),
      extractSeoCtaContextParamsFromSearchParams(articleCtaUrl.searchParams)
    );

    expect(takeHref).toContain("/zh/tests/holland-career-interest-test-riasec/take?");
    expect(takeHref).toContain("form=riasec_60");
    expect(takeHref).toContain("utm_source=codex_qa");
    expect(takeHref).toContain("utm_medium=controlled_pilot");
    expect(takeHref).toContain("utm_campaign=seo_pilot_acceptance_r2");
    expect(takeHref).toContain("utm_content=holland-career-interest-test-can-and-cannot-tell-you");
    expect(takeHref).toContain("source_page_type=article_detail");
    expect(takeHref).toContain("source_route_family=article");
    expect(takeHref).toContain("cta_id=riasec_article_primary");
    expect(takeHref).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(takeHref).not.toContain("email=");
    expect(takeHref).not.toContain("order_no=");
  });
});
