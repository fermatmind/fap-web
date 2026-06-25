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

  it("preserves backend answer-surface labels for MBTI article test CTAs", async () => {
    const surface: AnswerSurfaceViewModel = {
      version: "answer.surface.v1",
      answerContractVersion: "answer.surface.v1",
      answerFingerprint: "seo-ops-02d-answer-surface-mbti-label",
      answerScope: "public_indexable_detail",
      surfaceType: "article_public_detail",
      summaryBlocks: [],
      faqBlocks: [],
      compareBlocks: [],
      sceneSummaryBlocks: [],
      nextStepBlocks: [
        {
          key: "p0_ctr_primary_test_cta",
          title: "开始免费 MBTI 测试",
          body: "",
          href: "/zh/tests/mbti-personality-test-16-personality-types",
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
          contentId: 8,
        }}
      />
    );

    const cta = screen.getByRole("link", { name: "开始免费 MBTI 测试" });

    await waitFor(() => {
      expect(cta.getAttribute("href")).toContain("target_test_slug=mbti-personality-test-16-personality-types");
    });

    expect(screen.queryByRole("link", { name: "MBTI免费测试" })).not.toBeInTheDocument();
    expect(cta.getAttribute("href")).toContain("entrypoint=seo_cta");
    expect(cta.getAttribute("href")).not.toContain("email=");
    expect(cta.getAttribute("href")).not.toContain("debug=");
  });

  it("can hide the article answer-surface comparison label without dropping comparison cards", () => {
    const surface: AnswerSurfaceViewModel = {
      version: "answer.surface.v1",
      answerContractVersion: "answer.surface.v1",
      answerFingerprint: "seo-ops-02d-answer-surface-comparison",
      answerScope: "public_indexable_detail",
      surfaceType: "article_public_detail",
      summaryBlocks: [],
      faqBlocks: [],
      compareBlocks: [
        {
          key: "category",
          title: "内容分类",
          body: "职业决策",
          href: null,
          kind: "comparison",
        },
      ],
      sceneSummaryBlocks: [],
      nextStepBlocks: [],
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

    render(<AnswerSurfaceSection surface={surface} locale="zh" pageFamily="article_detail" hideCompareLabel />);

    expect(screen.queryByText("对比线索")).not.toBeInTheDocument();
    expect(screen.getByText("内容分类")).toBeInTheDocument();
    expect(screen.getByText("职业决策")).toBeInTheDocument();
  });

  it("can render article answer-surface summary without the generic heading or empty second column", () => {
    const surface: AnswerSurfaceViewModel = {
      version: "answer.surface.v1",
      answerContractVersion: "answer.surface.v1",
      answerFingerprint: "seo-ops-02d-answer-surface-summary",
      answerScope: "public_indexable_detail",
      surfaceType: "article_public_detail",
      summaryBlocks: [
        {
          key: "quick_answer",
          title: "高考志愿选专业：霍兰德、MBTI和职业兴趣测试怎么用",
          body: "高考志愿填报前，先把测评结果放回现实验证。",
          href: null,
          kind: "summary",
        },
      ],
      faqBlocks: [],
      compareBlocks: [],
      sceneSummaryBlocks: [],
      nextStepBlocks: [],
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

    const { container } = render(
      <AnswerSurfaceSection surface={surface} locale="zh" pageFamily="article_detail" hideHeading expandSingleSummaryBlock />
    );

    expect(screen.queryByRole("heading", { name: "快速答案" })).not.toBeInTheDocument();
    expect(screen.getByText("高考志愿选专业：霍兰德、MBTI和职业兴趣测试怎么用")).toBeInTheDocument();
    expect(container.querySelector('[data-evidence-block="quick_answer"] .md\\:grid-cols-2')).not.toBeInTheDocument();
  });

  it("can hide article answer-surface summary blocks while preserving FAQ content", () => {
    const surface: AnswerSurfaceViewModel = {
      version: "answer.surface.v1",
      answerContractVersion: "answer.surface.v1",
      answerFingerprint: "seo-ops-02d-answer-surface-hidden-summary",
      answerScope: "public_indexable_detail",
      surfaceType: "article_public_detail",
      summaryBlocks: [
        {
          key: "quick_answer",
          title: "霍兰德职业兴趣测试是什么？RIASEC 六型如何帮助职业探索",
          body: "霍兰德职业兴趣测试基于 RIASEC 六型。",
          href: null,
          kind: "summary",
        },
      ],
      faqBlocks: [
        {
          key: "riasec_intro",
          question: "RIASEC 是职业测试吗？",
          answer: "RIASEC 是职业兴趣模型。",
        },
      ],
      compareBlocks: [],
      sceneSummaryBlocks: [],
      nextStepBlocks: [],
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

    render(<AnswerSurfaceSection surface={surface} locale="zh" pageFamily="article_detail" hideHeading hideSummaryBlocks />);

    expect(screen.queryByText("霍兰德职业兴趣测试是什么？RIASEC 六型如何帮助职业探索")).not.toBeInTheDocument();
    expect(screen.queryByText("霍兰德职业兴趣测试基于 RIASEC 六型。")).not.toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("RIASEC 是职业测试吗？")).toBeInTheDocument();
  });
});
