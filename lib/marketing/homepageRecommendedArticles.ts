import { getCmsLandingSurfaceWithLastKnownGood, type CmsPageBlock } from "@/lib/cms/landing-surfaces";
import type { CmsArticle, CmsArticleCategory, CmsArticleImageVariants, CmsArticleTag } from "@/lib/cms/articles";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { unknownPublicReview } from "@/lib/public-content/publicReview";

const HOMEPAGE_RECOMMENDED_ARTICLE_BLOCK_KEYS = new Set([
  "recommended_articles",
  "homepage_recommended_articles",
]);

type RecommendedArticlePayload = {
  items?: unknown[];
  articles?: unknown[];
};

type RecommendedArticleRecord = {
  article?: unknown;
  id?: unknown;
  slug?: unknown;
  locale?: unknown;
  title?: unknown;
  excerpt?: unknown;
  published_at?: unknown;
  updated_at?: unknown;
  created_at?: unknown;
  reading_minutes?: unknown;
  category?: unknown;
  tags?: unknown;
  cover_image_url?: unknown;
  cover_image_alt?: unknown;
  cover_image_width?: unknown;
  cover_image_height?: unknown;
  cover_image_variants?: unknown;
  status?: unknown;
  is_public?: unknown;
  is_indexable?: unknown;
  published_revision_id?: unknown;
  publishedRevisionId?: unknown;
  published_revision?: unknown;
  publishedRevision?: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function normalizeNullableText(value: unknown): string | null {
  const normalized = normalizeText(value);
  return normalized || null;
}

function normalizePositiveInteger(value: unknown): number | null {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function normalizeStatus(value: unknown): string {
  return normalizeText(value).toLowerCase();
}

function normalizePublishedRevisionId(record: RecommendedArticleRecord): number | null {
  const publishedRevision = asRecord(record.published_revision);
  const publishedRevisionCamel = asRecord(record.publishedRevision);

  return (
    normalizePositiveInteger(record.published_revision_id) ??
    normalizePositiveInteger(record.publishedRevisionId) ??
    normalizePositiveInteger(publishedRevision?.id) ??
    normalizePositiveInteger(publishedRevisionCamel?.id)
  );
}

function normalizeArticleLocale(value: unknown, fallback: Locale): string {
  const normalized = normalizeText(value);
  return normalized || toApiLocale(fallback);
}

function normalizeImageVariant(value: unknown): CmsArticleImageVariants["hero"] {
  if (typeof value === "string") {
    const url = normalizeNullableText(value);
    return url ? { url, width: null, height: null, mimeType: null, media: null } : null;
  }

  const record = asRecord(value);
  const url = normalizeNullableText(record?.url ?? record?.src ?? record?.href);
  if (!url) return null;

  return {
    url,
    width: normalizePositiveInteger(record?.width ?? record?.w),
    height: normalizePositiveInteger(record?.height ?? record?.h),
    mimeType: normalizeNullableText(record?.mime_type ?? record?.mimeType ?? record?.type),
    media: normalizeNullableText(record?.media ?? record?.media_query ?? record?.mediaQuery),
  };
}

function pickImageVariant(source: unknown, ...keys: string[]): CmsArticleImageVariants["hero"] {
  const record = asRecord(source);
  if (!record) return null;

  for (const key of keys) {
    const variant = normalizeImageVariant(record[key]);
    if (variant) return variant;
  }

  return null;
}

function normalizeImageVariants(value: unknown): CmsArticleImageVariants {
  const record = asRecord(value);

  return {
    hero: pickImageVariant(record, "hero", "full", "full_width", "fullWidth", "large", "desktop"),
    card: pickImageVariant(record, "card", "teaser", "large", "desktop", "list"),
    thumbnail: pickImageVariant(record, "thumbnail", "thumb", "medium", "mobile"),
    square: pickImageVariant(record, "square", "og_square", "one_by_one", "oneByOne"),
    og: pickImageVariant(record, "og", "social", "share", "open_graph", "openGraph"),
    preload: pickImageVariant(record, "preload", "placeholder", "blur", "low"),
  };
}

function firstImageUrl(...variants: Array<CmsArticleImageVariants["hero"]>): string | null {
  for (const variant of variants) {
    if (variant?.url) return variant.url;
  }

  return null;
}

function normalizeTag(value: unknown): CmsArticleTag | null {
  const record = asRecord(value);
  const slug = normalizeText(record?.slug);
  const name = normalizeText(record?.name ?? record?.title);

  if (!slug && !name) return null;

  return {
    id: normalizePositiveInteger(record?.id),
    slug,
    name: name || slug,
  };
}

function normalizeTags(value: unknown): CmsArticleTag[] {
  return Array.isArray(value) ? value.map(normalizeTag).filter((tag): tag is CmsArticleTag => tag !== null) : [];
}

function normalizeCategory(value: unknown): CmsArticleCategory {
  const record = asRecord(value);
  if (!record) return null;

  const slug = normalizeText(record.slug);
  const name = normalizeText(record.name ?? record.title);

  if (!slug && !name) return null;

  return {
    id: normalizePositiveInteger(record.id),
    slug,
    name: name || slug,
  };
}

function normalizeArticleBlockItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  const record = asRecord(payload) as RecommendedArticlePayload | null;
  if (Array.isArray(record?.items)) return record.items;
  if (Array.isArray(record?.articles)) return record.articles;

  return [];
}

function findRecommendedArticlesBlock(blocks: CmsPageBlock[]): CmsPageBlock | null {
  return (
    [...blocks]
      .filter((block) => block.isEnabled && HOMEPAGE_RECOMMENDED_ARTICLE_BLOCK_KEYS.has(block.blockKey))
      .sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null
  );
}

function matchesLocale(articleLocale: string, locale: Locale): boolean {
  return articleLocale.toLowerCase() === toApiLocale(locale).toLowerCase();
}

function normalizeRecommendedArticle(value: unknown, locale: Locale): CmsArticle | null {
  const wrapper = asRecord(value) as RecommendedArticleRecord | null;
  const record = (asRecord(wrapper?.article) ?? wrapper) as RecommendedArticleRecord | null;
  if (!record) return null;

  const slug = normalizeText(record.slug);
  const title = normalizeText(record.title);
  const articleLocale = normalizeArticleLocale(record.locale, locale);

  if (!slug || !title || !matchesLocale(articleLocale, locale)) {
    return null;
  }

  const id = normalizePositiveInteger(record.id) ?? 0;
  const publishedRevisionId = normalizePublishedRevisionId(record);
  const status = normalizeStatus(record.status) || "published";
  const isPublic = record.is_public !== false;

  if (status !== "published" || !isPublic || publishedRevisionId === null) {
    return null;
  }

  const excerpt = normalizeText(record.excerpt);
  const coverImageVariants = normalizeImageVariants(record.cover_image_variants);
  const coverImageUrl =
    normalizeNullableText(record.cover_image_url) ??
    firstImageUrl(coverImageVariants.card, coverImageVariants.hero, coverImageVariants.og, coverImageVariants.thumbnail);
  const coverImageAlt = normalizeNullableText(record.cover_image_alt);
  const category = normalizeCategory(record.category);
  const tags = normalizeTags(record.tags);

  if (!excerpt || !coverImageUrl || !coverImageAlt || !category || tags.length === 0) {
    return null;
  }

  return {
    id,
    slug,
    locale: articleLocale,
    title,
    excerpt,
    contentMd: "",
    contentHtml: "",
    authorName: null,
    publicReview: unknownPublicReview(),
    readingMinutes: normalizePositiveInteger(record.reading_minutes),
    coverImageUrl,
    coverImageAlt,
    coverImageWidth: normalizePositiveInteger(record.cover_image_width),
    coverImageHeight: normalizePositiveInteger(record.cover_image_height),
    coverImageVariants,
    relatedTestSlug: null,
    voice: null,
    voiceOrder: null,
    status,
    isPublic,
    isIndexable: record.is_indexable !== false,
    publishedRevisionId,
    publishedAt: normalizeNullableText(record.published_at),
    scheduledAt: null,
    createdAt: normalizeNullableText(record.created_at),
    updatedAt: normalizeNullableText(record.updated_at),
    category,
    tags,
    seoMeta: null,
    landingSurface: null,
    answerSurface: null,
  };
}

export async function getHomepageRecommendedArticles(locale: Locale): Promise<CmsArticle[]> {
  const surface = await getCmsLandingSurfaceWithLastKnownGood("home", locale);
  const block = findRecommendedArticlesBlock(surface.value.pageBlocks);
  if (!block) return [];

  return normalizeArticleBlockItems(block.payloadJson)
    .map((item) => normalizeRecommendedArticle(item, locale))
    .filter((item): item is CmsArticle => item !== null)
    .filter((article) => article.isPublic && article.status === "published")
    .slice(0, 6);
}
