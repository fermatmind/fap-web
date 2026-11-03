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
import { gardenSeasonSections, gardenSeasonFaq } from "./GardenSeasonEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#garden-season-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function GardenSeasonPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "garden-season") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/garden-season`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创想象花园情境 · 完整画像免费" : "Original garden scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "Imagine each garden scene and choose the kind of attention you would enjoy giving it now. There are no correct answers or planting tasks. Complete all six to read the three counts and every highest full portrait.", zh: "想象每个花园场景，选择此刻愿意给它的关注方式。没有正确答案，也不需实际种植。答完六题查看三项次数与全部最高完整画像。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{gardenSeasonSections[0].title[locale]}</h2>{gardenSeasonSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="garden-season-methods"><h2 id="garden-season-methods">{zh ? "春、夏与冬的故事意象：计分及完整读法" : "Spring, summer and winter imagery: counts and complete readings"}</h2><div className="explore-reading-sections">{gardenSeasonSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`garden-season-${s.id}`}><h3 id={`garden-season-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种想象花园：完整公开指南" : "Three imaginary gardens: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与可选小尝试。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and optional experiment. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "想象花园季节测试常见问题" : "Imaginary Garden Season Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...gardenSeasonFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="garden-season-references"><h2 id="garden-season-references" className="text-xl font-semibold">{zh ? "植物过程、气候季节与物候观察背景" : "Plant processes, climate seasons and phenological observation"}</h2><ol className="mt-4 space-y-2"><li id="garden-season-reference-1"><a className="underline" rel="noopener noreferrer" href="https://content.ces.ncsu.edu/preparing-nursery-plants-for-winter">{zh ? "1. NC State Extension：木本苗圃作物的休眠与越冬背景" : "1. NC State Extension: dormancy and winter acclimation in nursery plants"}</a></li><li id="garden-season-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.weather.gov.sg/climate-climate-of-singapore/">{zh ? "2. 新加坡气象部门：赤道气候与季风季节" : "2. Meteorological Service Singapore: equatorial climate and monsoon seasons"}</a></li><li id="garden-season-reference-3"><a className="underline" rel="noopener noreferrer" href="https://extension.umaine.edu/signs-of-the-seasons/volunteers-field-guide/introduction/">{zh ? "3. University of Maine：物候观察野外指南导言" : "3. University of Maine: introduction to phenological field observation"}</a></li></ol></section>
  </Container></main>;
}
