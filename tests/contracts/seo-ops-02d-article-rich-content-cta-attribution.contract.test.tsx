import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { AttributedSanitizedCmsHtml } from "@/components/content/AttributedSanitizedCmsHtml";
import type { AnswerSurfaceViewModel } from "@/lib/answer/answerSurface";

const hoisted = vi.hoisted(() => ({
  pathname: "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you",
  search: "",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

const sourcePath = "/zh/articles/holland-career-interest-test-can-and-cannot-tell-you";
const sourceSlug = "holland-career-interest-test-can-and-cannot-tell-you";

function pushArticleUrl() {
  window.history.pushState(
    {},
    "",
    `${sourcePath}?utm_source=codex_qa&utm_medium=controlled_pilot&utm_campaign=seo_pilot_acceptance_r2_full&utm_content=${sourceSlug}&email=person%40example.com&debug=unsafe`
  );
}

function expectSafeArticleAttributionHref(href: string) {
  expect(href).toContain("/zh/tests/holland-career-interest-test-riasec?");
  expect(href).toContain("utm_source=codex_qa");
  expect(href).toContain("utm_medium=controlled_pilot");
  expect(href).toContain("utm_campaign=seo_pilot_acceptance_r2_full");
  expect(href).toContain(`utm_content=${sourceSlug}`);
  expect(href).toContain("source_page_type=article_detail");
  expect(href).toContain("source_route_family=article");
  expect(href).toContain(`source_slug=${sourceSlug}`);
  expect(href).toContain("target_test_slug=holland-career-interest-test-riasec");
  expect(href).toContain("entrypoint=seo_cta");
  expect(href).not.toContain("email=");
  expect(href).not.toContain("debug=");
}

describe("SEO-OPS-02D article CMS rich-content CTA attribution contract", () => {
  beforeEach(() => {
    window.localStorage.clear();
    hoisted.pathname = sourcePath;
    hoisted.search = "";
    pushArticleUrl();
  });

  it("attributes CMS HTML test CTA hrefs that bypass React CTA wrappers", async () => {
    render(
      <AttributedSanitizedCmsHtml
        html='<p><a href="/zh/tests/holland-career-interest-test-riasec">FermatMind 霍兰德职业兴趣测试 →</a></p>'
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      />
    );

    const cta = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试 →" });

    await waitFor(() => {
      expect(cta.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    expectSafeArticleAttributionHref(cta.getAttribute("href") ?? "");
    expect(cta.getAttribute("data-seo-cta-attributed")).toBe("true");
  });

  it("keeps non-test CMS links unmodified", async () => {
    render(
      <AttributedSanitizedCmsHtml
        html='<p><a href="/zh/articles">查看文章</a></p>'
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      />
    );

    const link = screen.getByRole("link", { name: "查看文章" });

    await waitFor(() => {
      expect(link.getAttribute("href")).toBe("/zh/articles");
    });
  });

  it("does not let CMS data attributes restore unsafe original hrefs", async () => {
    render(
      <AttributedSanitizedCmsHtml
        html='<p><a href="/zh/tests/holland-career-interest-test-riasec" data-seo-original-href="javascript:alert(document.domain)//zh/tests/holland-career-interest-test-riasec">FermatMind 霍兰德职业兴趣测试 →</a></p>'
        locale="zh"
        sourceRouteFamily="article_detail"
        sourceSlug={sourceSlug}
        sourcePath={sourcePath}
        contentId={88}
      />
    );

    const cta = screen.getByRole("link", { name: "FermatMind 霍兰德职业兴趣测试 →" });

    await waitFor(() => {
      expect(cta.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    expectSafeArticleAttributionHref(cta.getAttribute("href") ?? "");
    expect(cta.getAttribute("href")).not.toContain("javascript:");
    expect(cta.getAttribute("data-seo-original-href")).toBe("/zh/tests/holland-career-interest-test-riasec");
  });

  it("attributes article answer-surface test CTAs through SeoTrackedCtaLink", async () => {
    const surface: AnswerSurfaceViewModel = {
      version: "answer.surface.v1",
      answerContractVersion: "answer.surface.v1",
      answerFingerprint: "seo-ops-02d-answer-surface",
      answerScope: "public_indexable_detail",
      surfaceType: "article_public_detail",
      summaryBlocks: [],
      faqBlocks: [],
      compareBlocks: [],
      sceneSummaryBlocks: [],
      nextStepBlocks: [
        {
          key: "riasec_article_primary",
          title: "霍兰德职业兴趣测试 →",
          body: "从测试入口继续。",
          href: "/zh/tests/holland-career-interest-test-riasec",
          kind: "start_test",
        },
      ],
      answerBundle: [],
      evidenceRefs: [],
      publicSafetyState: null,
      indexabilityState: "indexable",
      attributionScope: "article_detail",
      seoSurfaceRef: null,
      landingSurfaceRef: null,
      publicSurfaceRef: null,
      primaryContentRef: `article:${sourceSlug}`,
      relatedSurfaceKeys: [],
      runtimeArtifactRef: null,
    };

    render(
      <AnswerSurfaceSection
        surface={surface}
        locale="zh"
        pageFamily="article_detail"
        seoCtaAttribution={{
          locale: "zh",
          sourceRouteFamily: "article_detail",
          sourceSlug,
          sourcePath,
          contentId: 88,
        }}
      />
    );

    const cta = screen.getByRole("link", { name: "霍兰德职业兴趣测试 →" });

    await waitFor(() => {
      expect(cta.getAttribute("href")).toContain("utm_source=codex_qa");
    });

    expectSafeArticleAttributionHref(cta.getAttribute("href") ?? "");
  });
});
