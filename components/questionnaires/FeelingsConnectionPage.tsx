import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import { feelingsConnectionSections, feelingsConnectionFaq, feelingsConnectionReadingSummaries } from "./FeelingsConnectionLandingEditorial";
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
import { FeelingsConnectionClient } from "./FeelingsConnectionClient";
import { FeelingsConnectionSupport } from "./FeelingsConnectionReport";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#feelings-connection-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="feelings-connection-library"><h2 id="feelings-connection-library" className="text-2xl font-semibold">{locale === "zh" ? "两篇完整公开指南" : "Two complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{(feelingsConnectionReadingSummaries[p.id] ?? p.summary)[locale]}</p></li>)}</ul></section>;
}
function SeparateReadings({ locale }: { locale: Locale }) {
 const zh = locale === "zh";
 const resources = [["trauma-response-reflection", "", "Reactions After a Difficult Experience", "困难经历后的反应回顾"], ["trauma-response-reflection", "unwanted-reminders-reading", "Unwanted reminders — Complete Reading", "不想要的提醒：完整读法"], ["trauma-response-reflection", "keeping-distance-reading", "Keeping some distance — Complete Reading", "保持一些距离：完整读法"], ["trauma-response-reflection", "mood-and-connection-reading", "Mood and connection — Complete Reading", "情绪与联系：完整读法"], ["trauma-response-reflection", "feeling-on-edge-reading", "Feeling on edge — Complete Reading", "紧绷与警觉：完整读法"], ["inner-critic-voice-test", "", "Inner Critic Voice Test", "内心批评家声音测试"], ["inner-critic-voice-test", "inadequate", "Feeling inadequate and self-critical", "不足感与自我批评"], ["inner-critic-voice-test", "hated", "Self-hatred and self-directed attack", "对自己的厌恶与攻击"], ["inner-critic-voice-test", "reassured", "Self-reassurance and support", "自我安慰与支持"]];
 return <section data-feelings-connection-separate-resources className="my-8 space-y-4 leading-8"><h2 className="text-2xl font-semibold">{zh ? "提醒反应与自我回应的独立完整读法" : "Separate complete readings on reminders and self-response"}</h2><p>{zh ? "既有20条提醒反应与四篇全文、22条自我批评与三篇全文保留自身题目、选项、回忆范围和计分。自我批评题本没有固定数字回忆期，不改成这里的四周。没有回答转移、跨工具总分或复杂性PTSD判定。" : "The existing twenty trauma-response descriptions with four full guides and twenty-two self-criticism statements with three full guides keep their own items, options, recall scope and scoring. The self-criticism form has no fixed numeric recall window and is not converted to four weeks here. No answers transfer, and no cross-tool total or complex-PTSD classification is made."}</p><ul className="space-y-2">{resources.map(([slug,id,en,cn])=><li key={`${slug}:${id}`}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={id?questionnaireGuidePath(locale,slug,id):questionnairePath(locale,slug)}>{zh?cn:en}</Link></li>)}</ul></section>;
}
export function FeelingsConnectionPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <FeelingsConnectionClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} readingProfiles={quiz.profiles.map(profile => prepareResultProfile(quiz.slug, profile))} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? `8条陈述 · 约${quiz.minutes}分钟` : `8 statements · About ${quiz.minutes} minutes`}</span><span>{zh ? "完整读法免费 · 无需注册" : "Full readings free · No registration"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <FeelingsConnectionSupport locale={locale} />
    <section className="my-8 leading-8" aria-label={zh ? "原创作答说明" : "Original response instructions"}><p>{quiz.instructions![locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="feelings-connection-purpose"><h2 id="feelings-connection-purpose">{feelingsConnectionSections[0].title[locale]}</h2>{feelingsConnectionSections[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="feelings-connection-methods"><h2 id="feelings-connection-methods">{zh ? "感受与联系：情境、类别记录与使用范围" : "Feelings and connection: context, category records and scope"}</h2><div className="explore-reading-sections">{[...feelingsConnectionSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`feelings-connection-method-${s.id}`}><h3 id={`feelings-connection-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <SeparateReadings locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`feelings-connection-public-${p.directionIds[0]}`} data-feelings-connection-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, p)} locale={locale} headingLevel={3} idPrefix={`feelings-connection-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="feelings-connection-faq"><h2 id="feelings-connection-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{[...quiz.faq, ...feelingsConnectionFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="feelings-connection-references"><h2 id="feelings-connection-references" className="text-xl font-semibold">{zh ? "感受、联系与专业支持背景" : "Public feelings-connection and support background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i) => <li key={r.url} id={`feelings-connection-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function FeelingsConnectionGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开感受与联系指南" : "Complete public feelings-and-connection guide"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <FeelingsConnectionSupport locale={locale} /><div data-feelings-connection-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix="report" /></div><SeparateReadings locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回八条原创描述" : "Return to the eight original descriptions"}</Link>
  </Container></main>;
}
