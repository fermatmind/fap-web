import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SeoTrackedCtaLink } from "@/components/cta/SeoTrackedCtaLink";
import { appendAttributionParamsToHref, extractAttributionParamsFromSearchParams } from "@/lib/tracking/attribution";
import {
  appendSeoCtaContextParamsToHref,
  buildSeoCtaNavigationHref,
  extractSeoCtaContextParamsFromSearchParams,
} from "@/lib/tracking/seoCtaAttribution";

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
    window.localStorage.clear();
    hoisted.search = "";
    hoisted.pathname = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
    window.history.pushState({}, "", hoisted.pathname);
  });

  it("hydrates article CTA href from the browser URL when App Router search params and stored attribution are empty", async () => {
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

    await waitFor(() => {
      expect(link.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    const href = link.getAttribute("href") ?? "";
    expect(href).toContain("utm_medium=controlled_pilot");
    expect(href).toContain("utm_campaign=seo_pilot_acceptance_r2");
    expect(href).toContain("utm_content=holland-career-interest-test-can-and-cannot-tell-you");
    expect(href).toContain("source_page_type=article_detail");
    expect(href).toContain("source_route_family=article");
    expect(href).toContain("cta_id=riasec_article_primary");
    expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(href).not.toContain("email=");
    expect(href).not.toContain("debug=");
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
