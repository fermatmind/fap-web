import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { SpatialContextClient } from "./SpatialContextClient";
import { SpatialContextSupport } from "./SpatialContextReport";
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="spatial-context-library"><h2 id="spatial-context-library" className="text-2xl font-semibold">{locale === "zh" ? "完整公开指南" : "Complete public guide"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="space-y-3">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>;
}
function SeparateResources({ locale }: { locale: Locale }) {
 const zh = locale === "zh";
 const resources = [["communication-routines-context", "", "Communication, Routines & Ways of Working", "沟通、日常安排与做事方式"], ["focus-energy-context-reflection", "", "Attention & Energy: Daily Context", "注意力与能量：日常情境回顾"], ["executive-function", "", "Executive Function Check-In", "执行功能测试"], ["sensory-sensitivity", "", "Sensory Sensitivity Test", "感官敏感测试"], ["sensory-processing-test", "", "Sensory Perception Quotient: Full 92-Item SPQ", "感觉加工问卷：完整92项SPQ"], ["masking-test", "", "Masking Test (CAT-Q)", "社交伪装测试（CAT-Q）"], ["aphantasia-test", "", "Aphantasia Test", "心盲症测试"], ["communication-routines-context", "visual-arrangements-reading", "Using visual arrangements — separate full guide", "使用视觉安排：独立完整指南"]];
 return <section data-spatial-context-separate-resources className="my-8 space-y-4 leading-8"><h2 className="text-2xl font-semibold">{zh ? "其他问题，分别阅读既有资源" : "Separate resources for other questions"}</h2><p>{zh ? "日常沟通、细节与安排、近期专注、成人执行功能、感官体验、社交伪装和视觉意象各保留自身题本。外部视觉辅助不同于这里的空间关系思考。没有回答转移、共同总分、能力换算或联合认知风格档案。" : "Everyday communication, details and routines, recent focus, adult executive function, sensory experiences, camouflaging and visual imagery keep their own forms. External visual aids differ from spatial-relationship thinking here. No answers transfer and no shared total, ability conversion or combined cognitive-style profile is made."}</p><ul className="space-y-2">{resources.map(([slug,id,en,cn])=><li key={`${slug}:${id}`}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={id?questionnaireGuidePath(locale,slug,id):questionnairePath(locale,slug)}>{zh?cn:en}</Link></li>)}</ul></section>;
}
export function SpatialContextPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link>
    <p className="font-semibold text-violet-800">{zh ? "四条原创描述 · 完整指南免费" : "four original descriptions · One full guide, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="mt-4 leading-8">{quiz.introduction[locale]}</p>
    <SpatialContextSupport locale={locale} />
    <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
    <SpatialContextClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8" aria-labelledby={`spatial-context-method-${s.id}`}><h2 id={`spatial-context-method-${s.id}`} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`spatial-context-public-${p.directionIds[0]}`} data-spatial-context-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`spatial-context-public-${p.id}`} /></section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="spatial-context-faq"><h2 id="spatial-context-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="spatial-context-references"><h2 id="spatial-context-references" className="text-xl font-semibold">{zh ? "参考研究：任务方法区别" : "Reference: task-method background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul><p className="mt-4 leading-7">{zh ? "引用的研究摘要用于区分计时判断与回忆描述，不为本原创题本提供刺激材料、题目、计分、常模或验证。" : "The cited research abstract distinguishes timed judgments from recollections. It supplies no stimuli, items, scoring, norms or validation for these original prompts."}</p></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "原创内容版本" : "Original content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
export function SpatialContextGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开空间思考指南" : "Complete public spatial-thinking guide"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是一篇对所有人公开的原创回顾指南，不含个人回答或计数。无需先答题，也不提供正确率、能力级别或固定思考风格。" : "This original recollection guide is public and contains no one’s answers or counts. No prior answers are needed; it provides no correctness score, ability level or fixed thinking style."}</p>
    <SpatialContextSupport locale={locale} /><div data-spatial-context-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix="report" /></div><SeparateResources locale={locale} /><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回四条原创描述" : "Return to the four original descriptions"}</Link>
  </Container></main>;
}
