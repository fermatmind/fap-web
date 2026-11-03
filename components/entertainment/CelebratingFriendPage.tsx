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
import { celebratingFriendSections, celebratingFriendFaq } from "./CelebratingFriendEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#celebrating-a-friend-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function CelebratingFriendPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "celebrating-a-friend") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/celebrating-a-friend`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创报喜回应情境 · 完整画像免费" : "Original good-news response scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined good-news scene, choose listening, a personal note or invited company. There are no right answers. Finish six questions for all counts and highest ties; no friend’s name, private messages or saving choice is required.", zh: "每个虚构报喜场景，选择倾听、个人小笺或受邀作伴。没有标准答案。六题完成后查看全部次数与最高并列；无需朋友姓名、私人信息或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{celebratingFriendSections[0].title[locale]}</h2>{celebratingFriendSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="celebrating-a-friend-methods"><h2 id="celebrating-a-friend-methods">{zh ? "回应形式、研究背景与结果读法" : "Response formats, research background and result readings"}</h2><div className="explore-reading-sections">{celebratingFriendSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`celebrating-a-friend-${s.id}`}><h3 id={`celebrating-a-friend-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种报喜回应画像：完整公开指南" : "Three good-news response portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "回应朋友好消息测试常见问题" : "Friend’s good-news quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...celebratingFriendFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="celebrating-a-friend-references"><h2 id="celebrating-a-friend-references" className="text-xl font-semibold">{zh ? "积极事件分享研究与回应练习资料" : "Positive-event sharing research and response practices"}</h2><ol className="mt-4 space-y-2"><li id="celebrating-a-friend-reference-1"><a className="underline" rel="noopener noreferrer" href="https://www.sas.rochester.edu/psy/people/faculty/reis_harry/assets/pdf/GableReisImpettAsher_2004.pdf">{zh ? "1. Gable等（2004）：积极事件分享原始研究" : "1. Gable et al. (2004): What Do You Do When Things Go Right?"}</a></li><li id="celebrating-a-friend-reference-2"><a className="underline" rel="noopener noreferrer" href="https://pubmed.ncbi.nlm.nih.gov/17059309/">{zh ? "2. Gable等（2006）：积极事件回应研究摘要" : "2. Gable et al. (2006): supportive responses study abstract"}</a></li><li id="celebrating-a-friend-reference-3"><a className="underline" rel="noopener noreferrer" href="https://ggia.berkeley.edu/practice/capitalizing_on_positive_events">{zh ? "3. Greater Good in Action：回应积极事件练习" : "3. Greater Good in Action: Capitalizing on Positive Events"}</a></li></ol></section>
  </Container></main>;
}
