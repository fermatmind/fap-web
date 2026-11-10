import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CareerIndustryDetailPage from "@/app/(localized)/[locale]/career/industries/[slug]/page";
import { CAREER_DATASET_FAMILY_SLUGS, formatCareerFamilyTitle } from "@/lib/career/datasetDirectory";
import { loadTraditionalDirectoryLanguage } from "@/lib/career/traditionalDirectory";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function requireSlug(params: Props["params"]) {
  const { slug } = await params;
  if (!CAREER_DATASET_FAMILY_SLUGS.includes(slug)) notFound();
  return slug;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = await requireSlug(params);
  const { display } = await loadTraditionalDirectoryLanguage();
  const title = display(formatCareerFamilyTitle(slug, "zh"));
  return {
    title: `${title}職業目錄`,
    description: `瀏覽${title}的職業，查看實際工作任務與資料來源。`,
    alternates: { canonical: `/zh-TW/career/industries/${slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function TraditionalIndustryDetailPage({ params, searchParams }: Props) {
  const slug = await requireSlug(params);
  return <>
    <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
      <Link href={`/zh/career/industries/${slug}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={`/en/career/industries/${slug}`} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <CareerIndustryDetailPage params={Promise.resolve({ locale: "zh-TW", slug })} searchParams={searchParams} />
  </>;
}
