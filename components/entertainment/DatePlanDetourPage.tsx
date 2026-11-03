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
import { datePlanDetourSections, datePlanDetourFaq } from "./DatePlanDetourEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#date-plan-detour-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DatePlanDetourPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "date-plan-detour") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/date-plan-detour`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创共同外出情境 · 完整画像免费" : "Original shared-outing scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined outing change, choose what you would preserve, recheck or offer as a small alternative. Both people can choose again or end the visit. Finish six choices for all counts and highest ties. No partner response, real date or saved progress is required.", zh: "每个虚构外出变化情境，选择会保留什么、重新问什么或提出怎样的小替代。双方都可重新选或结束到访。六题完成后查看全部次数与最高并列。无需伴侣回复、真实约会或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{datePlanDetourSections[0].title[locale]}</h2>{datePlanDetourSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="date-plan-detour-methods"><h2 id="date-plan-detour-methods">{zh ? "三种协调动作、共同选择与结果读法" : "Three coordination moves, shared choices and result readings"}</h2><div className="explore-reading-sections">{datePlanDetourSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`date-plan-detour-${s.id}`}><h3 id={`date-plan-detour-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种共同出游调整画像：完整公开指南" : "Three shared-outing portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "共同出游改计划测试常见问题" : "Shared Outing Detour Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...datePlanDetourFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="date-plan-detour-references"><h2 id="date-plan-detour-references" className="text-xl font-semibold">{zh ? "协商、沟通与共同活动研究参考" : "Compromise, communication and shared-activity research references"}</h2><ol className="mt-4 space-y-2"><li id="date-plan-detour-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.gottman.com/blog/why-cant-we-compromise/">{zh ? "1. Gottman：重要需要与可调整部分的协商指导" : "1. Gottman: guidance on core needs and flexible aspects"}</a></li><li id="date-plan-detour-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.relationships.org.au/document/communication/">{zh ? "2. Relationships Australia：沟通与理解核对" : "2. Relationships Australia: communication and checking understanding"}</a></li><li id="date-plan-detour-reference-3"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/10707334/">{zh ? "3. Aron等（2000）：共同新颖活动与关系体验研究" : "3. Aron et al. (2000): shared novel activities and experienced relationship quality"}</a></li></ol></section>
  </Container></main>;
}
