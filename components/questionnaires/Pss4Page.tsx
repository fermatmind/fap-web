import { Fragment } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import { isPss4ConfigurationValid } from "@/lib/questionnaires/pss4";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { notFound } from "next/navigation";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { QuestionnaireStressCheckInClient } from "./QuestionnaireStressCheckInClient";
import { pss4Sections, pss4Faq } from "./Pss4LandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#pss4-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}

export function Pss4Page({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isPss4ConfigurationValid(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug), profile = quiz.profiles[0];
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "4题 · 约1分钟 · 无需注册" : "4 questions · About 1 minute · No registration"}</span><span>{zh ? "英文原题 · 中文独立译文" : "Published English · Independent Chinese translation"}</span></div>
      <QuestionnaireStressCheckInClient quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="pss4-purpose"><h2 id="pss4-purpose" className="text-2xl font-semibold">{pss4Sections[0].title[locale]}</h2>{pss4Sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="pss4-methods"><h2 id="pss4-methods">{zh ? "PSS-4计分、研究证据与结果读法" : "PSS-4 scoring, research evidence and interpretation"}</h2><div className="explore-reading-sections">{[...pss4Sections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`pss4-method-${s.id}`}><h3 id={`pss4-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="pss4-library"><h2 id="pss4-library" className="text-2xl font-semibold">{zh ? "PSS-4完整公开指南" : "The complete public PSS-4 guide"}</h2><p className="my-4 leading-8">{zh ? "无需回答即可阅读全文。固定指南不含任何人的答案或总分，也不按分数分配类型。" : "Read the full text without answering. This fixed guide contains nobody’s answers or total and assigns no score-based type."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link><div data-pss4-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={3} idPrefix="pss4-public" /></div></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="pss4-faq"><h2 id="pss4-faq" className="text-2xl font-semibold">{zh ? "PSS-4常见问题" : "PSS-4 frequently asked questions"}</h2>{[...quiz.faq, ...pss4Faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="pss4-references"><h2 id="pss4-references" className="text-xl font-semibold">{zh ? "作者实验室与计分说明" : "Author laboratory and scoring references"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r, i) => <li key={r.url} id={`pss4-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
