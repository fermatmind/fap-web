import { cache } from "react";
import type { Metadata } from "next";
import { getCmsArticlesWithLastKnownGood, normalizeArticleListPage, type GetCmsArticlesResult } from "@/lib/cms/articles";
import { getDict } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getSiteUrlOrThrow } from "@/lib/site";

export type BlogArchiveState = { data: GetCmsArticlesResult | null; stale: boolean; failed: boolean };

export function blogArchivePath(locale: Locale, category = "", page = 1): string {
  const base = localizedPath(category ? `/articles/category/${category}` : "/articles", locale);
  return page > 1 ? `${base}?page=${page}` : base;
}

export function blogArchiveQuery(query: Record<string, string | string[] | undefined>) {
  const page = normalizeArticleListPage(query.page);
  const canonicalQuery = Object.keys(query).every((key) => key === "page")
    && (query.page === undefined || (typeof query.page === "string" && query.page === String(page) && page > 1));
  return { page, canonicalQuery };
}

export const loadBlogArchive = cache(async (locale: Locale, page: number, category = ""): Promise<BlogArchiveState> => {
  try {
    const response = await getCmsArticlesWithLastKnownGood({ locale, page, categorySlug: category || undefined, includeBlog: true });
    return { data: response.value, stale: response.stale === true, failed: false };
  } catch {
    return { data: null, stale: false, failed: true };
  }
});

export async function blogArchiveMetadata(locale: Locale, query: Record<string, string | string[] | undefined>, category = ""): Promise<Metadata> {
  const { page, canonicalQuery } = blogArchiveQuery(query);
  const [state, dict] = await Promise.all([loadBlogArchive(locale, page, category), getDict(locale)]);
  const blog = state.data?.blog;
  const activeCategory = blog?.configurationState === "published" ? blog.categories.find((item) => item.slug === category) : undefined;
  const baseTitle = category ? activeCategory?.name || dict.articles.title : blog?.title || dict.articles.title;
  const title = page > 1 ? `${baseTitle} · ${locale === "zh" ? `第 ${page} 页` : `Page ${page}`}` : baseTitle;
  const description = category ? activeCategory?.description || "" : blog?.description || "";
  const pathname = blogArchivePath(locale, category, page);
  const exists = !state.failed && !state.stale && Boolean(state.data) && page <= (state.data?.pagination.lastPage || 1)
    && (!category || Boolean(activeCategory));
  // Public content publication does not release CMS discoverability holds.
  const held = Boolean(category) || (blog?.configurationState === "published" && blog.isIndexable !== true);
  const metadata = buildPageMetadata({ locale, pathname, title, description, omitLanguageAlternates: true,
    noindex: !exists || !canonicalQuery || held || blog?.configurationState === "invalid" ? true : undefined,
    noindexFollow: true, alternatesByLocale: { en: "/en/articles", zh: "/zh/articles" } });
  // Equal-looking translated paths alone are not evidence of a real pair.
  if (exists && canonicalQuery && !held) {
    const otherLocale = locale === "en" ? "zh" : "en";
    const other = await loadBlogArchive(otherLocale, page, category);
    const otherCategory = other.data?.blog?.categories.find((item) => item.slug === category);
    if (!other.failed && !other.stale && other.data && page <= other.data.pagination.lastPage
      && blog?.configurationState === "published" && other.data.blog?.configurationState === "published"
      && other.data.blog.isIndexable === true
      && (!category || (other.data.blog?.configurationState === "published" && otherCategory && otherCategory.lineKey === activeCategory?.lineKey))) {
      metadata.alternates = { ...metadata.alternates, languages: {
        [locale === "zh" ? "zh-CN" : "en"]: `${getSiteUrlOrThrow()}${pathname}`,
        [otherLocale === "zh" ? "zh-CN" : "en"]: `${getSiteUrlOrThrow()}${blogArchivePath(otherLocale, category, page)}`,
      } };
    }
  }
  if (!description) {
    delete metadata.description;
    if (metadata.openGraph) delete metadata.openGraph.description;
    if (metadata.twitter) delete metadata.twitter.description;
  }
  return metadata;
}
