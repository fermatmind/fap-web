import type { TraditionalCognitive } from "@/lib/i18n/zh-TW/likertQuestionnaires";
import { Fragment } from "react";
import { cognitiveSections, cognitiveFaq, cognitiveSummaries, cognitiveExtraReferences } from "./CognitiveFunctionsLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { questionnairePath, questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import type { Questionnaire, QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import originalBank from "@/lib/questionnaires/jung56Bank.json";
import rawContent from "@/lib/questionnaires/jung56Content.json";
import { isJung56ConfigurationValid, isJung56ContentValid, type Jung56Content } from "@/lib/questionnaires/jung56";
import { CognitiveFunctionsVersions } from "./CognitiveFunctionsVersions";
import { Jung56GuideContent } from "./Jung56GuideContent";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { getJung56ResultReading } from "@/lib/questionnaires/result-content/jung56-readings";
const originalContent = rawContent as Jung56Content;
const originalCopy = (text: string) => text;

type CognitivePageProps = {
  quiz: Questionnaire;
  locale: Locale;
  displayLocale?: DisplayLocale;
  traditional?: TraditionalCognitive;
  copy?: (text: string) => string;
};
function EditorialCopy({ text }: { text: string }) {
 return <>{text.split(/(\[\d+\])/g).map((part,i)=>/^\[\d+\]$/.test(part)?<sup key={i}><a className="ml-1 underline" href={`#cognitive-reference-${part.slice(1,-1)}`}>{part}</a></sup>:<Fragment key={i}>{part}</Fragment>)}</>;
}
export function isCognitiveFunctionsPageAvailable(quiz: Questionnaire) {
  return quiz.slug === "cognitive-functions-test" && quiz.kind === "likert" && quiz.code === "FM_COGNITIVE_FUNCTIONS32"
    && quiz.source.itemBankSha256 === "7e1297d73ba66b1ebde6551a00ba79eebcffce9537a0caa39d0aa7b14fd9eb50"
    && quiz.source.resultContentSha256 === "08e4138e318ae91043e1172a285ae3f2b2648898d5545a7376d5bb04d8e7ead1"
    && isQuestionnaireConfigurationValid(quiz) && isJung56ConfigurationValid(originalBank) && isJung56ContentValid(rawContent);
}
function Source({ quiz, locale, traditional, copy = originalCopy }: CognitivePageProps) {
  return <aside className="my-8 space-y-3 border-t pt-6 text-sm leading-7 text-slate-600" data-jung56-source><p>{locale === "zh" ? copy("32题版与56题版均为费马原创；56题版保留费马早期公开题本的题目、原始选择次数与方向解释，英文为本次工作译本。两版尚无已建立的心理测量验证或跨语言等值，不继承背景理论或其他测评的效度。") : "Both editions are original FermatMind work. The 56-choice edition retains the original FermatMind question set, raw selection counts and direction explanations; English is a working translation for this edition. Neither edition has established psychometric validation or language equivalence, and neither inherits validity from background theory or another assessment."}</p>{[...(quiz.references ?? []), ...(traditional?.extraReferences ?? cognitiveExtraReferences)].map((r,i) => <p key={r.url} id={`cognitive-reference-${i+1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{i+1}. {r.title[locale]}</a></p>)}</aside>;
}
export function CognitiveFunctionsPage({ quiz, locale, displayLocale = locale, traditional, copy = originalCopy }: CognitivePageProps) {
  if (!isCognitiveFunctionsPageAvailable(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(displayLocale, quiz.slug);
  const bank = traditional?.paired.bank ?? originalBank;
  const content = traditional?.paired.content ?? originalContent;
  const sections = traditional?.sections ?? cognitiveSections;
  const summaries = traditional?.summaries ?? cognitiveSummaries;
  const faq = traditional?.faq ?? cognitiveFaq;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="cognitive-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: zh ? copy("全部测试") : "All tests", path: `/${displayLocale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="cognitive-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale: displayLocale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>

    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <div className="explore-intro-meta"><span>{zh ? copy("32题约10分钟；56题约15分钟，均为估计，不限时，无需注册。") : "About 10 minutes for 32 ratings or 15 for 56 choices. Both are estimates, untimed and require no signup."}</span><span>{zh ? copy("32条自评／56题二选一 · 全部解释免费") : "32 ratings / 56 choices · All explanations free"}</span></div>
    <CognitiveFunctionsVersions key={displayLocale} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="cognitive-purpose"><h2 id="cognitive-purpose" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p,i)=><p key={i}><EditorialCopy text={p[locale]}/></p>)}</section>
    <section className="explore-reading-library" aria-labelledby="cognitive-methods"><h2 id="cognitive-methods">{zh ? copy("八方向、两种计分与研究证据") : "Eight directions, two calculations and research evidence"}</h2><div className="explore-reading-sections">{sections.slice(1).map(s=><section key={s.id} className="explore-reading-section" aria-labelledby={`cognitive-method-${s.id}`}><h3 id={`cognitive-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p,i)=><p key={i}><EditorialCopy text={p[locale]}/></p>)}</div></section>)}</div></section>
    <section aria-labelledby="paired56-method" className="my-10 space-y-5"><h2 id="paired56-method" className="text-2xl font-semibold">{zh ? copy("56题版：怎样计数与阅读") : "56 choices: counting and reading"}</h2><p className="leading-8">{bank.questions[0].instruction[locale]}</p>{Object.entries(content.common).map(([key, p]) => <p key={key} className="leading-8">{p[locale]}</p>)}</section>
    <section aria-labelledby="ratings32-method" className="my-10 space-y-6"><h2 id="ratings32-method" className="text-2xl font-semibold">{zh ? copy("32题版：独立自评与均值") : "32 ratings: separate self-report and means"}</h2><p className="leading-8">{quiz.instructions?.[locale]}</p>{quiz.guide.map(s => <section key={s.id}><h3 className="text-xl font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p, i) => <p key={i} className="mt-3 leading-8">{p[locale]}</p>)}</section>)}</section>
    <section aria-labelledby="cognitive-public-guides" className="my-10"><h2 id="cognitive-public-guides" className="text-2xl font-semibold">{zh ? copy("八个方向的完整公开指南") : "Eight complete public direction guides"}</h2><p className="my-4 leading-8">{zh ? copy("无需作答。每页分别标明32题均值读法与56题二选一读法，不含个人结果。") : "Read without answering. Each page separates the 32-rating and 56-choice readings and contains no personal result."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-5"><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{summaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-6" aria-labelledby="cognitive-faq"><h2 id="cognitive-faq" className="text-2xl font-semibold">{zh ? copy("认知功能测试常见问题") : "Cognitive functions frequently asked questions"}</h2>{[...quiz.faq, ...faq].map((f, i) => <section key={i}><h3 className="text-lg font-semibold">{f.question[locale]}</h3><p className="mt-2 leading-8">{f.answer[locale]}</p></section>)}</section>
    <Source quiz={quiz} locale={locale} traditional={traditional} copy={copy} />
  </Container></main>;
}
export function CognitiveFunctionsGuidePage({ quiz, profile, locale, displayLocale = locale, traditional, copy = originalCopy }: CognitivePageProps & { profile: QuestionnaireProfile }) {
  if (!isCognitiveFunctionsPageAvailable(quiz)) notFound();
  const content = traditional?.paired.content ?? originalContent;
  const zh = locale === "zh", card = content.cards.find(c => c.id === profile.id), entry = questionnairePath(displayLocale, quiz.slug), path = questionnaireGuidePath(displayLocale, quiz.slug, profile.id);
  if (!card) notFound();
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="cognitive-guide-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${displayLocale}` }, { name: quiz.title[locale], path: entry }, { name: profile.title[locale], path }])} />
    <JsonLd id="cognitive-guide-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale: displayLocale })} />
    <nav aria-label={zh ? copy("面包屑") : "Breadcrumb"} className="mb-6 text-sm"><Link prefetch={false} className="underline" href={entry}>{quiz.title[locale]}</Link></nav>
    <h1 className="text-4xl font-semibold leading-tight">{profile.title[locale]}</h1><p className="my-5 leading-8">{zh ? copy("本页对所有人相同，不含个人回答、均值、选择次数或类型。两版是不同作答方法，数字不相互换算。") : "This page is identical for everyone and contains no personal responses, means, selection counts or type. The editions use different response methods; their numbers are not converted into one another."}</p>
    <nav aria-label={zh ? copy("本页两种方法") : "Two methods on this page"} className="my-5 flex flex-wrap gap-5"><a className="min-h-11 py-2 underline" href="#ratings32">{zh ? copy("32题自评版读法") : "32-rating reading"}</a><a className="min-h-11 py-2 underline" href="#paired56">{zh ? copy("56题二选一版读法") : "56-choice reading"}</a></nav>
    <section id="ratings32" className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7"><h2 className="mb-5 text-2xl font-semibold">{zh ? copy("32题自评版：均值与情境") : "32-rating edition: means and situations"}</h2><QuestionnaireResultReading quizSlug={quiz.slug} profile={traditional ? profile : prepareResultProfile(quiz.slug, profile)} locale={locale} traditional={Boolean(traditional)} headingLevel={3} idPrefix="report" /></section>
    <section id="paired56" className="my-8 scroll-mt-24 rounded-xl border bg-white p-5 sm:p-7"><h2 className="mb-5 text-2xl font-semibold">{zh ? copy("56题二选一版：本题组的相对选择") : "56-choice edition: relative choices in this set"}</h2><p className="mb-4 leading-8">{content.common.relative_score_explanation[locale]}</p><Jung56GuideContent copy={copy} card={card} reading={traditional?.readings.find(reading => reading.profileId === card.id) ?? getJung56ResultReading(card.id)} locale={locale} idPrefix="public-jung56" headingLevel={3} /><p className="mt-5 leading-8">{content.common.no_norms_or_percentiles[locale]}</p></section>
    <Source quiz={quiz} locale={locale} traditional={traditional} copy={copy} /><section className="my-8"><h2 className="text-xl font-semibold">{zh ? copy("其他方向的完整指南") : "Complete guides to the other directions"}</h2><ul>{quiz.profiles.filter(p => p.id !== profile.id).map(p => <li key={p.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link></li>)}</ul></section>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? copy("返回入口，选择作答方法") : "Return to the entry and choose a method"}</Link>
  </Container></main>;
}
