import { BlogArchive } from "@/components/articles/BlogArchive";
import { blogArchiveMetadata } from "@/lib/content/blogArchive";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props) {
  return blogArchiveMetadata("zh-TW", await searchParams);
}

export default async function TraditionalBlogPage({ searchParams }: Props) {
  return BlogArchive({ locale: "zh-TW", query: await searchParams });
}
