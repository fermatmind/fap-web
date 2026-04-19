import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import {
  CANONICAL_MEDIA_ASSET_ORIGIN,
  cmsManagedMediaUrl,
  isLegacyMutableMediaUrl,
} from "@/lib/cms/media";

describe("media asset contract", () => {
  it("documents the canonical mutable media asset origin", () => {
    expect(CANONICAL_MEDIA_ASSET_ORIGIN).toBe("https://assets.fermatmind.com");
  });

  it("rejects legacy Tencent/COS mutable media URLs at the CMS media boundary", () => {
    expect(isLegacyMutableMediaUrl("https://fermatmind-1316873116.cos.ap-shanghai.myqcloud.com/image.jpg")).toBe(true);
    expect(isLegacyMutableMediaUrl("https://assets.fermatmind.com/article/image.jpg")).toBe(false);
    expect(cmsManagedMediaUrl("https://fermatmind-1316873116.cos.ap-shanghai.myqcloud.com/image.jpg")).toBeNull();
    expect(cmsManagedMediaUrl("https://assets.fermatmind.com/article/image.jpg")).toBe(
      "https://assets.fermatmind.com/article/image.jpg"
    );
  });

  it("does not render legacy mutable article image URLs", () => {
    render(
      <ArticleResponsiveImage
        src="https://fermatmind-1316873116.cos.ap-shanghai.myqcloud.com/article.jpg"
        alt="Article cover"
        variants={{
          hero: null,
          card: {
            url: "https://fermatmind-1316873116.cos.ap-shanghai.myqcloud.com/card.jpg",
            width: 800,
            height: 450,
            mimeType: null,
            media: null,
          },
          thumbnail: null,
          square: null,
          og: null,
          preload: null,
        }}
      />
    );

    const fallback = screen.getByRole("img", { name: "Article cover" });
    expect(fallback.tagName.toLowerCase()).toBe("div");
    expect(screen.queryByAltText("Article cover")).not.toBeInTheDocument();
  });
});
