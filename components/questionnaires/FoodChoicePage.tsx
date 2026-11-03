import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isQuestionnaireConfigurationValid } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { foodChoiceSections, foodChoiceFaq, foodChoiceSummaries } from "./FoodChoiceLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#food-choice-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function FoodChoicePage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (quiz.slug !== "food-choice" || !isQuestionnaireConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "12题 · 约3分钟 · 无需注册" : "12 pairs · About 3 minutes · No registration"}</span><span>{zh ? "三种菜单呈现 · 七份完整指南" : "Three presentation styles · Seven complete guides"}</span></div>
      <QuestionnaireClient quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="food-choice-purpose"><h2 id="food-choice-purpose" className="text-2xl font-semibold">{foodChoiceSections[0].title[locale]}</h2>{foodChoiceSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "食物呈现选择怎样计分与阅读" : "How presentation choices are counted and read"}</h2>{quiz.guide.filter(s => ["original-scope", "counting", "close-results"].includes(s.id)).flatMap(s => s.paragraphs).map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="food-choice-methods"><h2 id="food-choice-methods">{zh ? "菜单呈现、计数示例与研究依据" : "Menu presentation, worked counts and research context"}</h2><div className="explore-reading-sections">{[...foodChoiceSections.slice(1), ...quiz.guide.filter(s => !["original-scope", "counting", "close-results"].includes(s.id)).map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`food-choice-method-${s.id}`}><h3 id={`food-choice-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section id="questionnaire-results" className="my-8" aria-labelledby="food-choice-library"><h2 id="food-choice-library" className="text-2xl font-semibold">{zh ? "食物选择结果：七份完整公开指南" : "Food choice results: seven complete public guides"}</h2><p className="my-4 leading-8">{zh ? "七篇指南均可直接阅读全文，包括含义、虚构情境、相近结果区别、反例、计分与可选观察。公开指南不含访客私人回答或次数。" : "Read all seven complete guides for meanings, fictional scenes, distinctions, counterexamples, counting and optional observations. Public guides contain no visitor responses or counts."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{foodChoiceSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="food-choice-faq"><h2 id="food-choice-faq" className="text-2xl font-semibold">{zh ? "食物选择测试常见问题" : "Food choice test: frequently asked questions"}</h2>{[...quiz.faq, ...foodChoiceFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="food-choice-references"><h2 id="food-choice-references" className="text-xl font-semibold">{zh ? "食物线索与社会意义参考资料" : "Food cues and social meaning: references"}</h2><ol className="mt-4 space-y-2">{(quiz.references ?? []).map((ref, i) => <li key={ref.url} id={`food-choice-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
