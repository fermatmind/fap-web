import type { Metadata } from "next";
import Link from "next/link";
import { MbtiPricingDetails, mbtiPricingCopy } from "@/components/commerce/MbtiPricing";

const copy = mbtiPricingCopy("zh-TW");
export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  robots: { index: false, follow: true },
  alternates: { canonical: "/zh-TW/pricing" },
};

export default function TraditionalPricingPage() {
  return <section className="space-y-8">
    <MbtiPricingDetails locale="zh-TW" />
    <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/pricing" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/pricing" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
  </section>;
}
