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
import { dinnerHostSections, dinnerHostFaq } from "./DinnerHostEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#dinner-host-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function DinnerHostPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "dinner-host") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/dinner-host`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创轻松聚餐情境 · 完整画像免费" : "Original casual-dinner scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each imagined casual dinner, choose how you would arrange the flow, guest choices or preparation scale. Think about a fictional evening with people you know, without planning an actual menu. Finish six choices for all counts and highest ties; no cooking, invitation, agreement or saved progress is required.", zh: "每个想象聚餐情境，选择会怎样安排节奏、来客选择或准备规模。想象与熟人的虚构夜晚，无需实际拟菜单。六题完成后查看全部次数与最高并列，无需做饭、发邀请、入口同意或保存进度。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{dinnerHostSections[0].title[locale]}</h2>{dinnerHostSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="dinner-host-methods"><h2 id="dinner-host-methods">{zh ? "三种请客安排、工作量与结果读法" : "Three hosting arrangements, workload and result readings"}</h2><div className="explore-reading-sections">{dinnerHostSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`dinner-host-${s.id}`}><h3 id={`dinner-host-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种轻松聚餐主人画像：完整公开指南" : "Three dinner-host portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "轻松聚餐主人测试常见问题" : "Casual Dinner Host Quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...dinnerHostFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="dinner-host-references"><h2 id="dinner-host-references" className="text-xl font-semibold">{zh ? "聚餐安排与共同用餐研究参考" : "Hosting guidance and social-eating research references"}</h2><ol className="mt-4 space-y-2"><li id="dinner-host-reference-1"><a className="underline" rel="noopener noreferrer" href="https://emilypost.com/advice/party-etiquette-tips-for-hosts-and-guests">{zh ? "1. Emily Post：聚会主人与来客的安排建议" : "1. Emily Post: practical guidance for hosts and guests"}</a></li><li id="dinner-host-reference-2"><a className="underline" rel="noopener noreferrer" href="https://www.foodstandards.gov.scot/consumer-advice/food-safety/food-allergies/cooking-for-people-with-allergies">{zh ? "2. Food Standards Scotland：为有食物过敏的人准备餐食" : "2. Food Standards Scotland: cooking for people with allergies"}</a></li><li id="dinner-host-reference-3"><a className="underline" rel="noopener noreferrer" href="https://link.springer.com/article/10.1007/s40750-017-0061-4">{zh ? "3. Dunbar（2017）：共同用餐的功能研究" : "3. Dunbar (2017): Breaking Bread: the Functions of Social Eating"}</a></li></ol></section>
  </Container></main>;
}
