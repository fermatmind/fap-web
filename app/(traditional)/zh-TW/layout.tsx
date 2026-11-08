import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";
import "../../globals.css";
import styles from "./Traditional.module.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "費馬測試 — 繁體中文", template: "%s | 費馬測試" },
  robots: isConfiguredStagingSiteUrl() ? { index: false, follow: false } : undefined,
};
export default function TraditionalLayout({ children }: { children: React.ReactNode }) {
  return <html lang="zh-TW"><body className={styles.body}>
    <header className="border-b border-slate-200 bg-white"><nav aria-label="主要導覽" className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-5 py-4">
      <Link href="/zh-TW" className="min-h-11 py-2 text-xl font-bold">費馬測試</Link>
      <Link href="/zh-TW/tests" className="min-h-11 py-2 underline">繁體中文測評</Link>
    </nav></header>
    <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-8 sm:py-12">{children}</main>
    <footer className="mx-auto max-w-4xl space-y-3 border-t border-slate-200 px-5 py-6 text-sm leading-7">
      <p>目前繁體中文提供關於費馬測試、吉伊卡哇及七宗罪與七美德測試、結果與公開指南。其他內容請使用原語入口。</p>
      <Link href="/zh-TW/about" className="inline-flex min-h-11 items-center py-2 underline">關於費馬測試</Link>
      <nav aria-label="其他語言內容" className="flex flex-wrap gap-5"><Link href="/" lang="zh-CN" className="min-h-11 py-2 underline">简体中文全站</Link><Link href="/en" lang="en" className="min-h-11 py-2 underline">English website</Link></nav>
    </footer>
  </body></html>;
}
