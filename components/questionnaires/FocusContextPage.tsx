import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { FocusContextClient } from "./FocusContextClient";
import { FocusContextSupport } from "./FocusContextReport";
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="focus-context-library"><h2 id="focus-context-library" className="text-2xl font-semibold">{locale === "zh" ? "四篇完整公开指南" : "Four complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="space-y-3">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>;
}
function ExistingExecutiveReading({ locale }: { locale: Locale }) {
  const zh = locale === "zh", slug = "executive-function";
  const readings = [
    { id: "overall-sum-reading", en: "Overall raw sum reading", zh: "整体原始合计读法" },
    { id: "working-memory-reading", en: "Working-memory reading", zh: "工作记忆读法" },
    { id: "inhibition-reading", en: "Inhibition reading", zh: "抑制控制读法" },
  ];
  return <section data-focus-context-existing-primary className="my-8 space-y-4 rounded-lg border border-slate-300 p-4 leading-8">
    <h2 className="text-2xl font-semibold">{zh ? "已有独立执行功能14题与读法" : "Separate existing executive-function form and readings"}</h2>
    <p>{zh ? "ADEXI14保留自己的工作记忆与抑制题目、版本、锚点及算法。这里只链接独立公开阅读，不转移回答，也不把14题与本页16条合并成30题或联合分数。" : "ADEXI14 retains its own working-memory and inhibition items, version, anchors and arithmetic. These links provide separate public reading without transferring answers or combining fourteen existing items and sixteen original observations into a thirty-item instrument or score."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnairePath(locale, slug)}>{zh ? "阅读已有执行功能14题入口" : "Read the existing fourteen-item executive-function entry"}</Link>
    <ul className="space-y-3">{readings.map(r => <li key={r.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, slug, r.id)}>{zh ? r.zh : r.en}</Link></li>)}</ul>
  </section>;
}
export function FocusContextPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link>
    <p className="font-semibold text-violet-800">{zh ? "16条原创观察 · 四篇全文免费" : "16 original observations · Four full guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="mt-4 leading-8">{quiz.introduction[locale]}</p>
    <FocusContextSupport locale={locale} />
    <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
    <FocusContextClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8" aria-labelledby={`focus-context-method-${s.id}`}><h2 id={`focus-context-method-${s.id}`} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <ExistingExecutiveReading locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`focus-context-public-${p.directionIds[0]}`} data-focus-context-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`focus-context-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="focus-context-faq"><h2 id="focus-context-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="focus-context-references"><h2 id="focus-context-references" className="text-xl font-semibold">{zh ? "公开日常情境与支持背景资料" : "Public topic and support background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul><p className="mt-4 leading-7">{zh ? "资料说明成年人注意相关问题的更广专业评估背景，不为本原创题组提供题目、计分键、验证、医学评估、诊断或背书。" : "These sources describe broader professional assessment of adult attention-related concerns. They do not validate this original supplement or its reading topics. They supply no items, scoring key, validation, medical assessment, diagnosis or endorsement for this original inventory."}</p></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "原创内容版本" : "Original content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
export function FocusContextGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开日常情境读法" : "Complete public daily-context reading"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <FocusContextSupport locale={locale} /><div data-focus-context-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix="report" /></div><ExistingExecutiveReading locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回16条原创观察" : "Return to the 16 original observations"}</Link>
  </Container></main>;
}
