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
import { OutfitLinePreferencesClient } from "./OutfitLinePreferencesClient";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { outfitLandingSections, outfitLandingFaq, outfitLandingReferences } from "./OutfitLineLandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#outfit-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function OutfitLinePreferencesPage({ quiz, locale, take = false, displayLocale = locale, copy = text => text, sections = outfitLandingSections, faq = outfitLandingFaq, extraReferences = outfitLandingReferences }: {
  quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  sections?: Questionnaire["guide"]; faq?: Questionnaire["faq"]; extraReferences?: NonNullable<Questionnaire["references"]>;
}) {
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <OutfitLinePreferencesClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? copy("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? copy("15条陈述 · 约3分钟 · 无需注册 · 完整指南免费") : "15 statements · about 3 minutes · no signup · full guides free"}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="outfit-purpose"><h2 id="outfit-purpose">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="outfit-methods"><h2 id="outfit-methods">{zh ? copy("服装线条偏好方法：设计概念、均值读法与实际观察") : "Outfit-line methods: design concepts, means and practical observation"}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`outfit-method-${s.id}`}><h3 id={`outfit-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-10" aria-labelledby="outfit-library"><h2 id="outfit-library" className="text-2xl font-semibold">{zh ? copy("五篇完整公开线条偏好指南") : "Five complete public outfit-line guides"}</h2><p className="my-4 leading-8">{zh ? copy("五项均可直接阅读，包含定义、实例、对照与自主尝试；它们解释穿搭偏好，不按身体、分数或个人身份解锁。") : "Read all five for definitions, examples, comparisons and optional experiments. These explain outfit preferences, without body-, score- or identity-based unlocking."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-outfit-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={3} idPrefix={`outfit-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="outfit-faq"><h2 id="outfit-faq" className="text-2xl font-semibold">{zh ? copy("服装线条偏好常见问题") : "Outfit line preferences FAQ"}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="outfit-references"><h2 id="outfit-references" className="text-xl font-semibold">{zh ? copy("设计教育与造型体系来源") : "Design education and styling-system sources"}</h2><ul className="mt-4 space-y-3">{[...quiz.references!, ...extraReferences].map((r, i) => <li key={r.url} id={`outfit-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
