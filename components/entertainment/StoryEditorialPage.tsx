import catalog from "@/lib/entertainment/catalog.json";
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
import { StoryTakeEntry } from "./StoryTakeEntry";
import { additionalStoryEditorials, type StoryEditorial } from "./AdditionalStoryEditorials";

export function StoryEditorialPage({
  quiz, locale, displayLocale = locale, editorial = additionalStoryEditorials[quiz.slug], displayText = (text) => text,
}: {
  quiz: FunQuiz; locale: Locale; displayLocale?: DisplayLocale; editorial?: StoryEditorial; displayText?: (text: string) => string;
}) {
  if (!editorial) notFound();
  const card = catalog.find(item => item.slug === quiz.slug)!;
  const count = card.minQuestionCount === card.questionCount ? `${card.questionCount}` : `${card.minQuestionCount}–${card.questionCount}`;
  const branch = quiz.mechanism === "branch";
  const four = quiz.results.length === 4;
  const zh = locale === "zh", path = `/${displayLocale}/tests/play/${quiz.slug}`;
  const Surface = displayLocale === "zh-TW" ? "div" : "main";
  function Copy({ text }: { text: string }) {
    return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#${quiz.slug}-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
  }
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {displayLocale !== "zh-TW" && <>
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? displayText("全部测试") : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? displayText(`${count}次选择 · 约${quiz.minutes}分钟 · 无需注册`) : `${count} choices · About ${quiz.minutes} minutes · No registration`}</span><span>{editorial.label[locale]}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} compactLanding landingInstructions={editorial.instructions} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz">
      <h2 id="about-quiz" className="text-2xl font-semibold">{editorial.sections[0].title[locale]}</h2>
      {editorial.sections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p>
    </section>
    <section className="explore-reading-library" aria-labelledby="story-reading-library-title"><h2 id="story-reading-library-title">{branch ? (zh ? displayText("路线、结局与完整阅读说明") : "Routes, endings and complete reading notes") : (zh ? displayText(`${four ? "四" : "三"}种侧重、选择规则与完整读法`) : `${four ? "Four" : "Three"} emphases, choice rules and complete readings`)}</h2><div className="explore-reading-sections">
      {editorial.sections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`story-${s.id}`}><h3 id={`story-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}
    </div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{branch ? (zh ? displayText("三篇完整结局与公开指南") : "Three complete endings and public guides") : (zh ? displayText(`${four ? "四" : "三"}篇完整画像与公开指南`) : `${four ? "Four" : "Three"} complete portraits and public guides`)}</h2>
      <p className="my-4 leading-8">{branch ? (zh ? displayText("每篇保留完整概述、例子、用处、取舍与可选尝试。本次路线到达一篇结局，另外两篇也可直接阅读；公开指南不改变你的路线。") : "Every ending retains its full summary, example, possible benefit, tradeoff and optional experiment. Your route reaches one ending; read the other two directly without changing that route.") : (zh ? displayText("每篇包含完整概述、例子、用处、取舍与可选尝试。可直接阅读全部指南；本次结果会保留并完整显示所有最高并列。") : "Every guide includes its full summary, example, possible benefit, tradeoff and optional experiment. Read all guides directly; your result retains every highest tie in full.")}</p>
      <div className={four ? "grid gap-4 md:grid-cols-2 xl:grid-cols-4" : "grid gap-4 md:grid-cols-3"}>{quiz.results.map(result=><article className="rounded-lg border bg-white p-5" key={result.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(displayLocale,quiz.slug,result.id)}>{result.title[locale]}</Link></h3><p className="mt-2 leading-7">{result.summary[locale]}</p></article>)}</div>
    </section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? displayText("玩法、结果与使用问题") : "Questions about the story, results and use"}</h2>{[quiz.seo.faq,...editorial.faq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="story-references"><h2 id="story-references" className="text-xl font-semibold">{zh ? displayText("情境与实用资料参考") : "Context and practical references"}</h2><ol className="mt-4 space-y-2">{editorial.references.map((ref,i)=><li id={`${quiz.slug}-reference-${i+1}`} key={ref.url}><a className="underline" rel="noopener noreferrer" href={ref.url}>{i+1}. {ref.label[locale]}</a></li>)}</ol></section>
  </Container></Surface>;
}
