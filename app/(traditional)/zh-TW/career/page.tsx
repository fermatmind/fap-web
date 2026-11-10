import type { Metadata } from "next";
import Link from "next/link";
import CareerPage from "@/app/(localized)/[locale]/career/page";
import { isConfiguredStagingSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "職涯資料庫",
  description: "瀏覽 FermatMind 職涯資料庫，按產業篩選，查看已開放的職業詳情。",
  alternates: { canonical: "/zh-TW/career" },
  robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TraditionalCareerDirectory({ searchParams }: Props) {
  return (
    <>
      <nav aria-label="職涯與頁面語言" className="flex flex-wrap gap-5 text-sm">
        <Link href="/zh-TW/career/guides" className="min-h-11 py-2 underline">職涯指南</Link>
        <Link href="/zh/career" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
        <Link href="/en/career" lang="en" className="min-h-11 py-2 underline">English</Link>
      </nav>
      {await CareerPage({ params: Promise.resolve({ locale: "zh-TW" }), searchParams })}
    </>
  );
}
