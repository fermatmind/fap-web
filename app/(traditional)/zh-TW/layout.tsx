import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";
import { getDictSync } from "@/lib/i18n/getDict";
import "../../globals.css";
import styles from "./Traditional.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "費馬測試 — 繁體中文", template: "%s | 費馬測試" },
  robots: isConfiguredStagingSiteUrl() ? { index: false, follow: false } : undefined,
};
export default function TraditionalLayout({ children }: { children: React.ReactNode }) {
  const dict = getDictSync("zh-TW");
  const navigation = [
    { href: "/zh-TW/tests", label: dict.header.tests },
    { href: "/zh-TW/personality", label: dict.header.personality },
    { href: "/zh-TW/career", label: dict.header.career },
    { href: "/zh-TW/articles", label: dict.header.articles },
    { href: "/zh-TW/topics", label: "專題" },
    { href: "/zh-TW/support", label: "支援中心" },
  ];
  return <html lang="zh-TW"><body className={styles.body}>
    <header className="border-b border-slate-200 bg-white"><nav aria-label="主要導覽" className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-4">
      <Link href="/zh-TW" className="min-h-11 py-2 text-xl font-bold">{dict.header.brand}</Link>
      <div className="flex flex-wrap items-center gap-x-5">
        {navigation.map(({ href, label }) => <Link key={href} href={href} prefetch={false} className="inline-flex min-h-11 items-center py-2 underline">{label}</Link>)}
      </div>
    </nav></header>
    <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-8 sm:py-12">{children}</main>
    <footer className="mx-auto max-w-4xl space-y-3 border-t border-slate-200 px-5 py-6 text-sm leading-7">
      <nav aria-label="費馬資訊" className="flex flex-wrap gap-x-5 gap-y-1">
        <Link href="/zh-TW/about" className="inline-flex min-h-11 items-center py-2 underline">關於費馬測試</Link>
        <Link href="/zh-TW/brand" className="inline-flex min-h-11 items-center py-2 underline">品牌規範</Link>
        <Link href="/zh-TW/charter" className="inline-flex min-h-11 items-center py-2 underline">我們的憲章</Link>
        <Link href="/zh-TW/careers" className="inline-flex min-h-11 items-center py-2 underline">工作機會</Link>
        <Link href="/zh-TW/privacy" className="inline-flex min-h-11 items-center py-2 underline">隱私政策</Link>
        <Link href="/zh-TW/terms" className="inline-flex min-h-11 items-center py-2 underline">使用條款</Link>
        <Link href="/zh-TW/method-boundaries" className="inline-flex min-h-11 items-center py-2 underline">方法邊界</Link>
        <Link href="/zh-TW/science" className="inline-flex min-h-11 items-center py-2 underline">測評科學</Link>
        <Link href="/zh-TW/support" className="inline-flex min-h-11 items-center py-2 underline">支援中心</Link>
        <Link href="/zh-TW/help/contact" className="inline-flex min-h-11 items-center py-2 underline">聯絡支援</Link>
        <Link href="/zh-TW/foundation" className="inline-flex min-h-11 items-center py-2 underline">公益捐贈計畫</Link>
        <Link href="/zh-TW/policies" className="inline-flex min-h-11 items-center py-2 underline">政策總覽</Link>
        <Link href="/zh-TW/help/faq" className="inline-flex min-h-11 items-center py-2 underline">常見問題</Link>
        <Link href="/zh-TW/help/about" className="inline-flex min-h-11 items-center py-2 underline">關於 FermatMind</Link>
        <Link href="/zh-TW/help/team" className="inline-flex min-h-11 items-center py-2 underline">團隊介紹</Link>
        <Link href="/zh-TW/help/used-and-mentioned" className="inline-flex min-h-11 items-center py-2 underline">使用和提及</Link>
        <Link href="/zh-TW/help/for-business-and-research" className="inline-flex min-h-11 items-center py-2 underline">企業與研究</Link>
        <Link href="/zh-TW/common-misconceptions" className="inline-flex min-h-11 items-center py-2 underline">常見迷思</Link>
        <Link href="/zh-TW/data-privacy" className="inline-flex min-h-11 items-center py-2 underline">資料說明</Link>
        <Link href="/zh-TW/help/data-deletion" className="inline-flex min-h-11 items-center py-2 underline">刪除資料與註銷帳號</Link>
        <Link href="/zh-TW/help/payment-refund" className="inline-flex min-h-11 items-center py-2 underline">付款與退款</Link>
        <Link href="/zh-TW/help/privacy-data" className="inline-flex min-h-11 items-center py-2 underline">測試資料與隱私</Link>
        <Link href="/zh-TW/help/result-recovery" className="inline-flex min-h-11 items-center py-2 underline">找回測試結果</Link>
        <Link href="/zh-TW/help/unlock-failure" className="inline-flex min-h-11 items-center py-2 underline">付款後未解鎖報告</Link>
        <Link href="/zh-TW/item-design-notes" className="inline-flex min-h-11 items-center py-2 underline">題目設計說明</Link>
        <Link href="/zh-TW/reliability-validity" className="inline-flex min-h-11 items-center py-2 underline">信度與效度</Link>
      </nav>
      <nav aria-label="其他語言內容" className="flex flex-wrap gap-5"><Link href="/" lang="zh-CN" className="min-h-11 py-2 underline">简体中文全站</Link><Link href="/en" lang="en" className="min-h-11 py-2 underline">English website</Link></nav>
    </footer>
  </body></html>;
}
