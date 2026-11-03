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
import { emotionDashboardSections, emotionDashboardFaq, emotionDashboardSummaries } from "./EmotionDashboardLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#eq-dashboard-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function EmotionDashboardPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (quiz.slug !== "eq-dashboard" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "40题 · 约9分钟 · 无需注册" : "40 prompts · About 9 minutes · No registration"}</span><span>{zh ? "八类感受独立回顾 · 完整读法免费" : "Eight separate feelings · Complete readings free"}</span></div>
      <QuestionnaireClient quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="eq-dashboard-purpose"><h2 id="eq-dashboard-purpose" className="text-2xl font-semibold">{emotionDashboardSections[0].title[locale]}</h2>{emotionDashboardSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "情绪频率怎样计分与阅读" : "How emotion frequency is scored and read"}</h2>{quiz.guide.filter(s => ["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="eq-dashboard-methods"><h2 id="eq-dashboard-methods">{zh ? "八类情绪：含义、情境与研究边界" : "Eight emotions: meanings, context and research boundaries"}</h2><div className="explore-reading-sections">{[...emotionDashboardSections.slice(1), ...quiz.guide.filter(s => !["facet-scoring", "facet-reading", "facet-comparison"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`eq-dashboard-method-${s.id}`}><h3 id={`eq-dashboard-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section id="questionnaire-results" className="my-8" aria-labelledby="eq-dashboard-library"><h2 id="eq-dashboard-library" className="text-2xl font-semibold">{zh ? "情绪仪表盘结果：八类感受的完整公开指南" : "Emotion dashboard results: eight complete public guides"}</h2><p className="my-4 leading-8">{zh ? "八篇指南均可直接阅读全文，包含含义、具体情境、频率读法、相邻感受区别、反例与可选观察。观察不足时也可阅读；公开指南不包含访客私人作答或个人均值。" : "Read all eight complete guides for meanings, specific contexts, frequency readings, distinctions, counterexamples and optional observations, including when observations are insufficient. Public guides contain no visitor answers or personal means."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{emotionDashboardSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="eq-dashboard-faq"><h2 id="eq-dashboard-faq" className="text-2xl font-semibold">{zh ? "情绪仪表盘常见问题" : "Emotion dashboard: frequently asked questions"}</h2>{[...quiz.faq, ...emotionDashboardFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="eq-dashboard-references"><h2 id="eq-dashboard-references" className="text-xl font-semibold">{zh ? "情绪框架背景资料" : "Emotion framework background"}</h2><ol className="mt-4 space-y-2">{(quiz.references ?? []).map((ref, i) => <li key={ref.url} id={`eq-dashboard-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
