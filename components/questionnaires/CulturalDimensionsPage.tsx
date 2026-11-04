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
import { culturalSections, culturalFaq, culturalSummaries, culturalExtraReferences } from "./CulturalDimensionsLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#cultural-dimensions-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function CulturalDimensionsPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "cultural-dimensions" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "36题 · 约8分钟 · 无需注册" : "36 statements · About 8 minutes · No registration"}</span><span>{zh ? "六组安排偏好 · 完整读法免费" : "Six arrangement themes · Complete readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="cultural-dimensions-purpose"><h2 id="cultural-dimensions-purpose" className="text-2xl font-semibold">{culturalSections[0].title[locale]}</h2>{culturalSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "六组安排偏好怎样计分与阅读" : "How six arrangement themes are calculated and read"}</h2>{quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="cultural-dimensions-methods"><h2 id="cultural-dimensions-methods">{zh ? "文化相关主题：具体安排、算例与分析层级" : "Culture-related themes: arrangements, examples and levels of analysis"}</h2><div className="explore-reading-sections">{[...culturalSections.slice(1), ...quiz.guide.filter(s => !["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`cultural-dimensions-method-${s.id}`}><h3 id={`cultural-dimensions-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section id="questionnaire-results" className="my-8" aria-labelledby="cultural-dimensions-library"><h2 id="cultural-dimensions-library" className="text-2xl font-semibold">{zh ? "六组文化相关主题：完整公开指南" : "Six culture-related themes: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "六篇指南均可直接阅读全文，包括主题定义、反向计分算例、相邻主题区别、虚构对话与自选观察。公开指南不含访客私人回答或分数。" : "Read all six complete guides for definitions, reverse-key examples, distinctions, fictional conversations and optional observations. Public guides contain no visitor responses or scores."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{culturalSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="cultural-dimensions-faq"><h2 id="cultural-dimensions-faq" className="text-2xl font-semibold">{zh ? "文化维度与个人反思常见问题" : "Cultural dimensions and personal reflection: frequently asked questions"}</h2>{[...quiz.faq, ...culturalFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="cultural-dimensions-references"><h2 id="cultural-dimensions-references" className="text-xl font-semibold">{zh ? "文化框架与分析层级资料" : "Cultural frameworks and levels of analysis: references"}</h2><ol className="mt-4 space-y-2">{[...(quiz.references ?? []), ...culturalExtraReferences].map((ref, i) => <li key={ref.url} id={`cultural-dimensions-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
