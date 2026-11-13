import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";
import { ResultEmailLookupForm } from "@/components/support/ResultEmailLookupForm";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  title: "找回測驗結果",
  description: "使用電子郵件找回已儲存的測驗結果。",
  robots: NOINDEX_ROBOTS,
  referrer: "no-referrer",
  alternates: { canonical: "/zh-TW/results/lookup" },
};

export default function TraditionalResultLookupPage() {
  return <Container as="main" className="max-w-2xl space-y-4 py-10">
    <h1 className="m-0 text-2xl font-bold text-slate-900">找回測驗結果</h1>
    <ResultEmailLookupForm locale="zh-TW" />
    <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/results/lookup" lang="zh-CN" prefetch={false} className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/results/lookup" lang="en" prefetch={false} className="min-h-11 py-2 underline">English</Link>
    </nav>
  </Container>;
}
