import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { sbti31Profiles, type Sbti31Questionnaire } from "@/lib/questionnaires/sbti31";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { QuestionnaireSbti31Client } from "./QuestionnaireSbti31Client";
import { Sbti31Portrait } from "./Sbti31Portrait";
import { QuestionnaireReport } from "./QuestionnaireReport";
function Method({ quiz, locale }: { quiz: Sbti31Questionnaire; locale: Locale }) {
  return <section className="my-10 space-y-7" aria-labelledby="sbti31-method"><h2 id="sbti31-method" className="text-2xl font-semibold">{locale === "zh" ? "原版说明与使用方式" : "Original edition and how to use it"}</h2>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>;
}
function GuideList({ quiz, locale, exclude }: { quiz: Sbti31Questionnaire; locale: Locale; exclude?: string }) {
  return <section id="sbti31-guides" className="my-10 scroll-mt-24" aria-labelledby="sbti31-guides-heading"><h2 id="sbti31-guides-heading" className="text-2xl font-semibold">{locale === "zh" ? "全部25种原版结果说明" : "All 25 original result guides"}</h2><p className="my-4 leading-8">{locale === "zh" ? "作答前也可完整阅读；这些公开页面不含任何个人答卷或分数。" : "Read every guide before answering. These public pages contain no personal answers or scores."}</p><ul className="space-y-5">{quiz.profiles.filter(p => p.id !== exclude).map(p => <li key={p.id} className="rounded-xl border bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 text-xl font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-8">{p.summary[locale]}</p></li>)}</ul></section>;
}
export function Sbti31Page({ quiz, locale }: { quiz: Sbti31Questionnaire; locale: Locale }) {
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti31-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="sbti31-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试 · 更多测试" : "All tests · More tests"}</Link></nav>
    <p className="mt-4 text-sm font-semibold text-violet-800">{zh ? "小程序原题 · 原计分 · 25种趣味画像" : "Original Mini questions · Original scoring · 25 playful portraits"}</p><h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p><p className="my-4 text-sm leading-7">{zh ? "原31题 · 约6分钟 · 不计时 · 完整结果免费 · 无需注册" : "31 original questions · About 6 minutes · Untimed · Full results free · No signup"}</p><p className="leading-8">{quiz.introduction[locale]}</p>
    <QuestionnaireSbti31Client quiz={quiz} locale={locale} /><GuideList quiz={quiz} locale={locale} /><Method quiz={quiz} locale={locale} />
    <section className="my-10 space-y-6"><h2 className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <p className="text-sm leading-7 text-slate-600">{zh ? "原题本／计分版本" : "Original bank / scoring edition"}: {quiz.source.itemBankVersion} / {quiz.source.scoringVersion}. {zh ? "网页英文为工作译文，原中文题本与原计分不变。" : "Web English is a working translation; original Chinese questions and scoring are unchanged."}</p>
  </Container></main>;
}
export function Sbti31GuidePage({ quiz, profile, locale }: { quiz: Sbti31Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="sbti31-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} /><JsonLd id="sbti31-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link></nav><h1 className="my-4 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1><p className="my-5 leading-8">{zh ? "这是原31题玩法的公开画像说明，不含你的答卷或分数。原版趣味叙述、15维说明和补充观察都可以直接阅读。" : "This is a public portrait guide for the original 31-question edition, without your answers or scores. Read the original playful story, fifteen descriptions and additional reflection directly."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${entry}#take-test`}>{zh ? "返回原31题入口" : "Return to the original 31 questions"}</Link>
    <Sbti31Portrait code={sbti31Profiles.find(p => p.id === profile.id)!.code} name={profile.headline[locale]} locale={locale} />
    <div className="my-6 rounded-xl border bg-white p-5 sm:p-8"><QuestionnaireReport profile={profile} locale={locale} headingLevel={2} idPrefix={`original31-${profile.id}`} /></div><Method quiz={quiz} locale={locale} /><GuideList quiz={quiz} locale={locale} exclude={profile.id} />
  </Container></main>;
}
