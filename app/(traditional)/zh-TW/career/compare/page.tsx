import type { Metadata } from "next";
import Link from "next/link";
import CareerComparePage from "@/app/(localized)/[locale]/career/compare/page";

export const metadata: Metadata = {
  title: "比較兩個職業",
  description: "並排核對設計職業的工作任務、環境、技能與資格範圍。",
  alternates: { canonical: "/zh-TW/career/compare" },
  robots: { index: false, follow: true },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function TraditionalCareerComparePage({ searchParams }: Props) {
  return <>
    <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
      <Link href="/zh/career/compare" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/career/compare" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <CareerComparePage params={Promise.resolve({ locale: "zh-TW" })} searchParams={searchParams} />
  </>;
}
