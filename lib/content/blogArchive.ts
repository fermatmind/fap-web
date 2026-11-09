import { cache } from "react";
import type { Metadata } from "next";
import { getCmsArticlesWithLastKnownGood, normalizeArticleListPage, type GetCmsArticlesResult } from "@/lib/cms/articles";
import { getDict } from "@/lib/i18n/getDict";
import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl, getSiteUrlOrThrow, isConfiguredStagingSiteUrl } from "@/lib/site";

export type BlogArchiveState = { data: GetCmsArticlesResult | null; stale: boolean; failed: boolean };

export function blogArchivePath(locale: DisplayLocale, category = "", page = 1): string {
  const path = category ? `/articles/category/${category}` : "/articles";
  const base = locale === "zh-TW" ? "/zh-TW" + path : localizedPath(path, locale);
  return page > 1 ? `${base}?page=${page}` : base;
}

export function blogArchiveTitle(title: string, locale: DisplayLocale, page: number): string {
  if (page <= 1) return title;
  const pageLabel = locale === "zh-TW" ? `第 ${page} 頁` : locale === "zh" ? `第 ${page} 页` : `Page ${page}`;
  return `${title} · ${pageLabel}`;
}

export function blogArchiveQuery(query: Record<string, string | string[] | undefined>) {
  const page = normalizeArticleListPage(query.page);
  const canonicalQuery = Object.keys(query).every((key) => key === "page")
    && (query.page === undefined || (typeof query.page === "string" && query.page === String(page) && page > 1));
  return { page, canonicalQuery };
}

export const loadBlogArchive = cache(async (locale: DisplayLocale, page: number, category = ""): Promise<BlogArchiveState> => {
  try {
    const response = await getCmsArticlesWithLastKnownGood({ locale, page, categorySlug: category || undefined, includeBlog: true });
    return { data: response.value, stale: response.stale === true, failed: false };
  } catch {
    return { data: null, stale: false, failed: true };
  }
});

export async function blogArchiveMetadata(locale: DisplayLocale, query: Record<string, string | string[] | undefined>, category = ""): Promise<Metadata> {
  const { page, canonicalQuery } = blogArchiveQuery(query);
  const [state, dict] = await Promise.all([loadBlogArchive(locale, page, category), getDict(locale)]);
  const blog = state.data?.blog;
  const activeCategory = blog?.configurationState === "published" ? blog.categories.find((item) => item.slug === category) : undefined;
  const baseTitle = category ? activeCategory?.name || dict.articles.title : blog?.title || dict.articles.title;
  const title = blogArchiveTitle(baseTitle, locale, page);
  const description = category ? activeCategory?.description || "" : blog?.description || "";
  const pathname = blogArchivePath(locale, category, page);
  const exists = !state.failed && !state.stale && Boolean(state.data) && page <= (state.data?.pagination.lastPage || 1)
    && (!category || Boolean(activeCategory));
  // Public content publication does not release CMS discoverability holds.
  const held = page > 1 || Boolean(category) || (blog?.configurationState === "published" && blog.isIndexable !== true);
  if (locale === "zh-TW") {
    const staging = isConfiguredStagingSiteUrl();
    const index = exists && canonicalQuery && !held && blog?.configurationState === "published";
    return {
      title,
      ...(description ? { description } : {}),
      alternates: { canonical: canonicalUrl(pathname) },
      robots: { index: index && !staging, follow: !staging },
    };
  }

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
