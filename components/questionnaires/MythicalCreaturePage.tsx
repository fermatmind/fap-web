import { QuestionnaireTakeEntry } from "./QuestionnaireTakeEntry";
import { Fragment } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { isArchetypeConfigurationValid } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { QuestionnaireClient } from "./QuestionnaireClient";
import { mythicalCreatureSections, mythicalCreatureFaq, mythicalCreatureSummaries } from "./MythicalCreatureLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#mythical-creature-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function MythicalCreaturePage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "mythical-creature" || !isArchetypeConfigurationValid(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "18题 · 约5分钟 · 无需注册" : "18 questions · About 5 minutes · No registration"}</span><span>{zh ? "六种创作与交流比喻 · 完整结果免费" : "Six creative preference metaphors · Full results free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <section className="my-8 space-y-4 leading-8" aria-labelledby="mythical-creature-purpose"><h2 id="mythical-creature-purpose" className="text-2xl font-semibold">{mythicalCreatureSections[0].title[locale]}</h2>{mythicalCreatureSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="mythical-creature-methods"><h2 id="mythical-creature-methods">{zh ? "神话生物结果：计分、比较与证据范围" : "Mythical creature results: scoring, comparisons and evidence"}</h2><div className="explore-reading-sections">{[...mythicalCreatureSections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`mythical-creature-method-${s.id}`}><h3 id={`mythical-creature-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="mythical-creature-library"><h2 id="mythical-creature-library" className="text-2xl font-semibold">{zh ? "六种神话生物：完整公开指南" : "Six mythical creatures: complete public guides"}</h2><p className="my-4 leading-8">{zh ? "每篇指南均可直接打开阅读全文，包括具体情境、可能帮助、取舍、相近结果比较和自愿的小尝试。公开指南不含私人答案或计数，六种结果没有优劣排名。" : "Open any guide for its full text: situations, possible contributions, tradeoffs, comparisons and an optional small experiment. Public guides contain no private answers or counts, and creatures are not ranked by value."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{mythicalCreatureSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="mythical-creature-faq"><h2 id="mythical-creature-faq" className="text-2xl font-semibold">{zh ? "神话生物测试常见问题" : "Mythical creature quiz frequently asked questions"}</h2>{[...quiz.faq, ...mythicalCreatureFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="mythical-creature-references"><h2 id="mythical-creature-references" className="text-xl font-semibold">{zh ? "文化背景阅读" : "Cultural background reading"}</h2><ul className="mt-4"><li id="mythical-creature-reference-1"><a className="underline" href="https://www.amnh.org/explore/ology/ology-cards/279-unicorn?view=modal" rel="noopener noreferrer">{zh ? "美国自然历史博物馆 · 独角兽的不同文化形象" : "American Museum of Natural History · Unicorn imagery across traditions"}</a></li></ul></section>
  </Container></main>;
}
