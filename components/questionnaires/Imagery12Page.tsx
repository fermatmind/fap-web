import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Imagery12Questionnaire } from "@/lib/questionnaires/imagery12";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { Imagery12Client } from "./Imagery12Client";
import { QuestionnaireReport } from "./QuestionnaireReport";

function Source({ quiz, locale }: { quiz: Imagery12Questionnaire; locale: Locale }) {
  return <aside data-imagery12-attribution className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600"><p>{quiz.imagery12.attribution[locale]}</p><p>{quiz.imagery12.editionNotice[locale]}</p>{quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></p>)}</aside>;
}
export function Imagery12Page({ quiz, locale }: { quiz: Imagery12Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="imagery12-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="imagery12-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More Tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创视觉意象观察 · 四篇完整读法免费" : "Original visual-imagery reflection · Four full guides free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8 text-slate-700">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm text-slate-600">{zh ? "12个情境 · 约4分钟 · 不计时 · 18岁及以上 · 无需注册" : "12 prompts · About 4 minutes · Untimed · Ages 18+ · No signup"}</p>
    <p className="mt-5 leading-8">{quiz.introduction[locale]}</p>
    <Imagery12Client quiz={quiz} locale={locale} />
    <section aria-labelledby="imagery12-method" className="my-10 space-y-8"><h2 id="imagery12-method" className="text-2xl font-semibold">{zh ? "题本、计分与使用边界" : "Edition, scoring and use"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="imagery12-public-guides" className="my-10"><h2 id="imagery12-public-guides" className="text-2xl font-semibold">{zh ? "四种意象情境的完整公开读法" : "Full public guides: four imagery contexts"}</h2><p className="my-4 leading-8">{zh ? "不作答也可阅读。以下对所有人相同，不含个人答案或分数。" : "Read without answering. These pages are identical for everyone, without personal responses or scores."}</p><ul className="space-y-2">{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <section aria-labelledby="imagery12-faq" className="my-10 space-y-6"><h2 id="imagery12-faq" className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <Source quiz={quiz} locale={locale} />
    <section className="my-8"><h2 className="text-xl font-semibold">{zh ? "可选的下一步" : "Optional next step"}</h2><p className="my-3 leading-8">{zh ? "若想从更广泛的偏好角度自我了解，可另做大五人格；它不验证意象，也不解释意象差异的原因。题量与预计用时见入口，不传递此处答案或分数。" : "For a broader view of preferences, you can separately explore Big Five. It does not validate imagery or establish the cause of differences in imagery. The entry shows its question count and time; no answers or scores are transferred."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/big-five-personality-test-ocean-model`}>{zh ? "查看大五人格测试入口" : "View the Big Five test entry"}</Link></section>
  </Container></main>;
}
export function Imagery12GuidePage({ quiz, profile, locale }: { quiz: Imagery12Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="imagery12-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="imagery12-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "原创完整公开读法 · 无诊断切点" : "Original full public reading · No diagnostic cutoff"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8">{zh ? "此指南对所有人相同，不含个人答案或分数，不是个人诊断或临床反馈。" : "This guide is identical for everyone, without personal answers or scores. It is not a personal diagnosis or clinical feedback."}</p>
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "免费尝试12个意象情境" : "Try the free 12 imagery prompts"}</Link>
    <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`public-${profile.id}`} /></div>
    <Source quiz={quiz} locale={locale} />
    <section className="my-8"><h2 className="text-xl font-semibold">{zh ? "阅读其他部分" : "Read the other parts"}</h2><ul>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
  </Container></main>;
}
