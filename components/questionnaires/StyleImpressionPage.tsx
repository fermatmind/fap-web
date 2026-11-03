import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { StyleImpressionClient } from "./StyleImpressionClient";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { styleLandingSections, styleLandingFaq, styleLandingReferences } from "./StyleImpressionLandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#style-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function StyleImpressionPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? "16次比较 · 约3分钟 · 无需注册 · 完整指南免费" : "16 comparisons · about 3 minutes · no signup · full guides free"}</p>
      <StyleImpressionClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="style-purpose"><h2 id="style-purpose">{styleLandingSections[0].title[locale]}</h2>{styleLandingSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="style-methods"><h2 id="style-methods">{zh ? "整体造型偏好方法：设计概念、计数与实际尝试" : "Whole-look methods: design concepts, counts and practical experiments"}</h2><div className="explore-reading-sections">{[...styleLandingSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`style-method-${s.id}`}><h3 id={`style-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section id="questionnaire-results" className="my-10" aria-labelledby="style-library"><h2 id="style-library" className="text-2xl font-semibold">{zh ? "八篇完整公开造型指南" : "Five complete public style-line guides"}</h2><p className="my-4 leading-8">{zh ? "八个主题均可直接阅读，包含定义、实例、对照与自主尝试；完整内容不按身体、次数或个人身份解锁。" : "Read all eight for definitions, examples, comparisons and optional experiments. Full content has no body-, count- or identity-based unlocking."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-style-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} headingLevel={3} idPrefix={`style-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="style-faq"><h2 id="style-faq" className="text-2xl font-semibold">{zh ? "整体造型偏好常见问题" : "Whole-look style preferences FAQ"}</h2>{[...quiz.faq, ...styleLandingFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="style-references"><h2 id="style-references" className="text-xl font-semibold">{zh ? "设计教育与方法来源" : "Design education and method sources"}</h2><ul className="mt-4 space-y-3">{[...quiz.references!, ...styleLandingReferences].map((r, i) => <li key={r.url} id={`style-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
