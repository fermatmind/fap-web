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
import { cultureFitSections, cultureFitFaq, cultureFitSummaries } from "./CultureFitLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#culture-fit-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function CultureFitPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "culture-fit" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "24组 · 约8分钟 · 无需注册" : "24 comparisons · About 8 minutes · No registration"}</span><span>{zh ? "四组安排偏好 · 完整读法免费" : "Four work-arrangement preferences · Complete readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="culture-fit-purpose"><h2 id="culture-fit-purpose" className="text-2xl font-semibold">{cultureFitSections[0].title[locale]}</h2>{cultureFitSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "四组安排怎样对齐与阅读" : "How the four arrangement groups are aligned and read"}</h2>{quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="culture-fit-methods"><h2 id="culture-fit-methods">{zh ? "工作安排偏好：四组比较、计分与契合研究" : "Work arrangements: four comparisons, scoring and fit research"}</h2><div className="explore-reading-sections">{[...cultureFitSections.slice(1), ...quiz.guide.filter(s => !["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`culture-fit-method-${s.id}`}><h3 id={`culture-fit-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="culture-fit-library"><h2 id="culture-fit-library" className="text-2xl font-semibold">{zh ? "四组工作安排：完整公开指南" : "Four work-arrangement groups: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "四篇指南均可直接阅读全文，包括两端定义、换位计分算例、混合选择、虚构任务与自选行动。公开指南不含访客私人回答或位置均值。" : "Read every complete guide for endpoint definitions, position-alignment examples, mixed choices, fictional tasks and optional actions. Public guides contain no visitor responses or position means."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{cultureFitSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="culture-fit-faq"><h2 id="culture-fit-faq" className="text-2xl font-semibold">{zh ? "职场文化契合与工作偏好常见问题" : "Culture fit and work-preference frequently asked questions"}</h2>{[...quiz.faq, ...cultureFitFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="culture-fit-references"><h2 id="culture-fit-references" className="text-xl font-semibold">{zh ? "工作情境与契合研究资料" : "Work context and fit research references"}</h2><ol className="mt-4 space-y-2">{quiz.references.map((ref, i) => <li key={ref.url} id={`culture-fit-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
