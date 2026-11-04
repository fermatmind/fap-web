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
import { StoryTakeEntry } from "./StoryTakeEntry";
import { coffeeBreakSections, coffeeBreakFaq } from "./CoffeeBreakEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#coffee-break-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CoffeeBreakPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "coffee-break") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/coffee-break`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创小憩选择情境 · 完整画像免费" : "Original coffee-break scenes · Full portraits free"}</span></div>
      <StoryTakeEntry quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined short-break scene, choose a different setting, a small sensory ritual or easy company. Finish six choices for all three counts and every highest tie. No drink, purchase, outdoor task or saved progress is required.", zh: "每个虚构小憩场景，选择换个背景、感官小仪式或轻松作伴。六题完成后查看三项次数与全部最高并列。无需饮品、消费、户外任务或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{coffeeBreakSections[0].title[locale]}</h2>{coffeeBreakSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="coffee-break-methods"><h2 id="coffee-break-methods">{zh ? "三种小憩偏好、短休息研究与结果读法" : "Three break preferences, short-break research and result readings"}</h2><div className="explore-reading-sections">{coffeeBreakSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`coffee-break-${s.id}`}><h3 id={`coffee-break-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种小憩方式画像：完整公开指南" : "Three break-preference portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "小憩方式测试常见问题" : "Coffee Break Style Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...coffeeBreakFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="coffee-break-references"><h2 id="coffee-break-references" className="text-xl font-semibold">{zh ? "短休息研究与方法背景" : "Short-break research and method background"}</h2><ol className="mt-4 space-y-2"><li id="coffee-break-reference-1"><a className="underline" rel="noopener noreferrer" href="https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0272460">{zh ? "1. Albulescu等（2022）：短休息对精力、疲劳与表现的系统综述及元分析" : "1. Albulescu et al. (2022): micro-breaks, well-being and performance — systematic review and meta-analysis"}</a></li><li id="coffee-break-reference-2"><a className="underline" rel="noopener noreferrer" href="https://ggia.berkeley.edu/practice/savoring_walk">{zh ? "2. Greater Good in Action：品味散步活动流程" : "2. Greater Good in Action: Savoring Walk practice"}</a></li><li id="coffee-break-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.hse.gov.uk/msd/dse/work-routine.htm">{zh ? "3. 英国HSE：显示屏工作的工作安排与休息指导" : "3. UK HSE: work routine and breaks for display-screen work"}</a></li></ol></section>
  </Container></main>;
}
