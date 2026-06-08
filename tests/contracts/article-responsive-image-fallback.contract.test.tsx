import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";

function getShell(container: HTMLElement) {
  return container.querySelector("[data-cms-image-state]") as HTMLElement | null;
}

function getFallback(container: HTMLElement) {
  return container.querySelector('[data-cms-image-fallback="true"]');
}

function getRenderedBackground(container: HTMLElement) {
  return container.querySelector('[data-cms-image-rendered="background"]') as HTMLElement | null;
}

function expectNoNativeImage(container: HTMLElement) {
  expect(container.querySelector("picture")).toBeNull();
  expect(container.querySelector("img")).toBeNull();
}

describe("ArticleResponsiveImage", () => {
  it("renders CMS media placeholders as stable fallback art without native image markup", () => {
    const { container } = render(
      <ArticleResponsiveImage
        src="__CMS_MEDIA_LIBRARY_PLACEHOLDER__"
        alt="CMS placeholder article cover"
        className="h-40"
        variants={{
          hero: {
            url: "__CMS_MEDIA_LIBRARY_PLACEHOLDER__",
            media: null,
            mimeType: null,
            width: null,
            height: null,
          },
          card: null,
          thumbnail: null,
          square: null,
          og: null,
          preload: null,
        }}
      />
    );

    const shell = getShell(container);
    expect(shell).not.toBeNull();
    expect(shell?.getAttribute("aria-hidden")).toBe("true");
    expect(shell?.getAttribute("data-cms-image-state")).toBe("fallback");
    expect(getFallback(container)).not.toBeNull();
    expect(getRenderedBackground(container)).toBeNull();
    expectNoNativeImage(container);
  });

  it("uses a safe CMS media URL as a CSS background instead of rendering img or picture", () => {
    const { container } = render(
      <ArticleResponsiveImage
        src="https://api.fermatmind.com/static/articles/covers/valid-cover.jpg"
        alt="Valid CMS article cover"
        className="h-40"
      />
    );

    const shell = getShell(container);
    const renderedBackground = getRenderedBackground(container);

    expect(shell?.getAttribute("data-cms-image-state")).toBe("candidate");
    expect(getFallback(container)).toBeNull();
    expect(renderedBackground).not.toBeNull();
    expect(renderedBackground?.getAttribute("aria-hidden")).toBe("true");
    expect(renderedBackground?.getAttribute("style")).toContain("valid-cover.jpg");
    expectNoNativeImage(container);
  });

  it("prefers card variants over hero variants in article-card mode", () => {
    const { container } = render(
      <ArticleResponsiveImage
        src="https://api.fermatmind.com/static/articles/covers/source-cover.jpg"
        alt="CMS article cover"
        className="h-40"
        variants={{
          hero: {
            url: "https://api.fermatmind.com/storage/media-library/variants/hero-cover.jpg",
            media: null,
            mimeType: "image/jpeg",
            width: 1200,
            height: 675,
          },
          card: {
            url: "https://api.fermatmind.com/storage/media-library/variants/card-cover.jpg",
            media: null,
            mimeType: "image/jpeg",
            width: 800,
            height: 450,
          },
          thumbnail: {
            url: "https://api.fermatmind.com/storage/media-library/variants/thumbnail-cover.jpg",
            media: null,
            mimeType: "image/jpeg",
            width: 320,
            height: 180,
          },
          square: null,
          og: null,
          preload: null,
        }}
      />
    );

    expect(getRenderedBackground(container)?.getAttribute("style")).toContain("card-cover.jpg");
    expectNoNativeImage(container);
  });

  it("prefers hero variants over card variants in hero mode", () => {
    const { container } = render(
      <ArticleResponsiveImage
        src="https://api.fermatmind.com/static/articles/covers/source-cover.jpg"
        alt="CMS article cover"
        className="h-80"
        mode="hero"
        variants={{
          hero: {
            url: "https://api.fermatmind.com/storage/media-library/variants/hero-cover.jpg",
            media: null,
            mimeType: "image/jpeg",
            width: 1200,
            height: 675,
          },
          card: {
            url: "https://api.fermatmind.com/storage/media-library/variants/card-cover.jpg",
            media: null,
            mimeType: "image/jpeg",
            width: 800,
            height: 450,
          },
          thumbnail: null,
          square: null,
          og: null,
          preload: null,
        }}
      />
    );

    expect(getRenderedBackground(container)?.getAttribute("style")).toContain("hero-cover.jpg");
    expectNoNativeImage(container);
  });

  it("skips unsafe media URLs and keeps the stable fallback art", () => {
    const { container } = render(
      <ArticleResponsiveImage src="javascript:alert(1)" alt="Unsafe CMS article cover" className="h-40" />
    );

    expect(getShell(container)?.getAttribute("data-cms-image-state")).toBe("fallback");
    expect(getFallback(container)).not.toBeNull();
    expect(getRenderedBackground(container)).toBeNull();
    expectNoNativeImage(container);
  });

  it("uses a safe source URL when all preferred variants are placeholders", () => {
    const { container } = render(
      <ArticleResponsiveImage
        src="https://api.fermatmind.com/static/articles/covers/source-cover.jpg"
        alt="CMS article cover"
        className="h-40"
        variants={{
          hero: {
            url: "__CMS_MEDIA_LIBRARY_PLACEHOLDER__",
            media: null,
            mimeType: null,
            width: null,
            height: null,
          },
          card: {
            url: "__CMS_ARTICLE_COVER_PLACEHOLDER__",
            media: null,
            mimeType: null,
            width: null,
            height: null,
          },
          thumbnail: null,
          square: null,
          og: null,
          preload: null,
        }}
      />
    );

    expect(getRenderedBackground(container)?.getAttribute("style")).toContain("source-cover.jpg");
    expect(getFallback(container)).toBeNull();
    expectNoNativeImage(container);
  });
});
