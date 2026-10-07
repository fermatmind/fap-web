import { apiClient } from "@/lib/api-client";
import { toApiLocale, type Locale } from "@/lib/i18n/locales";
import { CANONICAL_SITE_URL } from "@/lib/site";

export const ARTICLE_FEED_TYPE = "application/atom+xml";
export const articleFeedPath = (locale: Locale) => `/${locale}/articles/feed.xml`;
export const articleFeedTitle = (locale: Locale) => locale === "zh" ? "费马博客" : "FermatMind Blog";

export type PublicFeedArticle = {
  id: number; slug: string; title: string; excerpt: string;
  publishedAt: string; updatedAt: string; canonical: string;
};

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid article feed authority");
  return value as Record<string, unknown>;
}

function timestamp(value: unknown, now: number): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) {
    throw new Error("Missing feed publication clock");
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time > now) throw new Error("Invalid feed publication clock");
  return new Date(time).toISOString();
}

export function normalizeArticleFeed(value: unknown, locale: Locale, now = Date.now()): PublicFeedArticle[] {
  const payload = record(value);
  if (payload.ok !== true || payload.schema_version !== "public-article-feed.v1"
    || payload.locale !== toApiLocale(locale) || !Array.isArray(payload.items) || payload.items.length > 100) {
    throw new Error("Unsupported article feed authority");
  }
  const ids = new Set<number>();
  return payload.items.map((raw) => {
    const item = record(raw);
    if (typeof item.id !== "number" || !Number.isSafeInteger(item.id) || item.id <= 0 || ids.has(item.id)
      || typeof item.published_revision_id !== "number" || !Number.isSafeInteger(item.published_revision_id) || item.published_revision_id <= 0
      || item.locale !== toApiLocale(locale) || typeof item.slug !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(item.slug)
      || typeof item.title !== "string" || !item.title.trim() || item.title.length > 512
      || (item.excerpt !== null && (typeof item.excerpt !== "string" || item.excerpt.length > 8192))) {
      throw new Error("Invalid article feed entry");
    }
    const canonical = `${CANONICAL_SITE_URL}/${locale}/articles/${item.slug}`;
    if (item.canonical !== canonical) throw new Error("Invalid article feed canonical");
    const publishedAt = timestamp(item.published_at, now);
    const updatedAt = timestamp(item.material_updated_at, now);
    if (updatedAt < publishedAt) throw new Error("Feed update precedes publication");
    ids.add(item.id);
    return { id: item.id, slug: item.slug, title: item.title, excerpt: item.excerpt ?? "", publishedAt, updatedAt, canonical };
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || b.id - a.id);
}

export async function getPublicArticleFeed(locale: Locale): Promise<PublicFeedArticle[]> {
  const payload = await apiClient.get<unknown>(`/v0.5/articles-feed?locale=${toApiLocale(locale)}&org_id=0`, {
    locale, skipAuth: true, cache: "no-store",
  });
  return normalizeArticleFeed(payload, locale);
}

function xml(value: string): string {
  // XML 1.0 excludes controls and unpaired surrogates, even inside escaped text.
  return Array.from(value).filter((character) => {
    const point = character.codePointAt(0)!;
    return point === 9 || point === 10 || point === 13 || (point >= 32 && point <= 0xd7ff)
      || (point >= 0xe000 && point <= 0xfffd) || (point >= 0x10000 && point <= 0x10ffff);
  }).join("").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function serializeArticleAtom(locale: Locale, articles: PublicFeedArticle[], generatedAt = new Date()): string {
  const self = `${CANONICAL_SITE_URL}${articleFeedPath(locale)}`;
  const updated = articles.reduce((latest, item) => item.updatedAt > latest ? item.updatedAt : latest, "")
    || generatedAt.toISOString(); // Empty feed's observation time; never an article publication date.
  return `<?xml version="1.0" encoding="utf-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="${toApiLocale(locale)}">
  <id>${self}</id><title>${xml(articleFeedTitle(locale))}</title><updated>${updated}</updated>
  <author><name>FermatMind</name><uri>${CANONICAL_SITE_URL}</uri></author>
  <link rel="self" type="${ARTICLE_FEED_TYPE}" href="${self}"/>
  <link rel="alternate" href="${CANONICAL_SITE_URL}/${locale}/articles"/>
${articles.map((item) => `  <entry><id>urn:fermatmind:article:${toApiLocale(locale)}:${item.id}</id>
    <title>${xml(item.title)}</title><link rel="alternate" href="${xml(item.canonical)}"/>
    <published>${item.publishedAt}</published><updated>${item.updatedAt}</updated>
    <summary type="text">${xml(item.excerpt)}</summary>
  </entry>`).join("\n")}
</feed>\n`;
}

export function articleFeedAlternate(locale: Locale) {
  return { "application/atom+xml": [{ url: `${CANONICAL_SITE_URL}${articleFeedPath(locale)}`, title: articleFeedTitle(locale) }] };
}
