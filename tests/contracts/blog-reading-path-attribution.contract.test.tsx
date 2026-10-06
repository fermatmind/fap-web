/* eslint-disable @next/next/no-html-link-for-pages -- These fixtures exercise native CMS anchors, not Next Link. */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttributedCmsLinkHydrator } from "@/components/content/AttributedCmsLinkHydrator";
import { extractPublicReadingPathFromHref, buildSeoAttemptStartAttributionFromSearchParams, appendSeoCtaContextParamsToHref,
  extractSeoCtaContextParamsFromSearchParams } from "@/lib/tracking/seoCtaAttribution";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n/locales";

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("Blog public reading and assessment source paths", () => {
  beforeEach(() => { window.localStorage.clear(); });

  it.each(["en", "zh"] as Locale[])("carries %s article identity to chosen career/topic/test, including delayed curated edges", async (locale) => {
    window.history.replaceState({}, "", `/${locale}/articles/source?utm_source=controlled_qa&email=private%40example.com`);
    const wrapper = (links: boolean) => <AttributedCmsLinkHydrator locale={locale} sourceRouteFamily="article_detail" sourceSlug="source"
      sourcePath={`/${locale}/articles/source`} contentId={40}>
      {links ? <><a href={`/${locale}/career/guides/choose-career`}>Career</a><a href={`/${locale}/topics/learning`}>Topic</a>
        <a href={`/${locale}/tests/holland-career-interest-test-riasec`}>Assessment</a></> : null}
    </AttributedCmsLinkHydrator>;
    const view = render(wrapper(false));
    view.rerender(wrapper(true));
    for (const name of ["Career", "Topic", "Assessment"]) {
      const link = screen.getByRole("link", { name });
      await waitFor(() => expect(link.getAttribute("href")).toContain("source_slug=source"));
      const url = new URL(link.getAttribute("href")!, "https://fermatmind.com");
      expect(url.pathname.startsWith(`/${locale}/`)).toBe(true);
      expect(url.searchParams.get("content_id")).toBe("40");
      expect(url.searchParams.get("landing_path")).toBe(`/${locale}/articles/source?utm_source=controlled_qa`);
      expect(url.searchParams.get("utm_source")).toBe("controlled_qa");
      expect(url.searchParams.has("email")).toBe(false);
      if (name !== "Assessment") expect(url.searchParams.has("test_slug")).toBe(false);
    }
    const assessment = screen.getByRole("link", { name: "Assessment" });
    assessment.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(assessment);
    expect(trackEvent).toHaveBeenCalledWith("article_to_test_click", expect.objectContaining({ locale, article_slug: "source", target_test_slug: "holland-career-interest-test-riasec" }));
    const href = assessment.getAttribute("href")!;
    const query = new URL(href, "https://fermatmind.com").searchParams;
    const take = appendSeoCtaContextParamsToHref(`/${locale}/tests/holland-career-interest-test-riasec/take?form=riasec_60`, extractSeoCtaContextParamsFromSearchParams(query));
    const attempt = buildSeoAttemptStartAttributionFromSearchParams({ searchParams: new URL(take, "https://fermatmind.com").searchParams });
    expect(attempt.meta).toMatchObject({ content_id: "40", source_slug: "source", source_route_family: "article", source_page_type: "article_detail" });
    expect(attempt.meta.landing_path).toContain(`/${locale}/articles/source`);
    // Rehydrating/returning does not duplicate context keys or replace original destinations.
    view.unmount();
    render(wrapper(true));
    await waitFor(() => expect(screen.getByRole("link", { name: "Assessment" }).getAttribute("href")).toBe(href));
    expect(query.getAll("source_slug")).toHaveLength(1);
  });

  it.each(["https://evil.example/en/topics/learning", "/zh/topics/learning", "/en/topics/learning?email=x", "/en/result/private",
    "/en/career/resolve", "/en/career/recommendations", "/en/career/jobs/x/result", "https://user:password@fermatmind.com/en/topics/learning", "/en/topics/%2e%2e"])("excludes unsafe/private/unapproved cross-language reading destination %s", (href) => {
    expect(extractPublicReadingPathFromHref(href, "en")).toBeNull();
  });

  it("preserves anchors/private result/external links and does not emit assessment clicks for reading", async () => {
    window.history.replaceState({}, "", "/en/articles/source");
    render(<AttributedCmsLinkHydrator locale="en" sourceRouteFamily="article_detail" sourceSlug="source" sourcePath="/en/articles/source">
      <a href="#section">Anchor</a><a href="/en/result/private">Private</a><a href="/en/tests/test/take">Take</a>
      <a href="https://evil.example/en/topics/x">External</a><a href="/en/topics/learning">Topic</a>
    </AttributedCmsLinkHydrator>);
    for (const name of ["Anchor", "Private", "Take", "External"]) expect(screen.getByRole("link", { name })).not.toHaveAttribute("data-seo-cta-attributed");
    const topic = screen.getByRole("link", { name: "Topic" });
    topic.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(topic);
    expect(trackEvent).not.toHaveBeenCalled();
  });
});
