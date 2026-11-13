import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { OrderLookupForm } from "@/components/support/OrderLookupForm";
import { getDictSync } from "@/lib/i18n/getDict";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata: Metadata = {
  title: "訂單查詢",
  description: "輸入訂單編號與購買時的電子郵件地址，查詢付款和報告交付狀態。",
  robots: NOINDEX_ROBOTS,
  referrer: "no-referrer",
  alternates: { canonical: "/zh-TW/orders/lookup" },
};

export default function TraditionalOrderLookupPage() {
  return <Container as="main" className="max-w-2xl space-y-4 py-10">
    <h1 className="m-0 text-2xl font-bold text-slate-900">查詢訂單</h1>
    <p className="text-sm text-slate-600">輸入訂單編號與購買時的電子郵件地址繼續查詢。付款服務商頁面與部分報告或下載內容可能顯示原語。</p>
    <Suspense fallback={<div aria-hidden="true" className="min-h-64" />}>
      <OrderLookupForm locale="zh" displayLocale="zh-TW" dict={getDictSync("zh-TW")} />
    </Suspense>
    <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/orders/lookup" lang="zh-CN" prefetch={false} className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/orders/lookup" lang="en" prefetch={false} className="min-h-11 py-2 underline">English</Link>
    </nav>
  </Container>;
}
