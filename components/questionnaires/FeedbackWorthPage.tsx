import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import { feedbackWorthSections, feedbackWorthFaq, feedbackWorthReadingSummaries } from "./FeedbackWorthLandingEditorial";
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
import { FeedbackWorthClient } from "./FeedbackWorthClient";
import { FeedbackWorthSupport } from "./FeedbackWorthReport";
function Copy({ text }: { text: string }) { return <>{text.split(/(\[\d+\])/g).map((part,i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#feedback-worth-reference-${part.slice(1,-1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>; }
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="feedback-worth-library"><h2 id="feedback-worth-library" className="text-2xl font-semibold">{locale === "zh" ? "三篇完整公开指南" : "Three complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{(feedbackWorthReadingSummaries[p.id] ?? p.summary)[locale]}</p></li>)}</ul></section>;
}
export function FeedbackWorthPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <FeedbackWorthClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} readingProfiles={quiz.profiles.map(profile => prepareResultProfile(quiz.slug, profile))} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? `12条陈述 · 约${quiz.minutes}分钟` : `12 statements · About ${quiz.minutes} minutes`}</span><span>{zh ? "完整读法免费 · 无需注册" : "Full readings free · No registration"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <FeedbackWorthSupport locale={locale} />
    <section className="my-8 leading-8" aria-label={zh ? "原创作答说明" : "Original response instructions"}><p>{quiz.instructions![locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="feedback-worth-purpose"><h2 id="feedback-worth-purpose">{feedbackWorthSections[0].title[locale]}</h2>{feedbackWorthSections[0].paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="feedback-worth-methods"><h2 id="feedback-worth-methods">{zh ? "反馈与自我价值感：语境、类别记录与使用范围" : "Feedback and self-worth: context, category records and scope"}</h2><div className="explore-reading-sections">{[...feedbackWorthSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`feedback-worth-method-${s.id}`}><h3 id={`feedback-worth-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`feedback-worth-public-${p.directionIds[0]}`} data-feedback-worth-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, p)} locale={locale} headingLevel={3} idPrefix={`feedback-worth-public-${p.id}`} /></section>)}
    <section data-feedback-worth-existing-guides className="my-10 space-y-4 leading-8" aria-labelledby="feedback-worth-existing-guides"><h2 id="feedback-worth-existing-guides" className="text-2xl font-semibold">{zh ? "相邻问题已有完整读法" : "Complete existing readings for neighbouring questions"}</h2>
      <p>{zh ? "可直接阅读公开全文，不需再答问卷。SD4原七题均值、DTP四条行为的频率方法、FSCRS九条不足感来源题分别解释自己的问题，不补这里的回答，也不合成四特质画像、总分或最高型。" : "Read the public full text without taking another questionnaire. The published SD4 seven-item mean, DTP four-behaviour frequency method and FSCRS nine source statements about inadequacy answer separate questions. They do not supply missing responses here or combine into a four-trait profile, total or highest type."}</p>
      <ul className="space-y-3">
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "dark-tetrad-sd4", "narcissism")}>{zh ? "SD4：特别感与展示的原七题读法" : "SD4: the seven-item reading of perceived distinction and showing off"}</Link></li>
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "difficult-person-test", "grandiosity")}>{zh ? "优越与特殊待遇：四项具体习惯" : "Superiority and special treatment: four specific habits"}</Link></li>
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "inner-critic-voice-test", "inadequate")}>{zh ? "挫折后的不足感与自我批评：完整公开解释" : "Inadequacy and self-criticism after setbacks: complete public explanation"}</Link></li>
      </ul>
    </section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="feedback-worth-faq"><h2 id="feedback-worth-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{[...quiz.faq, ...feedbackWorthFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="feedback-worth-references"><h2 id="feedback-worth-references" className="text-xl font-semibold">{zh ? "反馈与自我价值感背景资料" : "Public feedback and self-worth background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map((r,i) => <li key={r.url} id={`feedback-worth-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function FeedbackWorthGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开反馈与自我价值感经历读法" : "Complete public feedback-and-self-worth reading"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <FeedbackWorthSupport locale={locale} /><div data-feedback-worth-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix="report" /></div><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回12条原创陈述" : "Return to the 12 original statements"}</Link>
  </Container></main>;
}
