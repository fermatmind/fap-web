import { BlogArchive } from "@/components/articles/BlogArchive";
import { blogArchiveMetadata } from "@/lib/content/blogArchive";
import { resolveLocale } from "@/lib/i18n/getDict";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props) {
  return blogArchiveMetadata(resolveLocale((await params).locale), await searchParams);
}

export default async function ArticlesPage({ params, searchParams }: Props) {
  return BlogArchive({ locale: resolveLocale((await params).locale), query: await searchParams });
}
