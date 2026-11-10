import Link from "next/link";
import { globalHistoryPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";

export function GlobalHistoryLocaleLinks({ portraitId }: { portraitId?: string }) {
  return <nav aria-label="頁面語言" className="flex flex-wrap gap-4 text-sm">
    <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
    <Link prefetch={false} href={portraitId ? globalHistoryResultPath("zh", portraitId) : globalHistoryPath("zh")} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
    <Link prefetch={false} href={portraitId ? globalHistoryResultPath("en", portraitId) : globalHistoryPath("en")} lang="en" className="min-h-11 py-2 underline">English</Link>
  </nav>;
}
