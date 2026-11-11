import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import { recentMoodSections, recentMoodFaq, recentMoodReadingSummaries } from "./RecentMoodLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { RecentMoodClient } from "./RecentMoodClient";
import { RecentMoodSupport } from "./RecentMoodReport";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#recent-mood-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
function Library({ quiz, locale, displayLocale = locale, copy = text => text, summaries = recentMoodReadingSummaries }: {
  quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  summaries?: typeof recentMoodReadingSummaries;
}) {
  return <section className="my-8" aria-labelledby="recent-mood-library"><h2 id="recent-mood-library" className="text-2xl font-semibold">{locale === "zh" ? copy("三篇完整公开指南") : "Three complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? copy("无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。") : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{(summaries[p.id] ?? p.summary)[locale]}</p></li>)}</ul></section>;
}
export function RecentMoodPage({ quiz, locale, take = false, displayLocale = locale, copy = text => text, scoringQuiz, sections = recentMoodSections, faq = recentMoodFaq, summaries = recentMoodReadingSummaries }: {
  quiz: Questionnaire; locale: Locale; take?: boolean; scoringQuiz?: Questionnaire; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  sections?: Questionnaire["guide"]; faq?: Questionnaire["faq"];
  summaries?: typeof recentMoodReadingSummaries;
}) {
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const engine = <RecentMoodClient scoringQuiz={scoringQuiz} key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} readingProfiles={quiz.profiles.map(profile => prepareResultProfile(quiz.slug, profile))} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? copy("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? copy(`12条观察 · 约${quiz.minutes}分钟`) : `12 observations · About ${quiz.minutes} minutes`}</span><span>{zh ? copy("完整读法免费 · 无需注册") : "Full readings free · No registration"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <RecentMoodSupport locale={locale} copy={copy} />
    <section className="my-8 leading-8" aria-label={zh ? copy("原创作答说明") : "Original response instructions"}><p>{quiz.instructions![locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="recent-mood-purpose"><h2 id="recent-mood-purpose">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="recent-mood-methods"><h2 id="recent-mood-methods">{zh ? copy("近期心情：经历、类别记录与结果读法") : "Recent mood: context, category records and interpretation"}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`recent-mood-method-${s.id}`}><h3 id={`recent-mood-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <Library quiz={quiz} locale={locale} displayLocale={displayLocale} copy={copy} summaries={summaries} />
    {quiz.profiles.map(p => <section key={p.id} id={`recent-mood-public-${p.directionIds[0]}`} data-recent-mood-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, p)} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={3} idPrefix={`recent-mood-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="recent-mood-faq"><h2 id="recent-mood-faq" className="text-2xl font-semibold">{zh ? copy("常见问题") : "Frequently asked questions"}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="recent-mood-references"><h2 id="recent-mood-references" className="text-xl font-semibold">{zh ? copy("近期心情与专业支持的背景资料") : "Public recent-mood and support background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i) => <li key={r.url} id={`recent-mood-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function RecentMoodGuidePage({ quiz, profile, locale, displayLocale = locale, copy = text => text, summaries = recentMoodReadingSummaries }: {
  quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
  summaries?: typeof recentMoodReadingSummaries;
}) {
  const zh = locale === "zh", entry = questionnairePath(displayLocale, quiz.slug), path = questionnaireGuidePath(displayLocale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale: displayLocale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? copy("完整公开近期心情读法") : "Complete public recent-mood reading"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? copy("这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。") : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <RecentMoodSupport locale={locale} copy={copy} /><div data-recent-mood-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={2} idPrefix="report" /></div><Library quiz={quiz} locale={locale} displayLocale={displayLocale} copy={copy} summaries={summaries} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? copy("返回12条原创观察") : "Return to the 12 original observations"}</Link>
  </Container></main>;
}
