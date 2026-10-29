import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Mattering10Questionnaire } from "@/lib/questionnaires/mattering10";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireMattering10Client } from "./QuestionnaireMattering10Client";
import { QuestionnaireReport } from "./QuestionnaireReport";
function Method({ quiz, locale }: { quiz: Mattering10Questionnaire; locale: Locale }) {
  return <section className="my-10 space-y-7" aria-labelledby="mattering10-method"><h2 id="mattering10-method" className="text-2xl font-semibold">{locale === "zh" ? "方法、来源与使用边界" : "Method, sources and scope"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}<ul className="space-y-3 text-sm leading-7">{quiz.references?.map(r => <li key={r.url}><a className="underline" href={r.url}>{r.title[locale]}</a></li>)}</ul></section>;
}
export function Mattering10Page({ quiz, locale }: { quiz: Mattering10Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="mattering10-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="mattering10-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试" : "All tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "GMS五题＋AMS五题 · 两份完整指南免费" : "GMS 5 + AMS 5 · Two full guides free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="my-4 text-sm leading-7">{zh ? "10题 · 约3分钟 · 不计时 · 无需注册" : "10 questions · About 3 minutes · Untimed · No signup"}</p><p className="leading-8">{quiz.introduction[locale]}</p>
    <QuestionnaireMattering10Client quiz={quiz} locale={locale} />
    <section className="my-10" aria-labelledby="mattering10-guides"><h2 id="mattering10-guides" className="text-2xl font-semibold">{zh ? "两份完整公开读法" : "Two full public readings"}</h2><p className="my-4 leading-8">{zh ? "不作答也可阅读；公开页面对所有人相同，不含个人分数。" : "Read without answering. Public pages are identical for everyone, without personal scores."}</p><ul className="space-y-5">{quiz.profiles.map(p => <li key={p.id} className="rounded-xl border bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-xl font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-8">{p.summary[locale]}</p></li>)}</ul></section>
    <Method quiz={quiz} locale={locale} />
    <section className="my-10 space-y-6" aria-labelledby="mattering10-faq"><h2 id="mattering10-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <p className="text-sm leading-7 text-slate-600">{zh ? "网站内容版本" : "Website edition"}: {quiz.version} · {quiz.updated}</p>
  </Container></main>;
}
export function Mattering10GuidePage({ quiz, profile, locale }: { quiz: Mattering10Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="mattering10-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="mattering10-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <h1 className="my-4 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1><p className="my-5 leading-8">{zh ? "这是完整公开读法，对所有人相同，不含个人答案或分数。两项独立计分，不形成类型或综合价值分。" : "This full public reading is identical for everyone, without personal answers or scores. The two separate scales do not create a type or combined worth score."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${entry}#take-test`}>{zh ? "免费开始10题" : "Start all 10 questions free"}</Link>
    <div className="my-6 rounded-xl border bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`public-${profile.id}`} /></div>
    <Method quiz={quiz} locale={locale} />
    <section><h2 className="text-xl font-semibold">{zh ? "阅读另一份完整指南" : "Read the other full guide"}</h2>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <Link key={p.id} prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link>)}</section>
  </Container></main>;
}
