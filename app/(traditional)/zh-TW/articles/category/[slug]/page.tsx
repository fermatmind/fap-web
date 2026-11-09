import { BlogArchive } from "@/components/articles/BlogArchive";
import { blogArchiveMetadata } from "@/lib/content/blogArchive";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props) {
  return blogArchiveMetadata("zh-TW", await searchParams, (await params).slug);
}

export default async function TraditionalBlogCategoryPage({ params, searchParams }: Props) {
  return BlogArchive({ locale: "zh-TW", query: await searchParams, category: (await params).slug });
}
