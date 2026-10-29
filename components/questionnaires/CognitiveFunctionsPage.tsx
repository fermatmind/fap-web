import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";
import bank from "@/lib/questionnaires/jung56Bank.json";
import rawContent from "@/lib/questionnaires/jung56Content.json";
import { isJung56ConfigurationValid, isJung56ContentValid, type Jung56Content } from "@/lib/questionnaires/jung56";
import { CognitiveFunctionsVersions } from "./CognitiveFunctionsVersions";
import { Jung56GuideContent } from "./Jung56GuideContent";
import { QuestionnaireReport } from "./QuestionnaireReport";
const content = rawContent as Jung56Content;
export function isCognitiveFunctionsPageAvailable(quiz: Questionnaire) {
  return quiz.slug === "cognitive-functions-test" && quiz.kind === "likert" && quiz.code === "FM_COGNITIVE_FUNCTIONS32"
    && quiz.source.itemBankSha256 === "7e1297d73ba66b1ebde6551a00ba79eebcffce9537a0caa39d0aa7b14fd9eb50"
    && quiz.source.resultContentSha256 === "08e4138e318ae91043e1172a285ae3f2b2648898d5545a7376d5bb04d8e7ead1"
    && isQuestionnaireConfigurationValid(quiz) && isJung56ConfigurationValid(bank) && isJung56ContentValid(rawContent);
}
function Source({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  return <aside className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600" data-jung56-source><p>{locale === "zh" ? "32题版与56题版均为费马原创；56题沿用自有小程序已公开试用的题本、原始选择次数与方向解释，英文为本次工作译本。两版尚无已建立的心理测量验证或跨语言等值，不继承背景理论或其他测评的效度。" : "Both editions are original FermatMind work. The 56-choice edition reuses our Mini public-preview bank, raw selection counts and direction explanations; English is a working translation for this edition. Neither edition has established psychometric validation or language equivalence, and neither inherits validity from background theory or another assessment."}</p><p>{locale === "zh" ? "56题版题本／计分版本" : "56-choice bank / scoring edition"}: {bank.source.itemBankVersion} / {bank.source.scoringVersion}. {locale === "zh" ? "32题版保留独立题本与均值规则。" : "The 32-rating edition retains its separate bank and mean rules."}</p>{quiz.references?.map(r => <p key={r.url}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></p>)}</aside>;
}
export function CognitiveFunctionsPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (!isCognitiveFunctionsPageAvailable(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="cognitive-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="cognitive-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={`/${locale}/tests#more-tests`}>{zh ? "全部测试" : "All tests"}</Link></nav>
    <p className="text-sm font-semibold text-violet-800">{zh ? "32条自评／56题二选一 · 全部解释免费" : "32 ratings / 56 choices · All explanations free"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <p className="mt-3 text-sm leading-7">{zh ? "32题约10分钟；56题约15分钟，均为估计，不限时，无需注册。" : "About 10 minutes for 32 ratings or 15 for 56 choices. Both are estimates, untimed and require no signup."}</p>
    <CognitiveFunctionsVersions key={locale} locale={locale} />
    <section aria-labelledby="paired56-method" className="my-10 space-y-5"><h2 id="paired56-method" className="text-2xl font-semibold">{zh ? "56题版：怎样计数与阅读" : "56 choices: counting and reading"}</h2><p className="leading-8">{bank.questions[0].instruction[locale]}</p>{Object.entries(content.common).map(([key, p]) => <p key={key} className="leading-8">{p[locale]}</p>)}</section>
    <section aria-labelledby="ratings32-method" className="my-10 space-y-6"><h2 id="ratings32-method" className="text-2xl font-semibold">{zh ? "32题版：独立自评与均值" : "32 ratings: separate self-report and means"}</h2><p className="leading-8">{quiz.instructions?.[locale]}</p>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="cognitive-public-guides" className="my-10"><h2 id="cognitive-public-guides" className="text-2xl font-semibold">{zh ? "八个方向的完整公开指南" : "Eight complete public direction guides"}</h2><p className="my-4 leading-8">{zh ? "无需作答。每页分别标明32题均值读法与56题二选一读法，不含个人结果。" : "Read without answering. Each page separates the 32-rating and 56-choice readings and contains no personal result."}</p><ul>{quiz.profiles.map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <section className="my-10 space-y-6"><h2 className="text-2xl font-semibold">{zh ? "常见问题" : "Frequently asked questions"}</h2>{quiz.faq.map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <Source quiz={quiz} locale={locale} />
  </Container></main>;
}
export function CognitiveFunctionsGuidePage({ quiz, profile, locale }: { quiz: Questionnaire; profile: QuestionnaireProfile; locale: Locale }) {
  if (!isCognitiveFunctionsPageAvailable(quiz)) notFound();
  const zh = locale === "zh", card = content.cards.find(c => c.id === profile.id), entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  if (!card) notFound();
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="cognitive-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="cognitive-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <nav aria-label={zh ? "面包屑" : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <h1 className="text-4xl font-semibold leading-tight">{profile.title[locale]}</h1><p className="my-5 leading-8">{zh ? "本页对所有人相同，不含个人回答、均值、选择次数或类型。两版是不同作答方法，数字不相互换算。" : "This page is identical for everyone and contains no personal responses, means, selection counts or type. The editions use different response methods; their numbers are not converted into one another."}</p>
    <nav aria-label={zh ? "本页两种方法" : "Two methods on this page"} className="my-5 flex flex-wrap gap-5"><a className="min-h-11 py-2 underline" href="#ratings32">{zh ? "32题自评版读法" : "32-rating reading"}</a><a className="min-h-11 py-2 underline" href="#paired56">{zh ? "56题二选一版读法" : "56-choice reading"}</a></nav>
    <section id="ratings32" className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7"><h2 className="mb-5 text-2xl font-semibold">{zh ? "32题自评版：均值与情境" : "32-rating edition: means and situations"}</h2><QuestionnaireReport profile={profile} locale={locale} headingLevel={3} idPrefix="report" /></section>
    <section id="paired56" className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7"><h2 className="mb-5 text-2xl font-semibold">{zh ? "56题二选一版：本题组的相对选择" : "56-choice edition: relative choices in this set"}</h2><p className="mb-4 leading-8">{content.common.relative_score_explanation[locale]}</p><Jung56GuideContent card={card} locale={locale} idPrefix="public-jung56" headingLevel={3} /><p className="mt-5 leading-8">{content.common.no_norms_or_percentiles[locale]}</p></section>
    <Source quiz={quiz} locale={locale} /><section className="my-8"><h2 className="text-xl font-semibold">{zh ? "其他方向的完整指南" : "Complete guides to the other directions"}</h2><ul>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "返回入口，选择作答方法" : "Return to the entry and choose a method"}</Link>
  </Container></main>;
}
