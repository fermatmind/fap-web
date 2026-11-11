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
import { ActivityEngagementClient } from "./ActivityEngagementClient";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { activityLandingSections, activityLandingFaq } from "./ActivityEngagementLandingEditorial";
function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#activity-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function ActivityEngagementPage({ quiz, locale, take = false, displayLocale = locale, copy = text => text, sections = activityLandingSections, faq = activityLandingFaq }: {
  quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  sections?: Questionnaire["guide"]; faq?: Questionnaire["faq"];
}) {
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <ActivityEngagementClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? copy("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <p className="explore-intro-meta">{zh ? copy("20条陈述 · 约4分钟 · 无需注册 · 完整指南免费") : "20 statements · about 4 minutes · no signup · full guides free"}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="activity-purpose"><h2 id="activity-purpose">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="activity-methods"><h2 id="activity-methods">{zh ? copy("活动参与方式：五项行为、计分方法与使用范围") : "Activity engagement: five patterns, scoring and use"}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`activity-method-${s.id}`}><h3 id={`activity-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-10" aria-labelledby="activity-library"><h2 id="activity-library" className="text-2xl font-semibold">{zh ? copy("五篇完整公开活动参与指南") : "Five complete public activity-line guides"}</h2><p className="my-4 leading-8">{zh ? copy("五项均可直接阅读，包含定义、实例、对照与自选观察；完整指南不按均值高低或个人类型解锁。") : "Read all five for definitions, examples, comparisons and optional observations. Full guides are available regardless of means or personal types."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul></section>
    {quiz.profiles.map(p => <section key={p.id} data-activity-full-guide={p.id} className="my-10 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={p} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={3} idPrefix={`activity-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="activity-faq"><h2 id="activity-faq" className="text-2xl font-semibold">{zh ? copy("活动参与方式常见问题") : "Activity engagement FAQ"}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2"><Copy text={f.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="activity-references"><h2 id="activity-references" className="text-xl font-semibold">{zh ? copy("方法区别与原始体系资料") : "Method distinctions and original-system sources"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r, i) => <li key={r.url} id={`activity-reference-${i + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
