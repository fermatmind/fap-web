import type { Locale } from "@/lib/i18n/locales";

// Public source dimensions only. The backend resolves publication and locale
// authority; no browser identity or private URL participates in this metadata.
export function buildPublicArticleStartMeta(query: { get(name: string): string | null }, locale: Locale): Record<string, string> {
  if (query.get("source_page_type") !== "article_detail") return {};
  const slug = query.get("source_slug") ?? "";
  const landingPath = query.get("landing_path") ?? "";
  const contentId = query.get("content_id");
  const publicPath = `/${locale}/articles/${slug}`;
  // Existing article CTAs retain legitimate attribution queries. Match the
  // root-relative pathname strictly, then discard every query/fragment value.
  const sourcePath = landingPath.split(/[?#]/, 1)[0];
  if (slug.length > 128 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    || landingPath.length > 4096 || /[\\\u0000-\u001f\u007f]/.test(landingPath)
    || sourcePath !== publicPath) return {};
  if (contentId !== null && (!/^[1-9][0-9]*$/.test(contentId) || !Number.isSafeInteger(Number(contentId)))) return {};
  return { source_page_type: "article_detail", source_slug: slug, landing_path: publicPath,
    ...(contentId !== null ? { content_id: contentId } : {}) };
}
