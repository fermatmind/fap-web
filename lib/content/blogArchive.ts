import { cache } from "react";
import type { Metadata } from "next";
import { getCmsArticlesWithLastKnownGood, normalizeArticleListPage, type GetCmsArticlesResult } from "@/lib/cms/articles";
import { getDict } from "@/lib/i18n/getDict";
import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";

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
  const staging = isConfiguredStagingSiteUrl();
  const indexableBlog = (archive: BlogArchiveState) => !archive.failed && !archive.stale
    && archive.data?.blog?.configurationState === "published" && archive.data.blog.isIndexable;
  let languages: Record<string, string> | undefined;
  if (exists && canonicalQuery && !held && !staging && indexableBlog(state)) {
    const locales: DisplayLocale[] = ["en", "zh", "zh-TW"];
    const archives = await Promise.all(locales.map((candidate) => candidate === locale ? state : loadBlogArchive(candidate, 1)));
    const eligible = locales.filter((_, index) => indexableBlog(archives[index]));
    if (eligible.length > 1) {
      languages = Object.fromEntries(eligible.map((candidate) => [
        candidate === "zh" ? "zh-CN" : candidate, canonicalUrl(blogArchivePath(candidate)),
      ]));
    }
  }
  if (locale === "zh-TW") {
    const index = exists && canonicalQuery && !held && indexableBlog(state);
    return {
      title,
      ...(description ? { description } : {}),
      alternates: { canonical: canonicalUrl(pathname), ...(languages ? { languages } : {}) },
      robots: { index: index && !staging, follow: !staging },
    };
  }

  const metadata = buildPageMetadata({ locale, pathname, title, description, omitLanguageAlternates: true,
    noindex: !exists || !canonicalQuery || held || blog?.configurationState === "invalid" ? true : undefined,
    noindexFollow: true, alternatesByLocale: { en: "/en/articles", zh: "/zh/articles" } });
  if (languages) metadata.alternates = { ...metadata.alternates, languages };
  if (!description) {
    delete metadata.description;
    if (metadata.openGraph) delete metadata.openGraph.description;
    if (metadata.twitter) delete metadata.twitter.description;
  }
  return metadata;
}
