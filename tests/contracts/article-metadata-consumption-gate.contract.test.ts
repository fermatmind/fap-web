import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CmsArticle, CmsArticleSeoPayload } from "@/lib/cms/articles";

const ROOT = process.cwd();
const ARTICLE_PAGE_PATH = path.join(ROOT, "app/(localized)/[locale]/articles/[slug]/page.tsx");
const DOC_PATH = path.join(ROOT, "docs/seo/cms-metadata-consumption-gate.md");
const ARTIFACT_PATH = path.join(ROOT, "docs/seo/generated/cms-metadata-consumption-gate.v1.json");
const SCHEMA_HELPER_PATH = path.join(ROOT, "lib/seo/generateSchema.ts");

type CmsMetadataConsumptionArtifact = {
  version: string;
  scope: string;
  sitemapUrlSetChanged: boolean;
  llmsExposureChanged: boolean;
  schemaOrgChanged: boolean;
  authority: {
    articleMetadata: string;
    articleContent: string;
    canonical: string;
    hreflang: string;
    ogImageAlt: string;
  };
  consumedFields: string[];
  mustNotChange: string[];
};

const COVER_URL = "https://cdn.fermatmind.com/articles/cms-metadata-og.jpg";
const COVER_ALT = "CMS-provided illustration for article metadata consumption";

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function readArtifact(): CmsMetadataConsumptionArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as CmsMetadataConsumptionArtifact;
}

function makeArticle(overrides: Partial<CmsArticle> = {}): CmsArticle {
  return {
    id: 101,
    slug: "cms-metadata-gate",
    locale: "zh-CN",
    title: "Article runtime title",
    excerpt: "Article excerpt fallback description.",
    contentMd: "Article body",
    contentHtml: "",
    authorName: "Fermat Institute",
    reviewerName: null,
    readingMinutes: 4,
    coverImageUrl: COVER_URL,
    coverImageAlt: COVER_ALT,
    coverImageWidth: 1200,
    coverImageHeight: 630,
    coverImageVariants: {
      hero: { url: COVER_URL, width: 1200, height: 630, mimeType: "image/jpeg", media: null },
      card: null,
      thumbnail: null,
      square: null,
      og: { url: COVER_URL, width: 1200, height: 630, mimeType: "image/jpeg", media: null },
      preload: null,
    },
    relatedTestSlug: null,
    voice: null,
    voiceOrder: null,
    status: "published",
    isPublic: true,
    isIndexable: true,
    publishedRevisionId: 1001,
    publishedAt: "2026-05-01T00:00:00Z",
    scheduledAt: null,
    createdAt: "2026-04-30T00:00:00Z",
    updatedAt: "2026-05-02T00:00:00Z",
    category: { id: 1, slug: "seo", name: "SEO" },
    tags: [],
    seoMeta: null,
    landingSurface: null,
    answerSurface: null,
    ...overrides,
  };
}

function makeSeo(overrides: Partial<CmsArticleSeoPayload["meta"]> = {}): CmsArticleSeoPayload {
  return {
    meta: {
      title: "CMS SEO Title",
      description: "CMS SEO description from backend.",
      canonical: "https://fermatmind.com/zh/articles/cms-metadata-gate",
      alternates: {
        en: "https://fermatmind.com/en/articles/cms-metadata-gate",
        "zh-CN": "https://fermatmind.com/zh/articles/cms-metadata-gate",
      },
      og: {
        title: "CMS OG Title",
        description: "CMS OG description.",
        image: COVER_URL,
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "CMS Twitter Title",
        description: "CMS Twitter description.",
        image: COVER_URL,
      },
      robots: "index,follow",
      ...overrides,
    },
    jsonld: null,
    surface: null,
  };
}

function getImages(metadata: Metadata, family: "openGraph" | "twitter"): unknown[] {
  const surface = metadata[family] as { images?: unknown } | null | undefined;
  const images = surface?.images;
  return Array.isArray(images) ? images : images ? [images] : [];
}

