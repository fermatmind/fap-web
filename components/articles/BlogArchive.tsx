import { notFound } from "next/navigation";
import { BlogArchiveView } from "@/components/articles/BlogArchiveView";
import { blogArchiveQuery, loadBlogArchive } from "@/lib/content/blogArchive";
import type { Locale } from "@/lib/i18n/locales";

export async function BlogArchive({ locale, query, category = "" }: { locale: Locale; query: Record<string, string | string[] | undefined>; category?: string }) {
  if (category && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(category)) notFound();
  const { page } = blogArchiveQuery(query);
  const state = await loadBlogArchive(locale, page, category);
  const blog = state.data?.blog;
  const configured = blog?.configurationState === "published";
  const knownConfiguration = configured || blog?.configurationState === "unconfigured";
  if (category && knownConfiguration && !state.failed && !state.stale && !blog?.categories.some((item) => item.slug === category)) notFound();
  return <BlogArchiveView locale={locale} state={state} category={category} page={page} />;
}
