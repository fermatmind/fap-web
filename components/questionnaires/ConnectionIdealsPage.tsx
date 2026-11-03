import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { ConnectionIdealsClient } from "./ConnectionIdealsClient";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { connectionLandingSections, connectionLandingFaq } from "./ConnectionIdealsLandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#connection-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function ConnectionIdealsPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? "12次比较 · 约4分钟 · 无需注册 · 完整指南免费" : "12 comparisons · about 4 minutes · no signup · full guides free"}</p>
      <ConnectionIdealsClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="connection-purpose"><h2 id="connection-purpose">{connectionLandingSections[0].title[locale]}</h2>{connectionLandingSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="connection-methods"><h2 id="connection-methods">{zh ? "连接偏好：六种主题、计数读法与研究范围" : "Connection ideals: six themes, counting and research scope"}</h2><div className="explore-reading-sections">{[...connectionLandingSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`connection-method-${s.id}`}><h3 id={`connection-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-10" aria-labelledby="questionnaire-results"><h2 id="questionnaire-results" className="text-2xl font-semibold">{zh ? "六篇完整公开连接偏好指南" : "Six complete public connection-ideal guides"}</h2><p className="my-4 leading-8">{zh ? "六篇均可直接阅读，包含主题定义、例子、对照与可选观察，不按个人计数解锁。" : "Read all six for definitions, examples, comparisons and optional observations. All full guides are open regardless of personal tallies."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-connection-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} headingLevel={3} idPrefix={`connection-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="connection-faq"><h2 id="connection-faq" className="text-2xl font-semibold">{zh ? "灵魂伴侣测试与连接偏好常见问题" : "Soulmate quiz and connection ideals FAQ"}</h2>{[...quiz.faq, ...connectionLandingFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="connection-references"><h2 id="connection-references" className="text-xl font-semibold">{zh ? "关系信念研究与来源" : "Relationship-belief research and source"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r, i) => <li key={r.url} id={`connection-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
