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
import { browserTabsSections, browserTabsFaq } from "./BrowserTabsEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((p, i) => /^\[\d+\]$/.test(p) ? <sup key={i}><a className="ml-1 underline" href={`#browser-tabs-reference-${p.slice(1, -1)}`}>{p}</a></sup> : <Fragment key={i}>{p}</Fragment>)}</>;
}
export function BrowserTabsPage({ quiz, locale }: { quiz: FunQuiz; locale: Locale }) {
  if (quiz.slug !== "browser-tabs") notFound();
  const zh = locale === "zh", path = `/${locale}/tests/play/browser-tabs`;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="fun-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="fun-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.seo.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.seo.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "6题 · 约2分钟 · 无需注册" : "6 choices · About 2 minutes · No registration"}</span><span>{zh ? "原创休闲浏览情境 · 完整画像免费" : "Original casual-browsing scenes · Full portraits free"}</span></div>
      <FunQuizClient quiz={quiz} locale={locale} compactLanding landingInstructions={{ en: "For each fictional browsing scene, choose what you would keep: a question, one small trial or an optional interest shelf. There are no right answers. Finish six questions to see all counts and highest ties; no real links, history access or saving choice is required.", zh: "每个虚构浏览场景，选择更想留住的用途：一个问题、一次小试或可选兴趣架。没有标准答案。六题完成后查看全部次数与最高并列；无需真实链接、历史权限或保存选择。" }} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="about-quiz"><h2 id="about-quiz" className="text-2xl font-semibold">{browserTabsSections[0].title[locale]}</h2>{browserTabsSections[0].paragraphs.map((p,i)=><p key={i}>{p[locale]}</p>)}<p>{quiz.introduction[locale]}</p><p>{quiz.focus[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="browser-tabs-methods"><h2 id="browser-tabs-methods">{zh ? "页面用途、研究背景与结果读法" : "Page functions, research background and result readings"}</h2><div className="explore-reading-sections">{browserTabsSections.slice(1).map(s=><section className="explore-reading-section" key={s.id} aria-labelledby={`browser-tabs-${s.id}`}><h3 id={`browser-tabs-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="possible-results"><h2 id="possible-results" className="text-2xl font-semibold">{zh ? "三种休闲标签页画像：完整公开指南" : "Three casual-tab portraits: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇都有完整画像、日常例子、取舍与参与提示。这些是公开的原创说明，不是访客私人作答；三种均可直接阅读，并列时保留所有最高画像。" : "Each guide contains its complete portrait, everyday example, tradeoff and participation prompt. These are public authored explanations, not visitor responses. Read all three directly; personal highest ties retain every leading portrait."}</p><div className="grid gap-4 md:grid-cols-3">{quiz.results.map(r=><article className="rounded-lg border bg-white p-5" key={r.id}><h3 className="text-lg font-semibold"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={resultPath(locale,quiz.slug,r.id)}>{r.title[locale]}</Link></h3><p className="mt-2 leading-7">{r.summary[locale]}</p></article>)}</div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="quiz-faq"><h2 id="quiz-faq" className="text-2xl font-semibold">{zh ? "休闲浏览标签页测试常见问题" : "Browser-tab style quiz: frequently asked questions"}</h2>{[quiz.seo.faq,...browserTabsFaq].map((f,i)=><div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="browser-tabs-references"><h2 id="browser-tabs-references" className="text-xl font-semibold">{zh ? "浏览使用研究与工具背景资料" : "Research and tool background for browsing"}</h2><ol className="mt-4 space-y-2"><li id="browser-tabs-reference-1"><a className="underline" rel="noopener noreferrer" href="https://josephcc.com/static/papers/233987809/paper.pdf">{zh ? "1. Chang等（2021）：标签页使用成本研究原文" : "1. Chang et al. (2021): original study of browser-tab usage costs"}</a></li><li id="browser-tabs-reference-2"><a className="underline" rel="noopener noreferrer" href="https://support.google.com/chrome/answer/2391819?hl=en">{zh ? "2. Google Chrome：标签页与分组管理说明" : "2. Google Chrome: managing tabs and tab groups"}</a></li><li id="browser-tabs-reference-3"><a className="underline" rel="noopener noreferrer" href="https://support.mozilla.org/fr/kb/groupes-onglets">{zh ? "3. Mozilla Firefox：标签页分组说明（法文）" : "3. Mozilla Firefox: tab groups (French)"}</a></li></ol></section>
  </Container></main>;
}
