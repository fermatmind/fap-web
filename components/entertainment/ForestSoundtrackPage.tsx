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
import { forestSoundtrackSections, forestSoundtrackFaq } from "./ForestSoundtrackEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#forest-soundtrack-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function ForestSoundtrackPage({ quiz, locale, displayLocale = locale }: { quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "forest-soundtrack") notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = `/${displayLocale}/tests/play/forest-soundtrack`;
  const Surface = traditional ? "div" : "main";
  const original = { sections: forestSoundtrackSections, faq: forestSoundtrackFaq };
  const { sections, faq } = traditional ? traditionalBespokeEditorial(quiz.slug, original) : original;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("每次3至4次选择 · 约2分钟 · 无需注册", "3–4 choices per reading · About 2 minutes · No registration", "每次3至4次選擇 · 約2分鐘 · 無需註冊")}</span><span>{text("原创森林曲子短篇 · 三种完整结局免费", "Original forest-tune tale · Three full endings free", "原創森林曲子短篇 · 三種完整結局免費")}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={{ en: "Read a forest-tune scene and choose one of its two options. Three or four linked choices lead to one full ending; there is no score or need to read every scene. No audio, instrument, microphone access, agreement, saved progress or prior test is required.", zh: traditional ? "閱讀森林曲子場景，從兩個選項選一項。三至四個相連選擇通向一個完整結局，無分數，也無需讀遍每幕。不需音訊、樂器、麥克風訪問、同意頁、儲存進度或先做測驗。" : "阅读森林曲子场景，从两个选项选一项。三至四个相连选择通向一个完整结局，无分数，也无需读遍每幕。不需音频、乐器、麦克风访问、同意页、保存进度或先做测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="forest-soundtrack-methods"><h2 id="forest-soundtrack-methods">{text("回声、纸鸟合奏与留白：结局及分支阅读方法", "Echo, paper-bird chorus and an open beat: endings and branching", "回聲、紙鳥合奏與留白：結局及分支閱讀方法")}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`forest-soundtrack-${s.id}`}><h3 id={`forest-soundtrack-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{text("三种森林末音结局：完整公开指南", "Three forest-tune endings: complete public guides", "三種森林末音結局：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。", "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending.", "每篇均有完整結局說明、日常例子、取捨與閱讀提示。這些是公開原創指南，不是訪客私人選擇；三篇均可直接閱讀，每次完成路線只得到一個結局。")}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{text("森林末音分支故事常见问题", "Forest Soundtrack Branching Story: frequently asked questions", "森林末音分支故事常見問題")}</h2>{[quiz.seo.faq,...faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="forest-soundtrack-references"><h2 id="forest-soundtrack-references" className="text-xl font-semibold">{text("分支叙事、音乐结构与集体实践参考", "Branching narrative, musical form and collective practice references", "分支敘事、音樂結構與集體實踐參考")}</h2><ol className="mt-4 space-y-2"><li id="forest-soundtrack-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.inklestudios.com/ink/web-tutorial/">{text("1. Inkle：选择与相连叙事段落的入门教程", "1. Inkle: introductory choices and linked narrative sections", "1. Inkle：選擇與相連敘事段落的入門教程")}</a></li><li id="forest-soundtrack-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.open.edu/openlearn/history-the-arts/introduction-music-theory-1-form/content-section-3">{text("2. 英国开放大学：音乐结构中的重复与对比", "2. Open University: repetition and contrast in musical form", "2. 英國開放大學：音樂結構中的重複與對比")}</a></li><li id="forest-soundtrack-reference-3"><a className="underline" rel="noopener noreferrer" href="https://philharmoniedeparis.fr/fr/programmation/ateliers-performances">{text("3. 巴黎爱乐大厅：真实集体工作坊与演出实践", "3. Philharmonie de Paris: collective workshops and performance", "3. 巴黎愛樂大廳：真實集體工作坊與演出實踐")}</a></li></ol></section>
  </Container></Surface>;
}
