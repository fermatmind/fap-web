import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { BodyFrameObservationsClient } from "./BodyFrameObservationsClient";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { bodyFrameSections, bodyFrameFaq } from "./BodyFrameLandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#body-frame-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function BodyFrameObservationsPage({ quiz, locale, take = false, displayLocale = locale, copy = text => text, sections = bodyFrameSections, faq = bodyFrameFaq, extraReferences = [] }: {
  quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  sections?: Questionnaire["guide"]; faq?: Questionnaire["faq"]; extraReferences?: NonNullable<Questionnaire["references"]>;
}) {
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <BodyFrameObservationsClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? copy("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? copy("12条描述 · 约4分钟 · 无需注册 · 完整指南免费") : "12 descriptions · about 4 minutes · no signup · full guides free"}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="body-frame-purpose"><h2 id="body-frame-purpose">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="body-frame-methods"><h2 id="body-frame-methods">{zh ? copy("体表轮廓：三组观察、均值与方法区别") : "Body-frame observations: three groups, means and method distinctions"}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`body-frame-method-${s.id}`}><h3 id={`body-frame-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-10" aria-labelledby="body-frame-library"><h2 id="body-frame-library" className="text-2xl font-semibold">{zh ? copy("三篇完整公开轮廓观察指南") : "Three complete public outline-observation guides"}</h2><p className="my-4 leading-8">{zh ? copy("三篇均可直接阅读，包含定义、例子、对照与可选观察；不按均值高低解锁，也不分配身体类型。") : "Read all three for definitions, examples, comparisons and optional observations. Full guides are available regardless of means, without assigning a body type."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-body-frame-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={3} idPrefix={`body-frame-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="body-frame-faq"><h2 id="body-frame-faq" className="text-2xl font-semibold">{zh ? copy("体表轮廓观察常见问题") : "Body-frame observations FAQ"}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="body-frame-references"><h2 id="body-frame-references" className="text-xl font-semibold">{zh ? copy("造型体系原始资料与方法区别") : "Original styling-system sources and method distinctions"}</h2><ul className="mt-4 space-y-3">{[...quiz.references!, ...extraReferences].map((r, i) => <li key={r.url} id={`body-frame-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
