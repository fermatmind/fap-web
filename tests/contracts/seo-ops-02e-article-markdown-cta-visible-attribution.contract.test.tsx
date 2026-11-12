import { trackEvent } from "@/lib/analytics";
import { renderToStaticMarkup } from "react-dom/server";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AttributedCmsLinkHydrator } from "@/components/content/AttributedCmsLinkHydrator";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { appendAttributionParamsToHref, extractAttributionParamsFromSearchParams } from "@/lib/tracking/attribution";
import {
  appendSeoCtaContextParamsToHref,
  extractSeoCtaContextParamsFromSearchParams,
} from "@/lib/tracking/seoCtaAttribution";

const sourcePath = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
const sourceSlug = "holland-career-interest-test-can-and-cannot-tell-you";
const testDetailPath = "/zh/tests/holland-career-interest-test-riasec";

function pushArticleUrl() {
  window.history.pushState(
    {},
    "",
    `${sourcePath}?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=seo_pilot_acceptance_r2&utm_content=${sourceSlug}&email=person%40example.com&debug=unsafe`
  );
}

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

describe("SEO-OPS-02E article Markdown CTA visible attribution contract", () => {
  beforeEach(() => {
    vi.mocked(trackEvent).mockClear();
    window.localStorage.clear();
    pushArticleUrl();
  });

  it("keeps Markdown RIASEC links clean in SSR and tracks the click", () => {
    const body = renderSimpleMarkdown(`[FermatMind 霍兰德职业兴趣测试 →](${testDetailPath}?entry_surface=article_detail#riasec-scoring)`, { locale: "zh" });
    expect(renderToStaticMarkup(body)).toContain(`href="${testDetailPath}#riasec-scoring"`);
    render(
      <AttributedCmsLinkHydrator
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      >
        {body}
      </AttributedCmsLinkHydrator>
    );

    const cta = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试 →" });

    expect(cta.getAttribute("href")).toBe(`${testDetailPath}#riasec-scoring`);
    cta.addEventListener("click", event => event.preventDefault(), { once: true });
    fireEvent.click(cta);
    expect(trackEvent).toHaveBeenCalledExactlyOnceWith("article_to_test_click", expect.objectContaining({
      utm_source: "codex_qa",
      source_page_type: "article_detail",
      source_slug: sourceSlug,
      target_test_slug: "holland-career-interest-test-riasec",
    }));
    expect(vi.mocked(trackEvent).mock.calls[0]?.[1]).not.toHaveProperty("email");
  });

  it.each(["", "?form=mbti_93"])("preserves the example fragment after CMS attribution with existing query %s", async (query) => {
    const originalHref = `/en/tests/mbti-personality-test-16-personality-types${query}#result-examples`;
    render(
      <AttributedCmsLinkHydrator
        locale="en"
        sourceRouteFamily="article_detail"
        sourceSlug="free-personality-tests-results-compared"
        sourcePath="/en/articles/free-personality-tests-results-compared"
        contentId={283}
      >
        {renderSimpleMarkdown(`[two synthetic preference examples](${originalHref})`)}
      </AttributedCmsLinkHydrator>
    );
    const link = screen.getByRole("link", { name: "two synthetic preference examples" });
    await waitFor(() => expect(link.getAttribute("data-seo-cta-attributed")).toBe("true"));
    const url = new URL(link.getAttribute("href")!, "https://fermatmind.com");
    expect(url.hash).toBe("#result-examples");
    expect(url.searchParams.get("utm_source")).toBe("codex_qa");
    expect(url.searchParams.get("content_id")).toBe("283");
    expect(url.searchParams.get("source_slug")).toBe("free-personality-tests-results-compared");
    expect(url.searchParams.get("email")).toBeNull();
    if (query) expect(url.searchParams.get("form")).toBe("mbti_93");
    expect(link.getAttribute("data-seo-original-href")).toBe(originalHref);
  });

  it("keeps Markdown non-test links unmodified", async () => {
    render(
      <AttributedCmsLinkHydrator
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      >
        {renderSimpleMarkdown("[查看文章](/zh/articles)")}
      </AttributedCmsLinkHydrator>
    );

    const link = screen.getByRole("link", { name: "查看文章" });

    await waitFor(() => {
      expect(link.getAttribute("href")).toBe("/zh/articles");
    });

    expect(link.getAttribute("data-seo-cta-attributed")).toBeNull();
  });

  it("does not attribute external Markdown links that only look like test detail paths", async () => {
    const externalHref = "https://attacker.example/zh/tests/holland-career-interest-test-riasec";

    render(
      <AttributedCmsLinkHydrator
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      >
        {renderSimpleMarkdown(`[外部霍兰德职业兴趣测试](${externalHref})`)}
      </AttributedCmsLinkHydrator>
    );

    const link = screen.getByRole("link", { name: "外部霍兰德职业兴趣测试" });

    await waitFor(() => {
      expect(link.getAttribute("href")).toBe(externalHref);
    });

    expect(link.getAttribute("data-seo-cta-attributed")).toBeNull();
    expect(link.getAttribute("data-seo-original-href")).toBeNull();
    expect(link.getAttribute("href")).not.toContain("utm_source=");
    expect(link.getAttribute("href")).not.toContain("gclid=");
  });

  it("preserves article CTA attribution from test detail query into RIASEC take URL", () => {
    const attributedArticleHref = `${testDetailPath}?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=seo_pilot_acceptance_r2&utm_content=${sourceSlug}&source_page_type=article_detail&source_route_family=article&source_slug=${sourceSlug}&target_test_slug=holland-career-interest-test-riasec&cta_id=cms_content_holland-career-interest-test-riasec&entrypoint=seo_cta&email=person%40example.com`;
    const articleCtaUrl = new URL(attributedArticleHref, "https://fermatmind.com");
    const takeHref = appendSeoCtaContextParamsToHref(
      appendAttributionParamsToHref(
        `${testDetailPath}/take?form=riasec_60`,
        extractAttributionParamsFromSearchParams(articleCtaUrl.searchParams)
      ),
      extractSeoCtaContextParamsFromSearchParams(articleCtaUrl.searchParams)
    );

    expect(takeHref).toContain(`${testDetailPath}/take?`);
    expect(takeHref).toContain("form=riasec_60");
    expect(takeHref).toContain("utm_source=codex_qa");
    expect(takeHref).toContain("utm_medium=controlled_pilot");
    expect(takeHref).toContain("utm_campaign=seo_pilot_acceptance_r2");
    expect(takeHref).toContain(`utm_content=${sourceSlug}`);
    expect(takeHref).toContain("source_page_type=article_detail");
    expect(takeHref).toContain("source_route_family=article");
    expect(takeHref).toContain("target_test_slug=holland-career-interest-test-riasec");
    expect(takeHref).toContain("entrypoint=seo_cta");
    expect(takeHref).not.toContain("email=");
    expect(takeHref).not.toContain("order_no=");
  });
});
