import { EightQuizOverview } from "./EightQuizOverview";
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
import { spiritAnimalSections, spiritAnimalFaq, spiritAnimalSummaries, spiritAnimalVisiblePrivacyAnswer } from "./SpiritAnimalLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#spirit-animal-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function SpiritAnimalPage({ quiz, locale, take = false, displayLocale = locale, overviewCopy }: {
  quiz: Questionnaire; locale: Locale; take?: boolean; displayLocale?: DisplayLocale; overviewCopy?: (text: string) => string;
}) {
  if (quiz.slug !== "spirit-animal" || !isArchetypeConfigurationValid(quiz)) notFound();
  const traditional = displayLocale === "zh-TW";
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = questionnairePath(displayLocale, quiz.slug);
  const Surface = traditional ? "div" : "main";
  const sections = traditional ? archetypeEditorial(quiz.slug, "sections", spiritAnimalSections) : spiritAnimalSections;
  const faq = traditional ? archetypeEditorial(quiz.slug, "faq", spiritAnimalFaq) : spiritAnimalFaq;
  const summaries = traditional ? archetypeEditorial(quiz.slug, "summaries", spiritAnimalSummaries) : spiritAnimalSummaries;
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <Surface className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    {!traditional && <>
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: text("全部测试", "All tests", "全部測驗"), path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    </>}
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{text("18题 · 约4分钟 · 无需注册", "18 questions · About 4 minutes · No registration", "18 題 · 約 4 分鐘 · 不用註冊")}</span><span>{text("九种动物比喻 · 完整结果免费", "Nine animal metaphors · Full results free", "九種動物比喻 · 完整結果免費")}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} displayLocale={displayLocale} />
    </ExploreTestIntro>
    <EightQuizOverview quiz={quiz} locale={locale} traditionalCopy={overviewCopy} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="spirit-animal-purpose"><h2 id="spirit-animal-purpose" className="text-2xl font-semibold">{sections[0].title[locale]}</h2>{sections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="spirit-animal-methods"><h2 id="spirit-animal-methods">{text("动物比喻的计分、解释与证据", "Animal metaphor scoring, interpretation and evidence", "動物比喻的計分、解釋與證據")}</h2><div className="explore-reading-sections">{[...sections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`spirit-animal-method-${s.id}`}><h3 id={`spirit-animal-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="spirit-animal-library"><h2 id="spirit-animal-library" className="text-2xl font-semibold">{text("九种动物：完整公开结果指南", "Nine animals: complete public result guides", "九種動物：完整公開結果指南")}</h2><p className="my-4 leading-8">{text("每篇指南均可直接打开阅读全文，包括具体情境、可能帮助、取舍、相近结果比较和自愿的小尝试。公开指南不含私人答案或计数，动物之间没有优劣排名。", "Open any guide for its full text: situations, possible contributions, tradeoffs, comparisons and an optional small experiment. Public guides contain no private answers or counts, and animals are not ranked by value.", "每份指南都能直接閱讀全文，包含具體情境、可能的幫助、取捨、相近結果比較，以及可自願嘗試的小練習。公開指南不含私人答案或計數，動物之間沒有高低排名。")}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(displayLocale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{summaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="spirit-animal-faq"><h2 id="spirit-animal-faq" className="text-2xl font-semibold">{text("精神动物测试常见问题", "Spirit animal test frequently asked questions", "精神動物測驗常見問題")}</h2>{[...quiz.faq, ...faq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.question.en === "Are results free, and does sharing reveal my answers?" ? (traditional ? archetypePrivacyAnswer(quiz.slug) : spiritAnimalVisiblePrivacyAnswer(locale)) : f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="spirit-animal-references"><h2 id="spirit-animal-references" className="text-xl font-semibold">{text("动物意象的文化语境：延伸资料", "Animal imagery in cultural context: further reading", "動物意象的文化脈絡：延伸資料")}</h2><ul className="mt-4"><li id="spirit-animal-reference-1"><a className="underline" href="https://americanindian.si.edu/nk360/informational/native-american-spirit-animal" rel="noopener noreferrer">{text("美国印第安人国家博物馆 · Honoring Animal Relatives", "National Museum of the American Indian · Honoring Animal Relatives", "美國印第安人國家博物館 · Honoring Animal Relatives")}</a></li></ul></section>
  </Container></Surface>;
}
