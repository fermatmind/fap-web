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
import { dogBreedSections, dogBreedFaq, dogBreedSummaries, dogBreedVisibleFaqAnswer } from "./DogBreedLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#dog-breed-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function DogBreedPage({ quiz, locale, take = false, displayLocale = locale }: { quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale }) {
  if (quiz.slug !== "what-dog-breed-am-i" || !isArchetypeConfigurationValid(quiz)) notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = questionnairePath(displayLocale, quiz.slug);
  const Surface = traditional ? "div" : "main";
  const sections = traditional ? archetypeEditorial(quiz.slug, "sections", dogBreedSections) : dogBreedSections;
  const faq = traditional ? archetypeEditorial(quiz.slug, "faq", dogBreedFaq) : dogBreedFaq;
  const summaries = traditional ? archetypeEditorial(quiz.slug, "summaries", dogBreedSummaries) : dogBreedSummaries;
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("12题 · 约3分钟 · 无需注册", "12 questions · About 3 minutes · No registration", "12題 · 約3分鐘 · 無需註冊")}</span><span>{text("六种犬系比喻 · 完整结果免费", "Six breed metaphors · Full results free", "六種犬系比喻 · 完整結果免費")}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="dog-breed-purpose"><h2 id="dog-breed-purpose" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="dog-breed-methods"><h2 id="dog-breed-methods">{text("犬系结果的计分、解释与研究证据", "Breed metaphor scoring, interpretation and research evidence", "犬繫結果的計分、解釋與研究證據")}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`dog-breed-method-${s.id}`}><h3 id={`dog-breed-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="dog-breed-library"><h2 id="dog-breed-library" className="text-2xl font-semibold">{text("六种犬系结果：完整公开指南", "Six dog-breed results: complete public guides", "六種犬繫結果：完整公開指南")}</h2><p className="my-4 leading-8">{text("每篇指南均可直接打开阅读全文，包括具体情境、可能帮助、取舍、相近结果比较和自愿的小尝试。公开指南不含私人答案或计数，犬系结果没有优劣排名。", "Open any guide for its full text: situations, possible contributions, tradeoffs, comparisons and an optional small experiment. Public guides contain no private answers or counts, and breed results are not ranked by value.", "每篇指南均可直接開啟閱讀全文，包括具體情境、可能幫助、取捨、相近結果比較和自願的小嚐試。公開指南不含私人答案或計數，犬繫結果沒有優劣排名。")}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{summaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="dog-breed-faq"><h2 id="dog-breed-faq" className="text-2xl font-semibold">{text("犬系人格测试常见问题", "Dog personality quiz frequently asked questions", "犬系人格測驗常見問題")}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{traditional && f.question.en === "How do drafts, retaking and sharing work?" ? archetypePrivacyAnswer(quiz.slug) : dogBreedVisibleFaqAnswer(f, locale)}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="dog-breed-references"><h2 id="dog-breed-references" className="text-xl font-semibold">{text("研究阅读：犬种与真实犬类行为", "Research reading: ancestry and actual canine behaviour", "研究閱讀：犬種與真實犬類行為")}</h2><ul className="mt-4"><li id="dog-breed-reference-1"><a className="underline" href="https://pubmed.ncbi.nlm.nih.gov/35482869/" rel="noopener noreferrer">{text("Morrill等（2022）· 犬类祖源与犬种刻板印象研究", "Morrill et al. (2022) · Ancestry-inclusive dog genomics challenges popular breed stereotypes", "Morrill等（2022）· 犬類祖源與犬種刻板印象研究")}</a></li></ul></section>
  </Container></Surface>;
}
