import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import { writtenLandingSections, writtenLandingFaq } from "./WrittenCoordinationLandingEditorial";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { WrittenCoordinationQuiz } from "@/lib/questionnaires/writtenCoordination";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { prepareResultProfile } from "@/lib/questionnaires/result-content/readings";
import { WrittenCoordinationClient } from "./WrittenCoordinationClient";
import { WrittenCoordinationGrid } from "./WrittenCoordinationGrid";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#written-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
function Context({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <aside data-written-context className="my-6 space-y-3 rounded-lg border border-violet-200 bg-violet-50 p-4 leading-7">
    <p>{zh ? "这是原创书面协调练习。卡片、题目、规则、地图和读法均由费马编写，不是官方CritiCall题本、获授权模拟或调度员资格测评，与Biddle Consulting Group或CritiCall没有关联或背书。" : "This is original written coordination practice. FermatMind authored the cards, questions, rules, map and readings. It is not an official CritiCall form, authorized simulation or dispatcher qualification, and is not affiliated with or endorsed by Biddle Consulting Group or CritiCall."}</p>
    <p className="text-sm">{zh ? "材料为英文，说明与解析双语提供。没有音频、并发提醒或真实应急处理；虚构排序与地图不能用于真实来电或导航。未建立常模、招聘效度、训练效果或英中文表现等值。" : "Stimuli are English, with bilingual instructions and explanations. There is no audio, concurrent alert or real emergency handling. The fictional ordering and map cannot be used for real calls or navigation. No norms, hiring validity, training effect or English–Chinese performance equivalence has been established."}</p>
  </aside>;
}
function Library({ quiz, locale, selected }: { quiz: WrittenCoordinationQuiz; locale: Locale; selected?: string }) {
  const zh = locale === "zh";
  return <section className="my-10" aria-labelledby="written-guide-library"><h2 id="written-guide-library" className="text-2xl font-semibold">{zh ? "六篇完整公开练习指南" : "Six complete public practice guides"}</h2>
    <p className="my-4 leading-7">{zh ? "每篇都能在练习前阅读，任何回答或未尝试状态均不限制全文。它们解释六项不同任务，不是六个成绩档位或个人类型。" : "Read every guide before practising. No response pattern or unattempted state limits the full text. These explain six different tasks, not six score bands or personal types."}</p>
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.filter(p => p.id !== selected).map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 text-lg font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{p.summary[locale]}</p></li>)}</ul>
  </section>;
}
function Reading({ quiz, profile, locale, idPrefix }: { quiz: WrittenCoordinationQuiz; profile: QuestionnaireProfile; locale: Locale; idPrefix: string }) {
  return <section data-written-full-guide={profile.id} className="my-10 border-t border-slate-200 pt-7">
    <h2 className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h2>
    {profile.id === "map" && <WrittenCoordinationGrid grid={quiz.coordination.grid} locale={locale} idPrefix={`${idPrefix}-grid`} />}
    <QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={3} idPrefix={idPrefix} />
  </section>;
}
export function WrittenCoordinationPage({ quiz, locale , take = false }: { quiz: WrittenCoordinationQuiz; locale: Locale ; take?: boolean }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug);
  const engine = <WrittenCoordinationClient quiz={quiz} locale={locale} />;
  if (take) return <>{engine}<section className="mt-8 space-y-4" aria-label={zh ? "完整练习指南" : "Complete practice guides"}>{quiz.profiles.map(profile => <details key={profile.id} className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold">{profile.title[locale]}</summary><Reading quiz={quiz} profile={profile} locale={locale} idPrefix={`written-take-${profile.id}`} /></details>)}</section></>;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path: entry }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path: entry, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1>
    <p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
    <p className="explore-intro-meta">{zh ? "六项独立练习 · 约18分钟 · 无需注册 · 完整指南免费" : "Six independent exercises · about 18 minutes · no signup · full guides free"}</p>
    <QuestionnaireTakeEntry quiz={{ slug: quiz.slug }} locale={locale} />
    </ExploreTestIntro>

    <section className="my-8 space-y-4 leading-8" aria-labelledby="written-purpose"><h2 id="written-purpose">{writtenLandingSections[0].title[locale]}</h2>{writtenLandingSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p><Context locale={locale} /></section>
    <section className="explore-reading-library" aria-labelledby="written-methods"><h2 id="written-methods">{zh ? "书面协调练习方法：任务规则、计分算例与研究范围" : "Written coordination methods: task rules, worked scoring and evidence"}</h2><div className="explore-reading-sections">{[...writtenLandingSections.slice(1), ...quiz.guide].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`written-method-${s.id}`}><h3 id={`written-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <Library quiz={quiz} locale={locale} />
    {quiz.profiles.map(p => <Reading key={p.id} quiz={quiz} profile={p} locale={locale} idPrefix={`written-public-${p.id}`} />)}
    <section className="my-10 space-y-5" aria-labelledby="written-faq"><h2 id="written-faq" className="text-2xl font-semibold">{zh ? "书面协调技能练习常见问题" : "Written coordination practice FAQ"}</h2>{[...quiz.faq, ...writtenLandingFaq].map((item, i) => <div key={i}><h3 className="font-semibold">{item.question[locale]}</h3><p className="mt-2 leading-8"><Copy text={item.answer[locale]} /></p></div>)}</section>
    <section className="my-8" aria-labelledby="written-references"><h2 id="written-references" className="text-xl font-semibold">{zh ? "公开产品背景与区分" : "Public product background and distinctions"}</h2><ul className="mt-4 space-y-3">{quiz.references!.map(r => <li key={r.url} id={`written-reference-${quiz.references!.indexOf(r) + 1}`}><a className="underline" href={r.url} rel="noopener noreferrer">{r.title[locale]}</a></li>)}</ul></section>
  </Container></main>;
}
export function WrittenCoordinationGuidePage({ quiz, profile, locale }: { quiz: WrittenCoordinationQuiz; profile: QuestionnaireProfile; locale: Locale }) {
  const zh = locale === "zh", entry = questionnairePath(locale, quiz.slug), path = questionnaireGuidePath(locale, quiz.slug, profile.id);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: profile.title[locale], description: profile.summary[locale], locale })} />
    <Link prefetch={false} className="mb-6 inline-block min-h-11 py-2 underline" href={entry}>{quiz.title[locale]}</Link>
    <p className="text-sm font-semibold text-violet-800">{zh ? "完整公开练习指南" : "Complete public practice guide"}</p>
    <h1 className="mt-3 text-4xl font-semibold leading-tight">{profile.title[locale]}</h1>
    <p className="my-5 leading-8 text-slate-600">{zh ? "本页是人人相同的完整任务读法，不含个人练习输入、数量或成绩。无需先答题，也没有按分数选中的等级。" : "This is the same full task reading for everyone, without personal exercise input, counts or results. No prior answers are needed and no score selects a level."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={`${entry}#take-test`}>{zh ? "选择一项免费练习" : "Choose a free practice module"}</Link>
    <Context locale={locale} />
    {profile.id === "map" && <WrittenCoordinationGrid grid={quiz.coordination.grid} locale={locale} idPrefix="written-guide-grid" />}
    <div data-written-full-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={prepareResultProfile(quiz.slug, profile)} locale={locale} headingLevel={2} idPrefix="report" /></div>
    <Library quiz={quiz} locale={locale} selected={profile.id} />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`${entry}#take-test`}>{zh ? "返回六模块练习" : "Return to the six practice modules"}</Link>
  </Container></main>;
}
