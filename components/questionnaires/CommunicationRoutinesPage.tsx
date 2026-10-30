import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { CommunicationRoutinesClient } from "./CommunicationRoutinesClient";
import { CommunicationRoutinesSupport } from "./CommunicationRoutinesReport";
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="communication-routines-library"><h2 id="communication-routines-library" className="text-2xl font-semibold">{locale === "zh" ? "五篇完整公开指南" : "Five complete public guides"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="space-y-3">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>;
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
export function CommunicationRoutinesPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link>
    <p className="font-semibold text-violet-800">{zh ? "20条原创描述 · 五篇全文免费" : "20 original descriptions · Five full guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="mt-4 leading-8">{quiz.introduction[locale]}</p>
    <CommunicationRoutinesSupport locale={locale} />
    <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
    <CommunicationRoutinesClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8" aria-labelledby={`communication-routines-method-${s.id}`}><h2 id={`communication-routines-method-${s.id}`} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`communication-routines-public-${p.directionIds[0]}`} data-communication-routines-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`communication-routines-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="communication-routines-faq"><h2 id="communication-routines-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="communication-routines-references"><h2 id="communication-routines-references" className="text-xl font-semibold">{zh ? "专业支持背景资料" : "Public topic and support background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul><p className="mt-4 leading-7">{zh ? "资料只提供专业背景，不为原创题本提供题目、计分、验证、能力结论或诊断。" : "This source supplies professional background, not items, scoring, validation, ability findings, diagnosis or endorsement of this original inventory."}</p></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "原创内容版本" : "Original content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
export function CommunicationRoutinesGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开日常情境指南" : "Complete public everyday-context guide"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <CommunicationRoutinesSupport locale={locale} /><div data-communication-routines-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix="report" /></div><SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回20条原创描述" : "Return to the 20 original descriptions"}</Link>
  </Container></main>;
}
