import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { deepDesireSections, deepDesireFaq, deepDesireSummaries, deepDesireReferences } from "./DeepDesireLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#deep-desire-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function DeepDesirePage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "deep-desire" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "24题 · 约6分钟 · 无需注册" : "24 statements · About 6 minutes · No registration"}</span><span>{zh ? "六类当下动机 · 完整读法免费" : "Six current motivation themes · Complete readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="deep-desire-purpose"><h2 id="deep-desire-purpose" className="text-2xl font-semibold">{deepDesireSections[0].title[locale]}</h2>{deepDesireSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "六类动机怎样计分与阅读" : "How the six motivation themes are calculated and read"}</h2>{quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="deep-desire-methods"><h2 id="deep-desire-methods">{zh ? "当下动机：六类主题、算例与理论背景" : "Current motivation: six themes, examples and theoretical background"}</h2><div className="explore-reading-sections">{[...deepDesireSections.slice(1), ...quiz.guide.filter(s => !["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`deep-desire-method-${s.id}`}><h3 id={`deep-desire-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="deep-desire-library"><h2 id="deep-desire-library" className="text-2xl font-semibold">{zh ? "六类动机：完整公开指南" : "Six motivation themes: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "六篇指南均可直接阅读全文，包括主题定义、准确均分算例、相邻主题区别、虚构对话与自选观察。公开指南不含访客私人回答或分数。" : "Read all six complete guides for definitions, exact-mean examples, distinctions, fictional conversations and optional observations. Public guides contain no visitor responses or scores."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{deepDesireSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="deep-desire-faq"><h2 id="deep-desire-faq" className="text-2xl font-semibold">{zh ? "深层欲望与当下动机常见问题" : "Deep desires and current motivation: frequently asked questions"}</h2>{[...quiz.faq, ...deepDesireFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="deep-desire-references"><h2 id="deep-desire-references" className="text-xl font-semibold">{zh ? "动机理论背景资料" : "Motivation theory background references"}</h2><ol className="mt-4 space-y-2">{deepDesireReferences.map((ref, i) => <li key={ref.url} id={`deep-desire-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
