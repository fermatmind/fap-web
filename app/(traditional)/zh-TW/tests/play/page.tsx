import type { Metadata } from "next";
import Link from "next/link";
import { FRIENDSHIP_PATH } from "@/lib/friendship/routes";
import { CHANGAN_SLUG } from "@/lib/entertainment/changan";
import { quizPath } from "@/lib/entertainment/guides";
import { hasTraditionalBespokeStory, traditionalLegacyStorySlugs, traditionalBespokeStorySlugs } from "@/lib/i18n/traditionalLegacyStoryPaths";
import { traditionalLegacyStoryTitle } from "@/lib/i18n/zh-TW/legacyStories";
import { traditionalChanganTitle } from "@/lib/i18n/zh-TW/changan";
import { traditionalBespokeStoryTitle } from "@/lib/i18n/zh-TW/bespokeStories";

export const metadata: Metadata = {
  title: "互動故事測驗",
  description: "從生活情境、虛構故事和想像角色中挑選一項免費測驗。",
  alternates: { canonical: "/zh-TW/tests/play" },
  robots: { index: false, follow: true },
};

export default function TraditionalLegacyStoriesPage() {
  return <section className="space-y-5">
    <Link href="/zh-TW/tests#interactive-stories" className="inline-block min-h-11 py-2 underline">返回全部測驗</Link>
    <h1 className="text-3xl font-bold sm:text-4xl">互動故事測驗</h1>
    <p className="leading-7">選擇想玩的故事，完成後可閱讀所有公開結果指南。</p>
    <ul className="grid gap-3 sm:grid-cols-2">
      <li><Link href={`/zh-TW${FRIENDSHIP_PATH}`} className="block min-h-11 rounded-xl border border-slate-200 p-4 underline">朋友默契測驗</Link></li>
      {[CHANGAN_SLUG, ...traditionalBespokeStorySlugs, ...traditionalLegacyStorySlugs].map((slug) => <li key={slug}>
        <Link href={quizPath("zh-TW", slug)} prefetch={false} className="block min-h-11 rounded-xl border border-slate-200 p-4 underline">
          {slug === CHANGAN_SLUG ? traditionalChanganTitle : hasTraditionalBespokeStory(slug) ? traditionalBespokeStoryTitle(slug) : traditionalLegacyStoryTitle(slug)}
        </Link>
      </li>)}
    </ul>
  </section>;
}
