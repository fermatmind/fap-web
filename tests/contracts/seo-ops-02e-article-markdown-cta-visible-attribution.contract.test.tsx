import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
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

function expectSafeVisibleHref(href: string) {
  expect(href).toContain(`${testDetailPath}?`);
  expect(href).toContain("utm_source=codex_qa");
  expect(href).toContain("utm_medium=controlled_pilot");
  expect(href).toContain("utm_campaign=seo_pilot_acceptance_r2");
  expect(href).toContain(`utm_content=${sourceSlug}`);
  expect(href).toContain("source_page_type=article_detail");
  expect(href).toContain("source_route_family=article");
  expect(href).toContain(`source_slug=${sourceSlug}`);
  expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
  expect(href).toContain("entrypoint=seo_cta");
  expect(href).not.toContain("email=");
  expect(href).not.toContain("debug=");
  expect(href).not.toContain("order_no=");
}

describe("SEO-OPS-02E article Markdown CTA visible attribution contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    pushArticleUrl();
  });

  it("attributes CMS Markdown test CTA hrefs rendered by renderSimpleMarkdown", async () => {
    render(
      <AttributedCmsLinkHydrator
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      >
        {renderSimpleMarkdown(`[FermatMind 霍兰德职业兴趣测试 →](${testDetailPath})`)}
      </AttributedCmsLinkHydrator>
    );

    const cta = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试 →" });

    await waitFor(() => {
      expect(cta.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    expectSafeVisibleHref(cta.getAttribute("href") ?? "");
    expect(cta.getAttribute("data-seo-cta-attributed")).toBe("true");
    expect(cta.getAttribute("data-seo-original-href")).toBe(testDetailPath);
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
