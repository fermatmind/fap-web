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
import { celebrationPlannerSections, celebrationPlannerFaq } from "./CelebrationPlannerEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#celebration-planner-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CelebrationPlannerPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "celebration-planner") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/celebration-planner`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创小庆祝策划情境 · 完整画像免费" : "Original small-celebration scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined celebration scene, choose a preference check, one shared moment or an optional contribution. Finish all six for the three counts and highest ties. No correct answers, guest list, payment or saving choice is required.", zh: "每个虚构庆祝场景，选择询问意愿、一个共同片刻或自愿贡献。六题完成后查看三项次数与最高并列。没有标准答案，无需宾客名单、付款或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{celebrationPlannerSections[0].title[locale]}</h2>{celebrationPlannerSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="celebration-planner-methods"><h2 id="celebration-planner-methods">{zh ? "策划选择、研究背景与结果读法" : "Planning choices, research background and result readings"}</h2><div className="explore-reading-sections">{celebrationPlannerSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`celebration-planner-${s.id}`}><h3 id={`celebration-planner-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种小庆祝策划画像：完整公开指南" : "Three small-celebration planning portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "小型庆祝策划测试常见问题" : "Small celebration planning quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...celebrationPlannerFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="celebration-planner-references"><h2 id="celebration-planner-references" className="text-xl font-semibold">{zh ? "人际判断研究与活动参与资料" : "Interpersonal judgment research and event participation resources"}</h2><ol className="mt-4 space-y-2"><li id="celebration-planner-reference-1"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/29620401/">{zh ? "1. Eyal等（2018）：通过交流获得他人视角" : "1. Eyal et al. (2018): Perspective Mistaking"}</a></li><li id="celebration-planner-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.gov.uk/government/publications/can-do-guide-for-organisers-of-voluntary-events/the-can-do-guide-to-organising-and-running-voluntary-and-community-events">{zh ? "2. UK Cabinet Office：社区活动策划实务指南" : "2. UK Cabinet Office: planning voluntary and community events"}</a></li><li id="celebration-planner-reference-3"><a className="underline" rel="noopener noreferrer" href="https://www.w3.org/WAI/teach-advocate/accessible-presentations/">{zh ? "3. W3C WAI：可访问活动策划清单" : "3. W3C WAI: Making Events Accessible"}</a></li></ol></section>
  </Container></main>;
}
