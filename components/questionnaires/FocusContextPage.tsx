import { Fragment } from "react";
import { focusContextSections, focusContextFaq } from "./FocusContextLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { FocusContextClient } from "./FocusContextClient";
import { FocusContextSupport } from "./FocusContextReport";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#focus-context-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="focus-context-library"><h2 id="focus-context-library" className="text-2xl font-semibold">{locale === "zh" ? "四篇完整公开指南" : "Four complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>;
}
function ExistingExecutiveReading({ locale }: { locale: Locale }) {
  const zh = locale === "zh", slug = "executive-function";
  const readings = [
    { id: "overall-sum-reading", en: "Overall raw sum reading", zh: "整体原始合计读法" },
    { id: "working-memory-reading", en: "Working-memory reading", zh: "工作记忆读法" },
    { id: "inhibition-reading", en: "Inhibition reading", zh: "抑制控制读法" },
  ];
  return <section data-focus-context-existing-primary className="my-8 space-y-4 rounded-lg border border-slate-300 p-4 leading-8">
    <h2 className="text-2xl font-semibold">{zh ? "已有独立执行功能14题与读法" : "Separate existing executive-function form and readings"}</h2>
    <p>{zh ? "ADEXI14保留自己的工作记忆与抑制题目、版本、锚点及算法。这里只链接独立公开阅读，不转移回答，也不把14题与本页16条合并成30题或联合分数。" : "ADEXI14 retains its own working-memory and inhibition items, version, anchors and arithmetic. These links provide separate public reading without transferring answers or combining fourteen existing items and sixteen original observations into a thirty-item instrument or score."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnairePath(locale, slug)}>{zh ? "阅读已有执行功能14题入口" : "Read the existing fourteen-item executive-function entry"}</Link>
    <ul className="space-y-3">{readings.map(r => <li key={r.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, slug, r.id)}>{zh ? r.zh : r.en}</Link></li>)}</ul>
  </section>;
}
export function FocusContextPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? "16条观察 · 约4分钟 · 无需注册 · 完整指南免费" : "16 observations · about 4 minutes · no signup · full guides free"}</p>
      <FocusContextClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <FocusContextSupport locale={locale} />
    <section className="my-8 leading-8" aria-label={zh ? "原创作答说明" : "Original response instructions"}><p>{quiz.instructions![locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="focus-context-purpose"><h2 id="focus-context-purpose">{focusContextSections[0].title[locale]}</h2>{focusContextSections[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="focus-context-methods"><h2 id="focus-context-methods">{zh ? "日常情境：四个主题、类别记录与评估背景" : "Daily context: four topics, category records and assessment context"}</h2><div className="explore-reading-sections">{[...focusContextSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`focus-context-method-${s.id}`}><h3 id={`focus-context-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <ExistingExecutiveReading locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`focus-context-public-${p.directionIds[0]}`} data-focus-context-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, p)} locale={locale} headingLevel={3} idPrefix={`focus-context-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="focus-context-faq"><h2 id="focus-context-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{[...quiz.faq, ...focusContextFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="focus-context-references"><h2 id="focus-context-references" className="text-xl font-semibold">{zh ? "注意与日常情境：公开评估背景资料" : "Public assessment background for attention and daily context"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i) => <li key={r.url} id={`focus-context-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function FocusContextGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开日常情境读法" : "Complete public daily-context reading"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <FocusContextSupport locale={locale} /><div data-focus-context-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix="report" /></div><ExistingExecutiveReading locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回16条原创观察" : "Return to the 16 original observations"}</Link>
  </Container></main>;
}
