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
import { workValuesSections, workValuesFaq, workValuesSummaries } from "./WorkValuesLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#values-assessment-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function WorkValuesPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "values-assessment" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "30题 · 约7分钟 · 无需注册" : "30 choices · About 7 minutes · No registration"}</span><span>{zh ? "十项工作优先事项 · 完整读法免费" : "Ten work priorities · Complete readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="values-assessment-purpose"><h2 id="values-assessment-purpose" className="text-2xl font-semibold">{workValuesSections[0].title[locale]}</h2>{workValuesSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "工作优先事项怎样计数与阅读" : "How work priorities are counted and read"}</h2>{quiz.guide.filter(s => ["archetype-counts", "archetype-ties"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="values-assessment-methods"><h2 id="values-assessment-methods">{zh ? "十项工作优先事项：含义、区别与具体核对" : "Ten work priorities: meanings, distinctions and practical questions"}</h2><div className="explore-reading-sections">{[...workValuesSections.slice(1), ...quiz.guide.filter(s => !["archetype-counts", "archetype-ties"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`values-assessment-method-${s.id}`}><h3 id={`values-assessment-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section id="questionnaire-results" className="my-8" aria-labelledby="values-assessment-library"><h2 id="values-assessment-library" className="text-2xl font-semibold">{zh ? "工作价值观结果：十项完整公开指南" : "Work values results: ten complete public guides"}</h2><p className="my-4 leading-8">{zh ? "十篇指南均可直接阅读全文，包括含义、虚构工作情境、相邻优先事项区别、反例、计分与可选观察。无论次数高低都可阅读；公开正文不含访客私人回答、次数或名次。" : "Read all ten complete guides for meanings, fictional work scenes, distinctions, counterexamples, counting and optional observations, regardless of count. Public text contains no visitor responses, counts or ranks."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{workValuesSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="values-assessment-faq"><h2 id="values-assessment-faq" className="text-2xl font-semibold">{zh ? "工作价值观测试常见问题" : "Work values assessment: frequently asked questions"}</h2>{[...quiz.faq, ...workValuesFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="values-assessment-references"><h2 id="values-assessment-references" className="text-xl font-semibold">{zh ? "工作价值框架背景资料" : "Work values: framework background"}</h2><ol className="mt-4 space-y-2">{(quiz.references ?? []).map((ref, i) => <li key={ref.url} id={`values-assessment-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
