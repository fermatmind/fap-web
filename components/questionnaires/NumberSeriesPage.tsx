import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isPracticeConfigurationValid } from "@/lib/questionnaires/practice";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { numberSeriesSections, numberSeriesFaq, numberSeriesSummaries } from "./NumberSeriesLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#number-series-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function NumberSeriesPage({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  if (quiz.slug !== "number-series" || !isPracticeConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "30题 · 约18分钟 · 无需注册" : "30 questions · About 18 minutes · No registration"}</span><span>{zh ? "原创练习题 · 五类规则 · 逐题解析免费" : "Original practice bank · Five rule families · Worked answers free"}</span></div>
      <QuestionnaireClient quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="number-series-purpose"><h2 id="number-series-purpose" className="text-2xl font-semibold">{numberSeriesSections[0].title[locale]}</h2>{numberSeriesSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "五组正确数怎样计算" : "How the five topic counts are calculated"}</h2>{quiz.guide.find(s => s.id === "scoring")!.paragraphs.map((p,i) => <p key={i}>{p[locale]}</p>)}</section>
    <section className="explore-reading-library" aria-labelledby="number-series-methods"><h2 id="number-series-methods">{zh ? "数列练习方法、计分与解释范围" : "Number series methods, scoring and interpretation"}</h2><div className="explore-reading-sections">{[...numberSeriesSections.slice(1), ...quiz.guide.filter(s => s.id !== "scoring").map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`number-series-method-${s.id}`}><h3 id={`number-series-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="number-series-library"><h2 id="number-series-library" className="text-2xl font-semibold">{zh ? "五类数列：完整专题指南" : "Five sequence topics: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇指南均可直接打开阅读全文，包括规则条件、另例推导、常见错因与复习方法。公开指南不含私人答案或计数，五个专题不是能力等级。" : "Open any guide for its full text: rule conditions, additional worked examples, common errors and review methods. Public guides contain no private answers or counts, and topics are not ability tiers."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{numberSeriesSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="number-series-faq"><h2 id="number-series-faq" className="text-2xl font-semibold">{zh ? "数列推理练习常见问题" : "Number series practice frequently asked questions"}</h2>{[...quiz.faq, ...numberSeriesFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="number-series-references"><h2 id="number-series-references" className="text-xl font-semibold">{zh ? "数学学习资料" : "Mathematics learning references"}</h2><ol className="mt-4 space-y-2">{quiz.references.map((ref, i) => <li key={ref.url} id={`number-series-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
