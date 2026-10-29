import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { DistributedWorkContext } from "./DistributedWorkReport";

function Library({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <section className="my-8" aria-labelledby="distributed-library">
    <h2 id="distributed-library" className="text-2xl font-semibold">{locale === "zh" ? "四篇完整公开指南" : "Four complete public guides"}</h2>
    <p className="my-4 leading-8">{locale === "zh" ? "答题前、全部未计分或完成后，都可阅读同一份全文。每篇分别解释主题、数量、实例、实践与边界。" : "Read the same full text before answering, for an entirely unscored attempt, or after completion. Each guide explains the theme, counts, examples, practical questions and limits."}</p>
    <ul className="space-y-3">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul>
  </section>;
}

export function DistributedWorkPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试与练习" : "All tests and practice"}</Link>
    <p className="font-semibold text-violet-800">{zh ? "24组原创配对 · 四篇完整指南免费" : "24 original pairs · Four full guides, free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <p className="mt-4 leading-8 text-slate-600">{quiz.introduction[locale]}</p>
    <p className="my-5 leading-8">{quiz.instructions![locale]}</p>
    <DistributedWorkContext locale={locale} />
    <QuestionnaireClient key={`${quiz.slug}:${locale}`} quiz={quiz} locale={locale} />
    {quiz.guide.map(s => <section key={s.id} className="my-8 space-y-4 leading-8" aria-labelledby={`distributed-method-${s.id}`}><h2 id={`distributed-method-${s.id}`} className="text-2xl font-semibold">{s.title[locale]}</h2>{s.paragraphs.map((p, i) => <p key={i}>{p[locale]}</p>)}</section>)}
    <Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <section key={p.id} id={`distributed-public-${p.directionIds[0]}`} data-distributed-full-guide={p.id} className="my-10 scroll-mt-24 border-t border-slate-200 pt-7">
      <h2 className="mb-5 text-2xl font-semibold">{p.title[locale]}</h2>
      <QuestionnaireReport profile={p} locale={locale} headingLevel={3} idPrefix={`distributed-public-${p.id}`} />
    </section>)}
    <section className="my-10 space-y-5 leading-8" aria-labelledby="distributed-faq"><h2 id="distributed-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8" aria-labelledby="distributed-references"><h2 id="distributed-references" className="text-xl font-semibold">{zh ? "公开工作实践背景" : "Public work-practice background"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul><p className="mt-4 leading-7">{zh ? "参考提供背景，不提供本原创题组的题目、计分键、验证或背书。" : "The reference supplies background, not this original inventory’s items, scoring key, validation or endorsement."}</p></section>
    <p className="mt-8 text-sm text-slate-600">{zh ? "原创内容版本" : "Original content edition"} {quiz.version} · <time dateTime={quiz.updated}>{quiz.updated}</time></p>
  </Container></main>;
}

export function DistributedWorkGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="font-semibold text-violet-800">{zh ? "完整公开协作读法" : "Complete public coordination reading"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "这是所有人都可阅读的完整主题说明，不包含任何人的选择、数量或表现。无需先答题，也没有按次数解锁的等级。" : "This complete theme explanation is available to everyone, without anyone’s choices, counts or performance. No prior answers are needed and no count unlocks a level."}</p>
    <DistributedWorkContext locale={locale} />
    <div data-distributed-full-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix="report" /></div>
    <Library quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回24组原创配对" : "Return to the 24 original pairs"}</Link>
  </Container></main>;
}
