import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Reasoning18Questionnaire } from "@/lib/questionnaires/reasoning18";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { Reasoning18Client } from "./Reasoning18Client";
import { QuestionnaireReport } from "./QuestionnaireReport";

function Source({ quiz, locale }: { quiz: Reasoning18Questionnaire; locale: Locale }) {
  return <aside data-reasoning18-attribution className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600"><p>{quiz.reasoning18.attribution[locale]}</p><p>{quiz.reasoning18.editionNotice[locale]}</p>{quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></p>)}</aside>;
}
export function Reasoning18Page({ quiz, locale }: { quiz: Reasoning18Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="reasoning18-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="reasoning18-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创英文练习 · 三篇完整指南免费" : "Original English practice · Three full guides free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? "18道英文题 · 约16分钟含说明 · 分段计时／不计时 · 无需注册" : "18 English questions · About 16 minutes including instructions · Timed / untimed · No signup"}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p>
    <Reasoning18Client quiz={quiz} locale={locale} />
    <section aria-labelledby="reasoning18-method" className="my-10 space-y-8"><h2 id="reasoning18-method" className="text-2xl font-semibold">{zh ? "题本、计时与使用边界" : "Edition, timing and use"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="reasoning18-public-guides" className="my-10"><h2 id="reasoning18-public-guides" className="text-2xl font-semibold">{zh ? "三领域完整公开学习指南" : "Full public guides: three reasoning areas"}</h2><p className="my-4 leading-8">{zh ? "不作答也可阅读。以下对所有人相同，不含个人答案或分数。" : "Read without answering. These pages are identical for everyone, without personal responses or scores."}</p><ul className="space-y-2">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <section aria-labelledby="reasoning18-faq" className="my-10 space-y-6"><h2 id="reasoning18-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <Source quiz={quiz} locale={locale} />
    <section className="my-8"><h2 className="text-xl font-semibold">{zh ? "可选的下一步" : "Optional next step"}</h2><p className="my-3 leading-8">{zh ? "若想探索喜欢的活动，可另看RIASEC职业兴趣入口。它不验证本练习，也不判定招聘资格；题量、预计用时及免费范围见入口，不传递本次答案。" : "To explore activities you enjoy, separately view the RIASEC occupational-interest entry. It does not validate this practice or decide hiring eligibility. The entry explains questions, time and free scope; no responses are transferred."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/holland-career-interest-test-riasec`}>{zh ? "查看RIASEC职业兴趣入口" : "View the RIASEC occupational-interest entry"}</Link></section>
  </Container></main>;
}
export function Reasoning18GuidePage({ quiz, profile, locale }: { quiz: Reasoning18Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="reasoning18-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="reasoning18-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创完整学习指南 · 不估提供方成绩" : "Original full study guide · No provider score estimate"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "此指南对所有人相同，不含个人答案或数量，不是个人招聘测评报告。" : "This guide is identical for everyone, without personal answers or counts. It is not an individual provider assessment report."}</p>
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "免费尝试18道英文题" : "Try the free 18 English questions"}</Link>
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`public-${profile.id}`} /></div>
    <Source quiz={quiz} locale={locale} />
    <section className="my-8"><h2 className="text-xl font-semibold">{zh ? "阅读其他部分" : "Read the other parts"}</h2><ul>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
  </Container></main>;
}
