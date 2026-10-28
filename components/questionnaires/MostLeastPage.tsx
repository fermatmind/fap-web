import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { MostLeastClient } from "./MostLeastClient";
import { QuestionnaireReport } from "./QuestionnaireReport";

function Source({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <aside className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600"><p>{locale === "zh" ? "题块、主题与解释均为费马原创。下方出版方资料只用于说明正式工具的题式与常模背景，不是本站效度、题库许可或合作证明。" : "FermatMind created the blocks, topics and explanations. The publisher reference below documents the official formats and norming context; it does not validate, license or endorse this practice."}</p>{quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></p>)}</aside>;
}

export function MostLeastPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="most-least-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="most-least-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "独立原创题式练习 · 八份完整读法免费" : "Independent original format practice · Eight full guides free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? "16组 · 64条原创陈述 · 约8分钟 · 不计时 · 无需注册" : "16 blocks · 64 original statements · About 8 minutes · Untimed · No signup"}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p>
    <MostLeastClient quiz={quiz} locale={locale} />
    <section aria-labelledby="most-least-method" className="my-10 space-y-8"><h2 id="most-least-method" className="text-2xl font-semibold">{zh ? "题式、次数与使用说明" : "Format, counts and instructions"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="most-least-public-guides" className="my-10"><h2 id="most-least-public-guides" className="text-2xl font-semibold">{zh ? "八主题完整公开读法" : "All eight full public guides"}</h2><p className="my-4 leading-8">{zh ? "这些是所有人相同的解释，不含个人结果；未开始练习也可直接阅读。" : "These explanations are identical for everyone and contain no personal result. You can read them without starting."}</p><ul className="space-y-2">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <section aria-labelledby="most-least-faq" className="my-10 space-y-6"><h2 id="most-least-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <Source quiz={quiz} locale={locale} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/work-ethics`}>{zh ? "可选：工作习惯反思测试（24条）" : "Optional: work-ethics reflection (24 statements)"}</Link>
  </Container></main>;
}

export function MostLeastGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", path = questionnaireGuidePath(locale, quiz.slug, profile.id), entry = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="most-least-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="most-least-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "最符合／最不符合 · 完整公开读法" : "Most/Least practice · Full public guide"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "本指南对所有人相同，不含个人答案或次数；它不描述你的Caliper特质，不提供正式测评反馈。" : "This guide is the same for everyone, without personal answers or counts. It does not describe your Caliper traits or provide official assessment feedback."}</p>
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "免费开始16组原创练习" : "Start the free 16-block original practice"}</Link>
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`public-${profile.id}`} /></div>
    <Source quiz={quiz} locale={locale} />
    <section className="my-8"><h2 className="text-xl font-semibold">{zh ? "查看其他主题" : "Read the other topics"}</h2><ul>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
  </Container></main>;
}
