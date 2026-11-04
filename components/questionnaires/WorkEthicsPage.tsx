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
import { workEthicsSections, workEthicsFaq, workEthicsSummaries } from "./WorkEthicsLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#work-ethics-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function WorkEthicsPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "work-ethics" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "24项 · 约5分钟 · 无需注册" : "24 statements · About 5 minutes · No registration"}</span><span>{zh ? "四组任务习惯 · 完整读法免费" : "Four task-habit groups · Complete readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="work-ethics-purpose"><h2 id="work-ethics-purpose" className="text-2xl font-semibold">{workEthicsSections[0].title[locale]}</h2>{workEthicsSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "四组回答怎样计分与阅读" : "How the four groups are scored and read"}</h2>{quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="work-ethics-methods"><h2 id="work-ethics-methods">{zh ? "工作习惯：行为主题、复算方法与证据范围" : "Work habits: behaviour topics, calculations and evidence"}</h2><div className="explore-reading-sections">{[...workEthicsSections.slice(1), ...quiz.guide.filter(s => !["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`work-ethics-method-${s.id}`}><h3 id={`work-ethics-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="work-ethics-library"><h2 id="work-ethics-library" className="text-2xl font-semibold">{zh ? "四组工作习惯：完整公开指南" : "Four work-habit groups: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "四篇指南均可直接阅读全文，包括六项回答的含义、反向计分算例、虚构任务、情境限制与自选行动。它们是公开读法，不含访客私人回答或均分。" : "Read each complete guide for its six-item scope, reverse-coding example, fictional task, contextual limits and optional action. These public readings contain no visitor responses or personal means."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{workEthicsSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="work-ethics-faq"><h2 id="work-ethics-faq" className="text-2xl font-semibold">{zh ? "工作伦理与可靠性测试常见问题" : "Work ethics and reliability test frequently asked questions"}</h2>{[...quiz.faq, ...workEthicsFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="work-ethics-references"><h2 id="work-ethics-references" className="text-xl font-semibold">{zh ? "工作概念与背景资料" : "Work concept and background references"}</h2><ol className="mt-4 space-y-2">{quiz.references.map((ref, i) => <li key={ref.url} id={`work-ethics-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