async function loadArticleMetadata({
  article = makeArticle(),
  seo = makeSeo(),
}: {
  article?: CmsArticle;
  seo?: CmsArticleSeoPayload | null;
} = {}): Promise<Metadata> {
  process.env.NEXT_PUBLIC_SITE_URL = "https://fermatmind.com";
  vi.resetModules();
  vi.doMock("@/lib/cms/articles", async () => {
    const actual = await vi.importActual<typeof import("@/lib/cms/articles")>("@/lib/cms/articles");

    return {
      ...actual,
      getCmsArticleWithLastKnownGood: vi.fn(async () => ({ value: article })),
      getCmsArticleSeoWithLastKnownGood: vi.fn(async () => ({ value: seo })),
    };
  });

  const { generateMetadata } = await import("@/app/(localized)/[locale]/articles/[slug]/page");
  return generateMetadata({
    params: Promise.resolve({ locale: "zh", slug: article.slug }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("article CMS metadata consumption gate", () => {
  it("uses CMS SEO title, description, canonical, hreflang, x-default, and OG image alt", async () => {
    const metadata = await loadArticleMetadata();
    const openGraphImages = getImages(metadata, "openGraph");
    const twitterImages = getImages(metadata, "twitter");

    expect(metadata.title).toBe("CMS SEO Title");
    expect(metadata.description).toBe("CMS SEO description from backend.");
    expect(String(metadata.alternates?.canonical)).toBe("https://fermatmind.com/zh/articles/cms-metadata-gate");
    expect(metadata.alternates?.languages).toMatchObject({
      en: "https://fermatmind.com/en/articles/cms-metadata-gate",
      "zh-CN": "https://fermatmind.com/zh/articles/cms-metadata-gate",
      "x-default": "https://fermatmind.com/en/articles/cms-metadata-gate",
    });
    expect(openGraphImages[0]).toEqual({ url: COVER_URL, alt: COVER_ALT });
    expect(twitterImages[0]).toEqual({ url: COVER_URL, alt: COVER_ALT });
  });

  it("uses article excerpt only as description fallback when CMS SEO description is absent", async () => {
    const metadata = await loadArticleMetadata({
      seo: makeSeo({
        description: "",
        og: {
          title: "CMS OG Title",
          description: "",
          image: COVER_URL,
          type: "article",
        },
        twitter: {
          card: "summary_large_image",
          title: "CMS Twitter Title",
          description: "",
          image: COVER_URL,
        },
      }),
    });

    expect(metadata.title).toBe("CMS SEO Title");
    expect(metadata.description).toBe("Article excerpt fallback description.");
    expect((metadata.openGraph as { description?: string }).description).toBe("Article excerpt fallback description.");
    expect((metadata.twitter as { description?: string }).description).toBe("Article excerpt fallback description.");
  });

  it("does not invent hidden image alt metadata when CMS cover image alt is missing", async () => {
    const metadata = await loadArticleMetadata({
      article: makeArticle({ coverImageAlt: null }),
    });

    expect(getImages(metadata, "openGraph")[0]).toBe(COVER_URL);
    expect(getImages(metadata, "twitter")[0]).toBe(COVER_URL);
  });

  it("keeps source wiring within i18n passport and canonical authority contracts", () => {
    const articlePage = fs.readFileSync(ARTICLE_PAGE_PATH, "utf8");

    expect(articlePage).toContain("buildI18nSeoPassport");
    expect(articlePage).toContain("authorityAlternates: articleAlternateLanguages(seo)");
    expect(articlePage).toContain('canonicalRouteFamily: "article_detail"');
    expect(articlePage).toContain("buildArticleMetadataImage(ogImage, article.coverImageAlt)");
    expect(articlePage).toContain("alt={article.coverImageAlt ?? article.title}");
    expect(articlePage).not.toContain("languages: articleAlternateLanguages(seo)");
  });

  it("documents CMS metadata authority without discoverability or schema expansion", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");
    const schemaHelper = fs.readFileSync(SCHEMA_HELPER_PATH, "utf8");

    expect(artifact.version).toBe("seo.cms_metadata_consumption.v1");
    expect(artifact.scope).toBe("PR-SEO-01D");
    expect(artifact.sitemapUrlSetChanged).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.schemaOrgChanged).toBe(false);
    expect(artifact.authority).toMatchObject({
      articleMetadata: "backend_cms_seo_payload",
      articleContent: "backend_cms_article_payload",
      canonical: "canonical_authority_contract",
      hreflang: "i18n_seo_passport",
      ogImageAlt: "cms_cover_image_alt_only",
    });
    expect(artifact.consumedFields).toEqual(
      expect.arrayContaining(["seo.meta.title", "seo.meta.description", "article.coverImageAlt"])
    );
    expect(doc).toContain("Backend/CMS owns article metadata truth");
    expect(doc).toContain("Missing cover alt must not produce hidden or fake metadata alt text");
    expect(schemaHelper).not.toContain("AggregateRating");
    expect(schemaHelper).not.toContain("Review");
    expect(schemaHelper).not.toContain('"@type": "Product"');
    expect(schemaHelper).not.toContain('"@type": "Offer"');
  });
});
