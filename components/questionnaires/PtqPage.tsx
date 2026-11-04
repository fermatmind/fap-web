import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isPtq15ConfigurationValid } from "@/lib/questionnaires/ptq15";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { ptqSections, ptqFaq, ptqSummaries } from "./PtqLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#overthinking-screener-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function PtqPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "overthinking-screener" || !isPtq15ConfigurationValid(quiz) || !quiz.references) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "15项 · 约5分钟 · 无需注册" : "15 items · About 5 minutes · No registration"}</span><span>{zh ? "总分与三个分量表 · 四篇全文免费" : "Total and three subscales · Four full readings free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="overthinking-screener-purpose"><h2 id="overthinking-screener-purpose" className="text-2xl font-semibold">{ptqSections[0].title[locale]}</h2>{ptqSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="questionnaire-method"><h2 id="questionnaire-method" className="text-2xl font-semibold">{zh ? "PTQ题本、计分与来源说明" : "PTQ items, scoring and source attribution"}</h2>{quiz.guide.map(s => <Fragment key={s.id}><h3 className="font-semibold">{s.title[locale]}</h3>{s.paragraphs.map((p,i) => <p key={i}>{p[locale]}</p>)}</Fragment>)}</section>
    <section className="explore-reading-library" aria-labelledby="overthinking-screener-methods"><h2 id="overthinking-screener-methods">{zh ? "PTQ深入解读：思维过程、原始分与研究证据" : "PTQ in depth: thinking processes, raw scores and research evidence"}</h2><div className="explore-reading-sections">{ptqSections.slice(1).map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`overthinking-screener-method-${s.id}`}><h3 id={`overthinking-screener-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="overthinking-screener-library"><h2 id="overthinking-screener-library" className="text-2xl font-semibold">{zh ? "PTQ总分与三个分量表：完整公开读法" : "PTQ total and three subscales: complete public readings"}</h2><p className="my-4 leading-8">{zh ? "四篇指南均可直接阅读全文，包括原始分复算、具体情境、资料暂缺与研究限制。它们不是当前访客的私人分数，也不是互斥的类型。" : "Read all four full guides for worked sums, concrete situations, missing information and research limits. They contain no current visitor scores and are not mutually exclusive types."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{ptqSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="overthinking-screener-faq"><h2 id="overthinking-screener-faq" className="text-2xl font-semibold">{zh ? "过度思考与PTQ常见问题" : "Overthinking and PTQ frequently asked questions"}</h2>{[...quiz.faq, ...ptqFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="overthinking-screener-references"><h2 id="overthinking-screener-references" className="text-xl font-semibold">{zh ? "PTQ原始研究、翻译研究与许可" : "PTQ original research, translation research and license"}</h2><ol className="mt-4 space-y-2">{[...quiz.references, { title: { en: "French PTQ validation: version-specific item structure (2017)", zh: "法文PTQ验证：具体版本的题目结构（2017）" }, url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.02159/full" }].map((ref, i) => <li key={ref.url} id={`overthinking-screener-reference-${i + 1}`}><a className="underline" href={ref.url} rel="noopener noreferrer">{i + 1}. {ref.title[locale]}</a></li>)}</ol></section>
  </Container></main>;
}
