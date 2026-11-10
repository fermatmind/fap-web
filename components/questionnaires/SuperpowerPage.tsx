import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { archetypeEditorial, archetypePrivacyAnswer } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { superpowerSections, superpowerFaq, superpowerSummaries, superpowerVisibleFaqAnswer } from "./SuperpowerLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#superpower-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function SuperpowerPage({ quiz, locale, take = false, displayLocale = locale }: { quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "superpower-test" || !isArchetypeConfigurationValid(quiz)) notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = questionnairePath(displayLocale, quiz.slug);
  const Surface = traditional ? "div" : "main";
  const sections = traditional ? archetypeEditorial(quiz.slug, "sections", superpowerSections) : superpowerSections;
  const faq = traditional ? archetypeEditorial(quiz.slug, "faq", superpowerFaq) : superpowerFaq;
  const summaries = traditional ? archetypeEditorial(quiz.slug, "summaries", superpowerSummaries) : superpowerSummaries;
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("20题 · 约5分钟 · 无需注册", "20 questions · About 5 minutes · No registration", "20題 · 約5分鐘 · 無需註冊")}</span><span>{text("五种日常偏好比喻 · 完整结果免费", "Five everyday preference metaphors · Full results free", "五種日常偏好比喻 · 完整結果免費")}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="superpower-purpose"><h2 id="superpower-purpose" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="superpower-methods"><h2 id="superpower-methods">{text("超能力结果：计分、区别与研究证据", "Superpower results: scoring, distinctions and evidence", "超能力結果：計分、區別與研究證據")}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`superpower-method-${s.id}`}><h3 id={`superpower-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="superpower-library"><h2 id="superpower-library" className="text-2xl font-semibold">{text("五种超能力：完整公开指南", "Five superpowers: complete public guides", "五種超能力：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇指南均可直接打开阅读全文，包括具体情境、可能帮助、取舍、相近结果比较和自愿的小尝试。公开指南不含私人答案或计数，五种结果没有优劣排名。", "Open any guide for its full text: situations, possible contributions, tradeoffs, comparisons and an optional small experiment. Public guides contain no private answers or counts, and powers are not ranked by value.", "每篇指南均可直接開啟閱讀全文，包括具體情境、可能幫助、取捨、相近結果比較和自願的小嚐試。公開指南不含私人答案或計數，五種結果沒有優劣排名。")}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{summaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="superpower-faq"><h2 id="superpower-faq" className="text-2xl font-semibold">{text("超能力测试常见问题", "Superpower test frequently asked questions", "超能力測驗常見問題")}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{traditional && f.question.en === "Do drafts, retaking or sharing include my answers?" ? archetypePrivacyAnswer(quiz.slug) : superpowerVisibleFaqAnswer(f, locale)}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="superpower-references"><h2 id="superpower-references" className="text-xl font-semibold">{text("研究阅读：理解他人与核对猜测", "Research reading: understanding others and checking assumptions", "研究閱讀：理解他人與核對猜測")}</h2><ul className="mt-4"><li id="superpower-reference-1"><a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/29620401/" rel="noopener noreferrer">{text("Eyal等（2018）· 获取视角与设想视角的实验研究", "Eyal et al. (2018) · Perspective mistaking", "Eyal等（2018）· 獲取視角與設想視角的實驗研究")}</a></li></ul></section>
  </Container></Surface>;
}
