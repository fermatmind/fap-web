import type { Metadata } from "next";
import Link from "next/link";
import CareerIndustriesPage from "@/app/(localized)/[locale]/career/industries/page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "職涯產業目錄",
  description: "按產業瀏覽目前公開的職業資料與職業詳情。",
  alternates: { canonical: "/zh-TW/career/industries" },
  robots: { index: false, follow: true },
};

export default function TraditionalCareerIndustriesPage() {
  return <>
    <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
      <Link href="/zh/career/industries" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/career/industries" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <CareerIndustriesPage params={Promise.resolve({ locale: "zh-TW" })} />
  </>;
}
