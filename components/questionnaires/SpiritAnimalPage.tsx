import { EightQuizOverview } from "./EightQuizOverview";
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
import { spiritAnimalSections, spiritAnimalFaq, spiritAnimalSummaries, spiritAnimalVisiblePrivacyAnswer } from "./SpiritAnimalLandingEditorial";

function Copy({ text }: { text: string }) {
  return <>{text.split(/(\[\d+\])/g).map((part, i) => /^\[\d+\]$/.test(part) ? <sup key={i}><a className="ml-1 underline" href={`#spirit-animal-reference-${part.slice(1, -1)}`}>{part}</a></sup> : <Fragment key={i}>{part}</Fragment>)}</>;
}
export function SpiritAnimalPage({ quiz, locale , take = false }: { quiz: Questionnaire; locale: Locale ; take?: boolean }) {
  if (quiz.slug !== "spirit-animal" || !isArchetypeConfigurationValid(quiz)) notFound();
  const zh = locale === "zh", path = questionnairePath(locale, quiz.slug);
  const engine = <QuestionnaireClient quiz={quiz} locale={locale} />;
  if (take) return engine;
  return <main className="bg-slate-50 py-10 text-slate-950 [overflow-wrap:anywhere]"><Container className="max-w-3xl">
    <JsonLd id="questionnaire-breadcrumb" data={buildBreadcrumbJsonLd([{ name: "FermatMind", path: `/${locale}` }, { name: zh ? "全部测试" : "All tests", path: `/${locale}/tests` }, { name: quiz.title[locale], path }])} />
    <JsonLd id="questionnaire-page" data={buildWebPageJsonLd({ path, title: quiz.title[locale], description: quiz.description[locale], locale })} />
    <ExploreTestIntro slug={quiz.slug} locale={locale}>
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title[locale]}</h1><p className="mt-5 text-lg leading-8">{quiz.description[locale]}</p>
      <div className="explore-intro-meta"><span>{zh ? "18题 · 约4分钟 · 无需注册" : "18 questions · About 4 minutes · No registration"}</span><span>{zh ? "九种动物比喻 · 完整结果免费" : "Nine animal metaphors · Full results free"}</span></div>
      <QuestionnaireTakeEntry quiz={quiz} locale={locale} />
    </ExploreTestIntro>
    <EightQuizOverview quiz={quiz} locale={locale} />
    <section className="my-8 space-y-4 leading-8" aria-labelledby="spirit-animal-purpose"><h2 id="spirit-animal-purpose" className="text-2xl font-semibold">{spiritAnimalSections[0].title[locale]}</h2>{spiritAnimalSections[0].paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}<p>{quiz.introduction[locale]}</p></section>
    <section className="explore-reading-library" aria-labelledby="spirit-animal-methods"><h2 id="spirit-animal-methods">{zh ? "动物比喻的计分、解释与证据" : "Animal metaphor scoring, interpretation and evidence"}</h2><div className="explore-reading-sections">{[...spiritAnimalSections.slice(1), ...quiz.guide.map(s => ({ ...s, id: `source-${s.id}` }))].map(s => <section key={s.id} className="explore-reading-section" aria-labelledby={`spirit-animal-method-${s.id}`}><h3 id={`spirit-animal-method-${s.id}`}>{s.title[locale]}</h3><div>{s.paragraphs.map((p, i) => <p key={i}><Copy text={p[locale]} /></p>)}</div></section>)}</div></section>
    <section className="my-8" aria-labelledby="spirit-animal-library"><h2 id="spirit-animal-library" className="text-2xl font-semibold">{zh ? "九种动物：完整公开结果指南" : "Nine animals: complete public result guides"}</h2><p className="my-4 leading-8">{zh ? "每篇指南均可直接打开阅读全文，包括具体情境、可能帮助、取舍、相近结果比较和自愿的小尝试。公开指南不含私人答案或计数，动物之间没有优劣排名。" : "Open any guide for its full text: situations, possible contributions, tradeoffs, comparisons and an optional small experiment. Public guides contain no private answers or counts, and animals are not ranked by value."}</p><ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(p => <li key={p.id} className="rounded-lg border bg-white p-4"><Link prefetch={false} className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath(locale, quiz.slug, p.id)}>{p.title[locale]}</Link><p className="mt-2 leading-7">{spiritAnimalSummaries[p.id][locale]}</p></li>)}</ul></section>
    <section className="my-10 space-y-5 leading-8" aria-labelledby="spirit-animal-faq"><h2 id="spirit-animal-faq" className="text-2xl font-semibold">{zh ? "精神动物测试常见问题" : "Spirit animal test frequently asked questions"}</h2>{[...quiz.faq, ...spiritAnimalFaq].map((f, i) => <div key={i}><h3 className="font-semibold">{f.question[locale]}</h3><p className="mt-2">{f.question.en === "Are results free, and does sharing reveal my answers?" ? spiritAnimalVisiblePrivacyAnswer(locale) : f.answer[locale]}</p></div>)}</section>
    <section className="my-8 leading-8" aria-labelledby="spirit-animal-references"><h2 id="spirit-animal-references" className="text-xl font-semibold">{zh ? "动物意象的文化语境：延伸资料" : "Animal imagery in cultural context: further reading"}</h2><ul className="mt-4"><li id="spirit-animal-reference-1"><a className="underline" href="https://americanindian.si.edu/nk360/informational/native-american-spirit-animal" rel="noopener noreferrer">{zh ? "美国印第安人国家博物馆 · Honoring Animal Relatives" : "National Museum of the American Indian · Honoring Animal Relatives"}</a></li></ul></section>
  </Container></main>;
}
