import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { UncertaintyEaseClient } from "./UncertaintyEaseClient";
import { UncertaintyEaseSupport } from "./UncertaintyEaseReport";
function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="uncertainty-ease-library"><h2 id="uncertainty-ease-library" className="text-2xl font-semibold">{locale === "zh" ? "一篇完整公开指南" : "One complete public guide"}</h2><p className="my-4 leading-7">{locale === "zh" ? "无需答题即可阅读全文。全部未计分、中途退出或完成后，都可阅读同一份主题说明。" : "Read the full text without answering. The same theme explanations remain available for an entirely unscored record, after leaving midway and after completion."}</p><ul className="space-y-3">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>;
}
export function UncertaintyEasePage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link>
    <p className="font-semibold text-violet-800">{zh ? "6条原创陈述 · 一篇全文免费" : "6 original statements · One full guide, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="mt-4 leading-8">{quiz.introduction[locale]}</p>
    <UncertaintyEaseSupport locale={locale} />
    <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
    <UncertaintyEaseClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8" aria-labelledby={`uncertainty-ease-method-${s.id}`}><h2 id={`uncertainty-ease-method-${s.id}`} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`uncertainty-ease-public-${p.directionIds[0]}`} data-uncertainty-ease-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7"><h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2><QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`uncertainty-ease-public-${p.id}`} /></section>)}
    <section data-uncertainty-ease-existing-guides className="my-10 space-y-4 leading-8" aria-labelledby="uncertainty-ease-existing-guides"><h2 id="uncertainty-ease-existing-guides" className="text-2xl font-semibold">{zh ? "其余问题已有完整读法" : "Complete existing readings for the other questions"}</h2>
      <p>{zh ? "直接阅读公开全文，无需再答问卷。DTP冷漠和操控各有四条行为及独立频率方法；普通决定回顾保留三条陈述与类别。它们不补这里的回答、不合分数，也不共同识别精神病态、临床冲动或算计反应谱系。" : "Read the public full text without another questionnaire. DTP callousness and manipulation each retain four behaviours and an independent frequency method; the ordinary-decision record retains three statements and categories. They do not supply responses here, combine scores or jointly identify psychopathy, clinical impulsivity or a calculating–reactive spectrum."}</p>
      <ul className="space-y-3">
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "difficult-person-test", "callousness")}>{zh ? "如何考虑他人感受：完整冷漠主题读法" : "Considering other people’s feelings: complete callousness reading"}</Link></li>
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "difficult-person-test", "manipulation")}>{zh ? "信息与拒绝空间：完整操控主题读法" : "Information and room to decline: complete manipulation reading"}</Link></li>
        <li><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, "emotions-connections-reflection", "quick-decisions-reading")}>{zh ? "还没想清就行动：完整普通决定读法" : "Acting before considering: complete ordinary-decision reading"}</Link></li>
      </ul>
    </section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="uncertainty-ease-faq"><h2 id="uncertainty-ease-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="uncertainty-ease-references"><h2 id="uncertainty-ease-references" className="text-xl font-semibold">{zh ? "相邻发表方法" : "Neighbouring published method"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul><p className="mt-4 leading-7">{zh ? "链接介绍另一种发表方法，不为本原创记录提供题目、计分键、验证或背书。" : "The link describes a different published method. It supplies no items, scoring key, validation or endorsement for this original record."}</p></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "原创内容版本" : "Original content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}
export function UncertaintyEaseGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开面对未知的自在体验读法" : "Complete public uncertainty-ease reading"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的原创主题说明，没有任何人的回答或计数。无需先答题，也不是个人结果、风险档位或诊断。" : "This original theme explanation is available to everyone without anyone’s answers or counts. No prior answers are needed. It is not a personal result, risk band or diagnosis."}</p>
    <UncertaintyEaseSupport locale={locale} /><div data-uncertainty-ease-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix="report" /></div><Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回6条原创陈述" : "Return to the 6 original statements"}</Link>
  </Container></main>;
}
