import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHANGAN_SLUG, traditionalFirstChoiceRule } from "@/lib/entertainment/changan";
import { GLOBAL_HISTORY_PATH } from "@/lib/entertainment/global-history/config";
import { quizPath, resultPath } from "@/lib/entertainment/guides";
import { loadTraditionalChangan } from "@/lib/i18n/zh-TW/changan";

const path = quizPath("zh-TW", CHANGAN_SLUG);

export async function generateMetadata(): Promise<Metadata> {
  const quiz = await loadTraditionalChangan();
  if (!quiz) notFound();
  const title = quiz.seo.title.zh;
  const description = quiz.seo.description.zh;
  return {
    title, description,
    alternates: { canonical: path },
    robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", url: path },
  };
}

export default async function TraditionalChanganLanding() {
  const quiz = await loadTraditionalChangan();
  if (!quiz) notFound();
  return <section className="mx-auto max-w-3xl space-y-6">
    <nav aria-label="測驗語言與導覽" className="flex flex-wrap gap-4 text-sm">
      <Link href="/zh-TW/tests/play" className="min-h-11 py-2 underline">互動故事測驗</Link>
      <Link href={quizPath("zh", CHANGAN_SLUG)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={quizPath("en", CHANGAN_SLUG)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <header className="space-y-3">
      <p className="font-semibold">原創娛樂測驗 · 完整結果免費</p>
      <h1 className="text-3xl font-bold sm:text-4xl">{quiz.title.zh}</h1>
      <p className="leading-8">{quiz.seo.description.zh}</p>
      <p>{quiz.questions.length} 題 · 約 {quiz.minutes} 分鐘 · 免註冊</p>
      <p className="leading-8">{quiz.introduction.zh}</p>
      <Link href={`${path}/take`} className="inline-block min-h-11 rounded-full bg-slate-900 px-6 py-3 font-semibold text-white">開始長安卷</Link>
    </header>
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">這次探索什麼？</h2>
      <p>{quiz.focus.zh}</p>
      <Link href={`/zh-TW${GLOBAL_HISTORY_PATH}`} className="inline-block min-h-11 py-2 underline">想遇見更多人物？去玩全球卷</Link>
    </section>
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">結果如何產生？</h2>
      <p>{traditionalFirstChoiceRule}</p>
      <p>答案在瀏覽器內計分。完成後會出現一位人物，可下載只含公開人物內容的 PNG 卡片。</p>
    </section>
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">六位人物的公開指南</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {quiz.results.map((result) => <li key={result.id} className="rounded-lg border border-slate-200 p-4">
          <Link href={resultPath("zh-TW", quiz.slug, result.id)} className="inline-block min-h-11 py-2 font-semibold underline">
            閱讀「{result.title.zh}」完整指南
          </Link>
          <p>{result.summary.zh}</p>
        </li>)}
      </ul>
    </section>
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">常見問題</h2>
      <h3 className="font-semibold">{quiz.seo.faq.question.zh}</h3>
      <p>{quiz.seo.faq.answer.zh}</p>
      <h3 className="font-semibold">有幾種結果？</h3>
      <p>六位歷史人物各有一張插畫人物卡與一份公開指南。每次作答只會顯示一位人物。</p>
    </section>
  </section>;
}
