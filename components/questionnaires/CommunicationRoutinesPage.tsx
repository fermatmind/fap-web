import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import { communicationRoutinesSections, communicationRoutinesFaq, communicationRoutinesReadingSummaries } from "./CommunicationRoutinesLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { CommunicationRoutinesClient } from "./CommunicationRoutinesClient";
import { CommunicationRoutinesSupport } from "./CommunicationRoutinesReport";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#communication-routines-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="communication-routines-library"><h2 id="communication-routines-library" className="text-2xl font-semibold">{locale === "zh" ? "五篇完整公开指南" : "Five complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{(communicationRoutinesReadingSummaries[p.id] ?? p.summary)[locale]}</p></li>)}</ul></section>;
}
function SeparateResources({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const resources = [
    ["sensory-sensitivity", "Sensory response reflection", "感官反应回顾"],
    ["sensory-processing-test", "Sensory perception questionnaire", "感官知觉问卷"],
    ["executive-function", "Adult executive-function questionnaire", "成人执行功能问卷"],
    ["focus-energy-context-reflection", "Focus and energy in daily contexts", "日常情境中的专注与精力"],
    ["masking-test", "Social camouflaging questionnaire", "社交伪装问卷"],
    ["aphantasia-test", "Visual imagery reflection", "视觉意象回顾"],
  ];
  return <section className="my-8 space-y-4 leading-8" data-communication-routines-separate-resources><h2 className="text-2xl font-semibold">{zh ? "按具体问题选择独立资源" : "Choose a separate resource for a specific question"}</h2><p>{zh ? "这些既有入口各有题目、选项及完整读法。感官反应不同于感知分辨，成人执行功能不同于认知能力，社交伪装不同于神经类型，意象不同于空间推理。没有回答转移、共同总分或联合雷达图。" : "These existing entries have their own items, response options and complete readings. Sensory responses differ from sensory perception, adult executive function from cognitive ability, camouflaging from neurotype, and imagery from spatial reasoning. No answers transfer and no shared total or combined radar is produced."}</p><ul className="space-y-2">{resources.map(([slug,en,cn])=><li key={slug}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnairePath(locale,slug)}>{zh?cn:en}</Link></li>)}</ul></section>;
}
export function CommunicationRoutinesPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <CommunicationRoutinesClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} readingProfiles={quiz.profiles.map(profile => prepareResultProfile(quiz.slug, profile))} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? `20条陈述 · 约${quiz.minutes}分钟` : `20 statements · About ${quiz.minutes} minutes`}</span><span>{zh ? "完整读法免费 · 无需注册" : "Full readings free · No registration"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <CommunicationRoutinesSupport locale={locale} />
    <section className="my-8 leading-8" aria-label={zh ? "原创作答说明" : "Original response instructions"}><p>{quiz.instructions![locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="communication-routines-purpose"><h2 id="communication-routines-purpose">{communicationRoutinesSections[0].title[locale]}</h2>{communicationRoutinesSections[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="communication-routines-methods"><h2 id="communication-routines-methods">{zh ? "沟通与日常安排：情境、类别记录与使用范围" : "Communication and routines: context, records and scope"}</h2><div className="explore-reading-sections">{[...communicationRoutinesSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`communication-routines-method-${s.id}`}><h3 id={`communication-routines-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`communication-routines-public-${p.directionIds[0]}`} data-communication-routines-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, p)} locale={locale} headingLevel={3} idPrefix={`communication-routines-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="communication-routines-faq"><h2 id="communication-routines-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{[...quiz.faq, ...communicationRoutinesFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="communication-routines-references"><h2 id="communication-routines-references" className="text-xl font-semibold">{zh ? "沟通与日常参与的专业背景资料" : "Public communication-routines and support background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i) => <li key={r.url} id={`communication-routines-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function CommunicationRoutinesGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开日常情境指南" : "Complete public everyday-context guide"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <CommunicationRoutinesSupport locale={locale} /><div data-communication-routines-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix="report" /></div><SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回20条原创描述" : "Return to the 20 original descriptions"}</Link>
  </Container></main>;
}
