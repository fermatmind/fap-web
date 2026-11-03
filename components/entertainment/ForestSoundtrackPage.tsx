import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { FunQuiz } from "@/lib/entertainment/types";
import { resultPath } from "@/lib/entertainment/guides";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { FunQuizClient } from "./FunQuizClient";
import { forestSoundtrackSections, forestSoundtrackFaq } from "./ForestSoundtrackEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#forest-soundtrack-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function ForestSoundtrackPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "forest-soundtrack") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/forest-soundtrack`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "每次3至4次选择 · 约2分钟 · 无需注册" : "3–4 choices per reading · About 2 minutes · No registration"}</span><span>{zh ? "原创森林曲子短篇 · 三种完整结局免费" : "Original forest-tune tale · Three full endings free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Read a forest-tune scene and choose one of its two options. Three or four linked choices lead to one full ending; there is no score or need to read every scene. No audio, instrument, microphone access, agreement, saved progress or prior test is required.", zh: "阅读森林曲子场景，从两个选项选一项。三至四个相连选择通向一个完整结局，无分数，也无需读遍每幕。不需音频、乐器、麦克风访问、同意页、保存进度或先做测试。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{forestSoundtrackSections[0].title[locale]}</h2>{forestSoundtrackSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="forest-soundtrack-methods"><h2 id="forest-soundtrack-methods">{zh ? "回声、纸鸟合奏与留白：结局及分支阅读方法" : "Echo, paper-bird chorus and an open beat: endings and branching"}</h2><div className="explore-reading-sections">{forestSoundtrackSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`forest-soundtrack-${s.id}`}><h3 id={`forest-soundtrack-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种森林末音结局：完整公开指南" : "Three forest-tune endings: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇均有完整结局说明、日常例子、取舍与阅读提示。这些是公开原创指南，不是访客私人选择；三篇均可直接阅读，每次完成路线只得到一个结局。" : "Each guide contains the complete authored ending explanation, everyday example, tradeoff and reading prompt. These are public guides, not visitor choices. Read all three directly; one completed route reaches one ending."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "森林末音分支故事常见问题" : "Forest Soundtrack Branching Story: frequently asked questions"}</h2>{[quiz.seo.faq,...forestSoundtrackFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="forest-soundtrack-references"><h2 id="forest-soundtrack-references" className="text-xl font-semibold">{zh ? "分支叙事、音乐结构与集体实践参考" : "Branching narrative, musical form and collective practice references"}</h2><ol className="mt-4 space-y-2"><li id="forest-soundtrack-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.inklestudios.com/ink/web-tutorial/">{zh ? "1. Inkle：选择与相连叙事段落的入门教程" : "1. Inkle: introductory choices and linked narrative sections"}</a></li><li id="forest-soundtrack-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.open.edu/openlearn/history-the-arts/introduction-music-theory-1-form/content-section-3">{zh ? "2. 英国开放大学：音乐结构中的重复与对比" : "2. Open University: repetition and contrast in musical form"}</a></li><li id="forest-soundtrack-reference-3"><a className="underline" rel="noopener noreferrer" href="https://philharmoniedeparis.fr/fr/programmation/ateliers-performances">{zh ? "3. 巴黎爱乐大厅：真实集体工作坊与演出实践" : "3. Philharmonie de Paris: collective workshops and performance"}</a></li></ol></section>
  </Container></main>;
}
