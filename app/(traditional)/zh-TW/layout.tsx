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
  return <html lang="zh-TW"><body className={styles.body}>
    <header className="border-b border-slate-200 bg-white"><nav aria-label="主要導覽" className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-4">
      <Link href="/zh-TW" className="min-h-11 py-2 text-xl font-bold">{dict.header.brand}</Link>
      <Link href="/zh-TW/tests" className="min-h-11 py-2 underline">繁體中文測評</Link>
    </nav></header>
    <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-8 sm:py-12">{children}</main>
    <footer className="mx-auto max-w-4xl space-y-3 border-t border-slate-200 px-5 py-6 text-sm leading-7">
      <p>瀏覽費馬測試的繁體中文品牌資訊、政策、支援說明，以及吉伊卡哇、七宗罪與七美德測試。</p>
      <nav aria-label="費馬資訊" className="flex flex-wrap gap-x-5 gap-y-1">
        <Link href="/zh-TW/about" className="inline-flex min-h-11 items-center py-2 underline">關於費馬測試</Link>
        <Link href="/zh-TW/brand" className="inline-flex min-h-11 items-center py-2 underline">品牌規範</Link>
        <Link href="/zh-TW/charter" className="inline-flex min-h-11 items-center py-2 underline">我們的憲章</Link>
        <Link href="/zh-TW/careers" className="inline-flex min-h-11 items-center py-2 underline">工作機會</Link>
        <Link href="/zh-TW/privacy" className="inline-flex min-h-11 items-center py-2 underline">隱私政策</Link>
        <Link href="/zh-TW/terms" className="inline-flex min-h-11 items-center py-2 underline">使用條款</Link>
        <Link href="/zh-TW/method-boundaries" className="inline-flex min-h-11 items-center py-2 underline">方法邊界</Link>
        <Link href="/zh-TW/science" className="inline-flex min-h-11 items-center py-2 underline">測評科學</Link>
        <Link href="/zh-TW/help/contact" className="inline-flex min-h-11 items-center py-2 underline">聯絡支援</Link>
        <Link href="/zh-TW/foundation" className="inline-flex min-h-11 items-center py-2 underline">公益捐贈計畫</Link>
        <Link href="/zh-TW/policies" className="inline-flex min-h-11 items-center py-2 underline">政策總覽</Link>
        <Link href="/zh-TW/help/faq" className="inline-flex min-h-11 items-center py-2 underline">常見問題</Link>
        <Link href="/zh-TW/help/about" className="inline-flex min-h-11 items-center py-2 underline">關於 FermatMind</Link>
        <Link href="/zh-TW/help/team" className="inline-flex min-h-11 items-center py-2 underline">團隊介紹</Link>
        <Link href="/zh-TW/help/used-and-mentioned" className="inline-flex min-h-11 items-center py-2 underline">使用和提及</Link>
        <Link href="/zh-TW/help/for-business-and-research" className="inline-flex min-h-11 items-center py-2 underline">企業與研究</Link>
      </nav>
      <nav aria-label="其他語言內容" className="flex flex-wrap gap-5"><Link href="/" lang="zh-CN" className="min-h-11 py-2 underline">简体中文全站</Link><Link href="/en" lang="en" className="min-h-11 py-2 underline">English website</Link></nav>
    </footer>
  </body></html>;
}
