import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { PublicContentAssetRenderer } from "@/components/personality/PublicContentAssetRenderer";
import type { PersonalityPublicContentAsset } from "@/lib/cms/personality-public-content-assets";

function asset(overrides: Partial<PersonalityPublicContentAsset> = {}): PersonalityPublicContentAsset {
  return {
    framework: "big_five",
    entityType: "hub",
    code: "big-five",
    slug: "big-five",
    locale: "zh-CN",
    title: "大五人格",
    summary: "Backend summary.",
    seo: { title: "大五人格", description: "SEO description." },
    robots: "index,follow",
    canonicalPath: "/zh/personality/big-five",
    hreflang: { en: "/en/personality/big-five", "zh-CN": "/zh/personality/big-five" },
    faq: [],
    schemaType: null,
    schemaRuntimeEligible: false,
    methodBoundary: null,
    evidenceNotes: [],
    internalLinks: [],
    sections: [],
    isPublic: true,
    indexEligible: true,
    sitemapEligible: true,
    llmsEligible: true,
    launchState: "published",
    publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
    reviewState: "seo_discoverability_released",
    lastReviewedAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("Big Five hub CMS Markdown link rendering", () => {
  it("renders [text](url) Markdown link as clickable <a> in paragraph", () => {
    render(
      <div>
        {renderSimpleMarkdown(
          "你也可以先完成[大五人格测试](/zh/tests/big-five-personality-test-ocean-model)，再回到这个页面对照阅读。"
        )}
      </div>
    );

    const link = screen.getByRole("link", { name: "大五人格测试" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/zh/tests/big-five-personality-test-ocean-model");
  });

  it("renders Markdown link in unordered list item", () => {
    render(
      <div>
        {renderSimpleMarkdown(
          "继续浏览：\n\n- [大五人格测试](/zh/tests/big-five-personality-test-ocean-model)\n- [开放性](/zh/personality/big-five/openness)"
        )}
      </div>
    );

    expect(screen.getByRole("link", { name: "大五人格测试" })).toHaveAttribute(
      "href",
      "/zh/tests/big-five-personality-test-ocean-model"
    );
    expect(screen.getByRole("link", { name: "开放性" })).toHaveAttribute(
      "href",
      "/zh/personality/big-five/openness"
    );
  });

  it("renders dimension_self_check section bodyMd with CTA link via PublicContentAssetRenderer", () => {
    render(
      <PublicContentAssetRenderer
        locale="zh"
        asset={asset({
          sections: [
            {
              key: "dimension_self_check",
              title: "自查：我应该先看哪个维度",
              bodyMd:
                "你也可以先完成[大五人格测试](/zh/tests/big-five-personality-test-ocean-model)，再回到这个页面对照阅读。",
              bodyHtml: "",
            },
          ],
        })}
      />
    );

    expect(screen.getByRole("link", { name: "大五人格测试" })).toHaveAttribute(
      "href",
      "/zh/tests/big-five-personality-test-ocean-model"
    );
  });

  it("renders cta_related_links section bodyMd with CTA button and link list", () => {
    render(
      <PublicContentAssetRenderer
        locale="zh"
        asset={asset({
          sections: [
            {
              key: "cta_related_links",
              title: "CTA + 继续浏览",
              bodyMd:
                "准备好更系统地理解自己的五维倾向了吗？你可以先完成[大五人格测试](/zh/tests/big-five-personality-test-ocean-model)，再回到本页和五个维度页对照阅读。\n\n主 CTA：  \n[开始大五人格免费测试](/zh/tests/big-five-personality-test-ocean-model)\n\n继续浏览：\n- [大五人格测试](/zh/tests/big-five-personality-test-ocean-model)\n- [30 个细分面向](/zh/personality/big-five/facets)",
              bodyHtml: "",
            },
          ],
        })}
      />
    );

    // Multiple "大五人格测试" links exist (paragraph + list item). Both should point to the test page.
    const testLinks = screen.getAllByRole("link", { name: "大五人格测试" });
    expect(testLinks.length).toBeGreaterThanOrEqual(2);
    testLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/zh/tests/big-five-personality-test-ocean-model");
    });

    // Main CTA link — appears in both hero button and bodyMd "主 CTA" paragraph
    const mainCtaLinks = screen.getAllByRole("link", { name: "开始大五人格免费测试" });
    expect(mainCtaLinks.length).toBeGreaterThanOrEqual(2);
    mainCtaLinks.forEach((link) => {
      expect(link).toHaveAttribute("href", "/zh/tests/big-five-personality-test-ocean-model");
    });
  });

  it("rejects javascript: scheme link — renders as plain text", () => {
    render(
      <div>
        {renderSimpleMarkdown("[坏链接](javascript:alert(1))")}
      </div>
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders safe public route links correctly, does not render data: scheme links", () => {
    // Safe public route — should render as link
    render(
      <div>
        {renderSimpleMarkdown("[大五人格测试](/zh/tests/big-five-personality-test-ocean-model)")}
      </div>
    );
    expect(screen.getByRole("link", { name: "大五人格测试" })).toHaveAttribute(
      "href",
      "/zh/tests/big-five-personality-test-ocean-model"
    );

    // data: scheme — should be rejected
    render(
      <div>
        {renderSimpleMarkdown("[坏链接](data:text/html,<script>alert(1)</script>)")}
      </div>
    );
    expect(screen.queryByRole("link", { name: "坏链接" })).not.toBeInTheDocument();
  });

  it("does not render placeholder or preview slot content", () => {
    render(
      <PublicContentAssetRenderer
        locale="zh"
        asset={asset({
          sections: [
            {
              key: "dimension_self_check",
              title: "自查",
              bodyMd: "你也可以先完成[大五人格测试](/zh/tests/big-five-personality-test-ocean-model)，再回到本页。",
              bodyHtml: "",
            },
          ],
        })}
      />
    );

    expect(screen.queryByText("CMS 内容待填充")).not.toBeInTheDocument();
    expect(screen.queryByText("Preview Slot Placeholder")).not.toBeInTheDocument();
    expect(screen.queryByText("预览模式")).not.toBeInTheDocument();
    expect(screen.queryByText("bodyMd missing")).not.toBeInTheDocument();
    expect(screen.queryByText("bodyHtml missing")).not.toBeInTheDocument();
  });

  it("omits the hero media area when the backend provides no approved image", () => {
    render(<PublicContentAssetRenderer locale="zh" asset={asset()} />);

    expect(screen.queryByTestId("public-content-hero-media")).not.toBeInTheDocument();
    expect(screen.queryByText("OCEAN")).not.toBeInTheDocument();
    expect(screen.queryByText("big-five")).not.toBeInTheDocument();
  });
});
