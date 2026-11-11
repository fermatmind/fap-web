import { traditionalDirectionalRoute } from "@/lib/i18n/traditionalDirectionalPaths";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CHANGAN_SLUG, changanPortraitPath, traditionalFirstChoiceRule } from "@/lib/entertainment/changan";
import { contentImagePath, findPublicPortrait, portraitDescription, portraitRuleExample, quizPath, resultPath } from "@/lib/entertainment/guides";
import { requireTraditionalStoryQuiz } from "@/lib/i18n/zh-TW/legacyStoryReader";

type Props = { params: Promise<{ slug: string; portrait: string }> };
const sections = [
  ["example", "具體情境"],
  ["strength", "這種選擇的好處"],
  ["tradeoff", "值得留意的取捨"],
  ["experiment", "一次可選的小嘗試"],
] as const;

async function loadPortrait(params: Props["params"]) {
  const { slug, portrait } = await params;
  const quiz = await requireTraditionalStoryQuiz(slug);
  const result = findPublicPortrait(quiz, portrait);
  if (!result) notFound();
  return { quiz, result };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}/results/${(await params).portrait}`);
  if (directional) {
    const { traditionalLikertMetadata } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return traditionalLikertMetadata(directional);
  }
  const { quiz, result } = await loadPortrait(params);
  const title = `${result.title.zh} · ${quiz.seo.topic.zh}`;
  const description = portraitDescription(result, "zh");
  const url = resultPath("zh-TW", quiz.slug, result.id);
  return {
    title, description,
    alternates: { canonical: url },
    robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", url, images: [contentImagePath(quiz, "zh-TW", result.id)] },
  };
}

export default async function TraditionalStoryPortraitPage({ params }: Props) {
  const directional = traditionalDirectionalRoute(`/tests/play/${(await params).slug}/results/${(await params).portrait}`);
  if (directional) {
    const { LikertQuestionnairePage } = await import("@/components/i18n/zh-TW/LikertQuestionnairePage");
    return <LikertQuestionnairePage {...directional} />;
  }
  const { quiz, result } = await loadPortrait(params);
  const path = quizPath("zh-TW", quiz.slug);
  const branch = quiz.mechanism === "branch";
  const changan = quiz.slug === CHANGAN_SLUG;
  return <div className="mx-auto max-w-3xl space-y-7" data-story-guide={quiz.mechanism}>
    <nav aria-label="指南語言" className="flex flex-wrap gap-4 text-sm">
      <Link href={path} className="min-h-11 py-2 underline">{quiz.seo.topic.zh}</Link>
      <Link href={resultPath("zh", quiz.slug, result.id)} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={resultPath("en", quiz.slug, result.id)} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <header className="space-y-3">
      <p className="font-semibold">{branch ? "故事結局 · 完整公開指南" : "原創人物側寫 · 完整公開指南"}</p>
      <h1 className="text-3xl font-bold sm:text-4xl">{result.title.zh}</h1>
      {changan ? <Image src={changanPortraitPath(result.id)} width={720} height={720} className="w-full max-w-64 rounded-lg" unoptimized alt={`${result.title.zh}的原創插畫`} /> : null}
      <p className="text-lg leading-8">{result.summary.zh}</p>
      <p>這份公開指南供所有讀者閱讀，個人答卷只留在本次測驗。</p>
      <Link href={`${path}/take?start=1`} className="inline-block min-h-11 py-2 underline">免費體驗本測驗</Link>
      {changan ? <a href={`${contentImagePath(quiz, "zh-TW", result.id)}&download=1`} className="inline-block min-h-11 px-4 py-2 underline">下載人物卡 PNG</a> : null}
    </header>
    <article className="space-y-6">
      {changan && result.history ? <section className="space-y-2">
        <h2 className="text-xl font-semibold">史料與作品</h2>
        <p>{result.history.note.zh} <a href={result.history.url} className="underline">{result.history.label.zh}</a></p>
      </section> : null}
      {sections.map(([field, title]) => <section key={field} id={field} className="space-y-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="whitespace-pre-line leading-8">{result[field].zh}</p>
      </section>)}
      <section className="space-y-3" id="comparison">
        <h2 className="text-xl font-semibold">比較其他人物側寫</h2>
        <p>{quiz.focus.zh}</p>
        <p>可以按各人物在故事中的貢獻做對照，理解不同選擇適合什麼情境。</p>
        <dl className="space-y-4">{quiz.results.map((other) => <div key={other.id}>
          <dt className="font-semibold">{other.id === result.id ? other.title.zh :
            <Link href={resultPath("zh-TW", quiz.slug, other.id)} className="inline-block min-h-11 py-2 underline">{other.title.zh}</Link>}
          </dt>
          <dd>{other.strength.zh}</dd>
        </div>)}</dl>
      </section>
      <section className="space-y-3" id="rules">
        <h2 className="text-xl font-semibold">結果如何產生</h2>
        <p>{changan ? traditionalFirstChoiceRule : branch
          ? "每個選擇沿寫好的故事分支前進，相同路線會到達同一結局。下方展示一條可到達這個結局的公開路線。"
          : "選擇依題本規則累計分數，所有最高分的人物側寫都會顯示。下方是公開規則範例，單一選項只是其中一部分。"}</p>
        <details className="rounded-lg bg-slate-50 p-4">
          <summary className="cursor-pointer font-semibold">查看公開規則範例</summary>
          <ol className="mt-3 list-decimal space-y-3 pl-5">{portraitRuleExample(quiz, result.id).map((example, index) => <li key={index}>
            <p>{example.question.zh}</p><p>{example.choice.zh}</p>
          </li>)}</ol>
        </details>
      </section>
      <section className="space-y-3" id="faq">
        <h2 className="text-xl font-semibold">常見問題</h2>
        <h3 className="font-semibold">{quiz.seo.faq.question.zh}</h3>
        <p>{quiz.seo.faq.answer.zh}</p>
        <h3 className="font-semibold">看到另一份側寫也像自己，怎麼辦？</h3>
        <p>{changan ? "可以在不同情境中看見自己選擇的不同面向。每次遊戲按六題作答選出一位人物，閱讀其他指南不會改變結果。" : branch ? "可以欣賞不同結局。一次作答沿所選路線到達一個結局，閱讀其他指南不會改變原有路線。"
          : "可以對照不同情境閱讀。相同最高計數會一起顯示，閱讀其他指南不會改變本次作答的計分。"}</p>
        <h3 className="font-semibold">這能告訴我 MBTI 類型或適合的職業嗎？</h3>
        <p>這是原創娛樂內容，結果無法換算為人格類型、能力、心理診斷或職涯適配。你可以另外查閱各測驗的用途與題本。</p>
      </section>
    </article>
    <Link href={path} className="inline-block min-h-11 py-2 underline">返回測驗介紹</Link>
  </div>;
}
