import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
    summary: "Backend supplied summary.",
    seo: {
      title: "大五人格",
      description: "Backend supplied SEO description.",
    },
    robots: "noindex,follow",
    canonicalPath: "/zh/personality/big-five",
    hreflang: {
      en: "/en/personality/big-five",
      "zh-CN": "/zh/personality/big-five",
    },
    faq: [],
    schemaType: null,
    schemaRuntimeEligible: false,
    methodBoundary: null,
    evidenceNotes: [],
    internalLinks: [],
    sections: [],
    isPublic: true,
    indexEligible: false,
    sitemapEligible: false,
    llmsEligible: false,
    launchState: "content_ready",
    publicReview: { reviewState: "unknown", lastReviewedAt: null, reviewer: null },
    reviewState: "content_reviewed",
    lastReviewedAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("Big Five public content render guard", () => {
  it("does not render empty title-only sections from backend assets", () => {
    render(
      <PublicContentAssetRenderer
        locale="zh"
        asset={asset({
          sections: [
            {
              key: "quick_answer",
              title: "快速回答",
              bodyMd: "",
              bodyHtml: "",
            },
            {
              key: "how_to_read",
              title: "怎么阅读大五",
              bodyMd: "这段正文来自 CMS public API。",
              bodyHtml: "",
            },
          ],
        })}
      />
    );

    expect(screen.queryByRole("heading", { name: "快速回答" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "怎么阅读大五" })).toBeInTheDocument();
    expect(screen.getByText("这段正文来自 CMS public API。")).toBeInTheDocument();
    expect(screen.getAllByTestId("public-content-section")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /阅读全文/ })).toHaveAttribute("href", "#how_to_read");
  });

  it("does not show the read-through anchor when every section is title-only", () => {
    render(
      <PublicContentAssetRenderer
        locale="zh"
        asset={asset({
          sections: [
            {
              key: "quick_answer",
              title: "快速回答",
              bodyMd: "",
              bodyHtml: "",
            },
          ],
        })}
      />
    );

    expect(screen.queryByTestId("public-content-section")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /阅读全文/ })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "大五人格" })).toBeInTheDocument();
  });
});
