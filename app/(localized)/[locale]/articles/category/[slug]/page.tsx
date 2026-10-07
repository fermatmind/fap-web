import { BlogArchive } from "@/components/articles/BlogArchive";
import { blogArchiveMetadata } from "@/lib/content/blogArchive";
import { resolveLocale } from "@/lib/i18n/getDict";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  return blogArchiveMetadata(resolveLocale(locale), await searchParams, slug);
}

export default async function BlogCategoryPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  return BlogArchive({ locale: resolveLocale(locale), query: await searchParams, category: slug });
}
