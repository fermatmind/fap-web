import { getCmsArticle, getCmsArticles, normalizeBlog, type CmsArticle } from "@/lib/cms/articles";
import type { BlogArchiveState } from "@/lib/content/blogArchive";
import type { Locale } from "@/lib/i18n/locales";

export const BLOG_PREVIEW_OPS_ORIGIN = "https://ops.fermatmind.com";
export const BLOG_PREVIEW_READY = "fermatmind.blog-preview.ready.v1";
const PREVIEW_TYPE = "fermatmind.blog-preview.v1";

export type BlogPreviewPayload = {
  type: typeof PREVIEW_TYPE;
  surface_id: number;
  locale: "en" | "zh-CN";
  configuration_sha256: string;
  binding: { source_sha256: string; package_sha256: string; candidate_sha256: string; surface_state_sha256: string; owner_admin_user_id: number };
  blog: Record<string, unknown> & { featured_items: { id: number; slug: string; locale: string; published_revision_id: number }[] };
};

export function readBlogPreviewMessage(event: Pick<MessageEvent, "origin" | "source" | "data">, opener: Window | null, locale: Locale): BlogPreviewPayload | null {
  if (!opener || event.source !== opener || event.origin !== BLOG_PREVIEW_OPS_ORIGIN) return null;
  const raw = event.data as Partial<BlogPreviewPayload> | null;
  if (!raw || raw.type !== PREVIEW_TYPE || !Number.isSafeInteger(raw.surface_id) || Number(raw.surface_id) < 1
    || raw.locale !== (locale === "zh" ? "zh-CN" : "en")
    || typeof raw.configuration_sha256 !== "string" || !/^[a-f0-9]{64}$/.test(raw.configuration_sha256)
    || !raw.blog || typeof raw.blog !== "object" || !Array.isArray(raw.blog.featured_items)
    || raw.blog.featured_items.length > 12) return null;
  for (const article of raw.blog.featured_items) {
    if (!article || !Number.isSafeInteger(article.id) || article.id < 1 || !Number.isSafeInteger(article.published_revision_id) || article.published_revision_id < 1 || article.locale !== raw.locale
      || typeof article.slug !== "string" || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(article.slug)) return null;
  }
  if (!raw.binding || !Number.isSafeInteger(raw.binding.owner_admin_user_id) || raw.binding.owner_admin_user_id < 1
    || ![raw.binding.source_sha256, raw.binding.package_sha256, raw.binding.candidate_sha256, raw.binding.surface_state_sha256]
      .every((value) => typeof value === "string" && /^[a-f0-9]{64}$/.test(value))) return null;
  const projection = normalizeBlog({ ...raw.blog, featured_items: [], is_indexable: false }, locale);
  return projection.configurationState === "published" ? raw as BlogPreviewPayload : null;
}

export async function loadBlogPreview(payload: BlogPreviewPayload, locale: Locale, category: string, page: number): Promise<BlogArchiveState> {
  // No private endpoint, token, draft article body, cache or fallback is consumed here.
  // The protected Ops page supplies only display config and public article identities.
  const blog = normalizeBlog({ ...payload.blog, featured_items: [], is_indexable: false }, locale);
  if (category && !blog.categories.some((item) => item.slug === category)) throw new Error("Unknown preview category");
  const [list, candidates] = await Promise.all([
    getCmsArticles({ locale, page, categorySlug: category || undefined, allowLocalFallback: false, usePublicCache: false }),
    !category && page === 1 ? Promise.all(payload.blog.featured_items.map((item) => getCmsArticle(item.slug, locale, false))) : [],
  ]);
  const publicCandidates: (CmsArticle | null)[] = candidates;
  blog.featuredItems = publicCandidates.filter((article, index): article is CmsArticle => Boolean(article
    && article.id === payload.blog.featured_items[index]?.id && article.locale === payload.locale
    && article.status === "published" && article.isPublic && article.publishedRevisionId === payload.blog.featured_items[index]?.published_revision_id
    && [article.publishedAt, article.scheduledAt].every((date) => date === null || (Number.isFinite(Date.parse(date)) && Date.parse(date) <= Date.now()))));
  return { data: { ...list, blog }, stale: false, failed: false };
}
