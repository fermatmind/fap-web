import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { traditionalBespokeEditorial } from "@/lib/i18n/zh-TW/bespokeStories";
import { StoryTakeEntry } from "./StoryTakeEntry";
import { gameNightResetSections, gameNightResetFaq } from "./GameNightResetEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#game-night-reset-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function GameNightResetPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "game-night-reset") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/game-night-reset`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: gameNightResetSections, faq: gameNightResetFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("6题 · 约2分钟 · 无需注册", "6 choices · About 2 minutes · No registration", "6題 · 約2分鐘 · 無需註冊")}</span><span>{text("原创休闲游戏情境 · 完整画像免费", "Original game-night scenes · Full portraits free", "原創休閒遊戲情境 · 完整人物側寫免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Imagine a friendly game where someone says the current round is no longer enjoyable. Choose the next response you would lean toward, rather than an ideal answer. Complete all six to read the counts and every highest full portrait.", zh: traditional ? "想像友好遊戲裡有人說這一輪不太好玩，選擇自己較傾向的下一步，不必尋找理想答案。答完六題檢視次數與全部最高完整人物側寫。" : "想象友好游戏里有人说这一轮不太好玩，选择自己较倾向的下一步，不必寻找理想答案。答完六题查看次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="game-night-reset-methods"><h2 id="game-night-reset-methods">{text("询问、有限调整与清楚结束：计分及完整读法", "Check-in, bounded change and a clear finish: counts and complete readings", "詢問、有限調整與清楚結束：計分及完整讀法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`game-night-reset-${s.id}`}><h3 id={`game-night-reset-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种游戏夜重排方式：完整公开指南", "Three game-night resets: complete public guides", "三種遊戲夜重排方式：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。", "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait.", "每篇都有完整人物側寫、日常例子、取捨與可選小嚐試。這些是公開的原創說明，不是訪客私人作答；三種均可直接閱讀，並列時保留所有最高人物側寫。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("游戏夜调整方式测试常见问题", "Game Night Reset Quiz: frequently asked questions", "遊戲夜調整方式測驗常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="game-night-reset-references"><h2 id="game-night-reset-references" className="text-xl font-semibold">{text("游戏动机研究与具体玩法背景", "Game-motivation research and format context", "遊戲動機研究與具體玩法背景")}</h2><ol className="mt-4 space-y-2"><li id="game-night-reset-reference-1"><a className="underline" rel="noopener noreferrer" href="https://selfdeterminationtheory.org/SDT/documents/2006_RyanRigbyPrzybylski_MandE.pdf">{text("1. Ryan、Rigby与Przybylski（2006）：电脑游戏动机研究", "1. Ryan, Rigby and Przybylski (2006): motivation in computer games", "1. Ryan、Rigby與Przybylski（2006）：電腦遊戲動機研究")}</a></li><li id="game-night-reset-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.asmodeeaccess.com/fr/game/dixit/">{text("2. Asmodee access+：Dixit的具体适配说明", "2. Asmodee access+: adaptations for Dixit", "2. Asmodee access+：Dixit的具體適配說明")}</a></li><li id="game-night-reset-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.wavelength.zone/app/faq">{text("3. Wavelength：应用与桌游形式、讨论及回合说明", "3. Wavelength: app and tabletop formats, discussion and rounds", "3. Wavelength：應用與桌遊形式、討論及回合說明")}</a></li></ol></section>
  </Container></Surface>;
}
