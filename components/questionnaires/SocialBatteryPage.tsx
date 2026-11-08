import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isLikertConfigurationValid } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { socialBatterySections, socialBatteryFaq, socialBatterySummaries, socialBatteryVisiblePrivacyAnswer } from "./SocialBatteryLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#social-battery-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function SocialBatteryPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "social-battery-test" || !isLikertConfigurationValid(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "20题 · 约5分钟 · 无需注册" : "20 questions · About 5 minutes · No registration"}</span><span>{zh ? "四部分独立阅读 · 完整结果免费" : "Four separate readings · Full results free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="social-battery-purpose"><h2 id="social-battery-purpose" className="text-2xl font-semibold">{socialBatterySections[0].title[locale]}</h2>{socialBatterySections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="social-battery-methods"><h2 id="social-battery-methods">{zh ? "社交电量计分、情境与研究证据" : "Social battery scoring, context and research evidence"}</h2><div className="explore-reading-sections">{[...socialBatterySections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`social-battery-method-${s.id}`}><h3 id={`social-battery-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="social-battery-library"><h2 id="social-battery-library" className="text-2xl font-semibold">{zh ? "四篇社交电量完整公开指南" : "Four complete public social battery guides"}</h2><p className="my-4 leading-8">{zh ? "无需答题即可阅读全文。每部分资料不足时，仍可读通用说明；公开指南不含个人答案或均分。" : "Read the full text without answering. General explanations remain available when information is insufficient; public guides contain no personal answers or means."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{socialBatterySummaries[p.id][locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-social-battery-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`social-battery-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="social-battery-faq"><h2 id="social-battery-faq" className="text-2xl font-semibold">{zh ? "社交电量测试常见问题" : "Social battery test frequently asked questions"}</h2>{[...quiz.faq, ...socialBatteryFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.question.en === "What happens if I refresh, change language or retake?" ? socialBatteryVisiblePrivacyAnswer(locale) : f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="social-battery-references"><h2 id="social-battery-references" className="text-xl font-semibold">{zh ? "交流行为与疲惫：原始研究" : "Sociable behaviour and fatigue: original research"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r, i) => <li key={r.url} id={`social-battery-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
