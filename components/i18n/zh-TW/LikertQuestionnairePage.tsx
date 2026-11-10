import { WorkTraitsContext } from "@/components/questionnaires/WorkTraitsReport";
import { QuestionnaireCharacterSource } from "@/components/questionnaires/QuestionnaireCharacterSource";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { QuestionnaireTakeEntry } from "@/components/questionnaires/QuestionnaireTakeEntry";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalLikert } from "@/lib/i18n/zh-TW/likertQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";

type Stage = { slug: string; take: boolean; profile?: string };
const requireLikert = cache(async (slug: string) => {
  const item = await loadTraditionalLikert(slug);
  if (!item) notFound();
  return item;
});

export async function traditionalLikertMetadata({ slug, take, profile }: Stage): Promise<Metadata> {
  const { quiz } = await requireLikert(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return questionnaireTakeMetadata(quiz.title.zh, entry);
  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const title = result?.seo?.title.zh ?? result?.title.zh ?? quiz.seoTitle.zh;
  const description = result?.seo?.description.zh ?? result?.summary.zh ?? quiz.description.zh;
  const url = result ? questionnaireGuidePath("zh-TW", slug, result.id) : entry;
  const image = `/og/fun/${slug}?locale=zh-TW${result ? `&portrait=${result.id}` : ""}`;
  return { title, description, alternates: { canonical: url }, robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", url, images: [image] } };
}

function CitedCopy({ text, slug }: { text: string; slug: string }) {
  return text.split(/(\[\d+\])/u).map((part, index) => /^\[\d+\]$/u.test(part)
    ? <sup key={index}><a className="underline" href={`#${slug}-reference-${part.slice(1, -1)}`}>{part}</a></sup>
    : part);
}

export async function LikertQuestionnairePage({ slug, take, profile }: Stage) {
  const { quiz, sections, faq, summaries, extraReferences } = await requireLikert(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <QuestionnaireClient quiz={quiz} locale="zh" />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const languages = <nav aria-label="測驗語言" className="flex flex-wrap gap-5 text-sm">
    {(["zh", "en"] as const).map(locale => <Link key={locale} lang={locale === "zh" ? "zh-CN" : "en"}
      className="min-h-11 py-2 underline" href={result ? questionnaireGuidePath(locale, slug, result.id) : questionnairePath(locale, slug)}>
      {locale === "zh" ? "简体中文" : "English"}
    </Link>)}
  </nav>;
  const availableReferences = [...(quiz.references ?? []), ...(result ? [] : extraReferences)];
  const references = availableReferences.length ? <section className="space-y-4 leading-8">
    <h2 className="text-2xl font-semibold">題本與計分來源</h2>
    <ol>{availableReferences.map((reference, index) => <li key={reference.url} id={`${slug}-reference-${index + 1}`}>
      <a href={reference.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 underline">{index + 1}. {reference.title.zh}</a>
    </li>)}</ol>
  </section> : null;
  if (result) return <article className="mx-auto max-w-3xl space-y-6">
    {languages}
    <Link href={entry} className="inline-block min-h-11 py-2 underline">{quiz.title.zh}</Link>
    <h1 className="text-3xl font-bold">{result.title.zh}</h1>
    <p className="leading-8">{result.summary.zh}</p>
    <QuestionnaireResultReading quizSlug={slug} profile={result} locale="zh" traditional headingLevel={2} mode="guide" showSummary={false} />
    {slug === "character-strengths" && <QuestionnaireCharacterSource locale="zh" traditional />}
    {slug === "work-traits-reflection" && <WorkTraitsContext locale="zh" traditional />}
    {references}
    <Link href={`${entry}/take`} className="inline-block min-h-11 py-2 font-semibold underline">開始免費測驗</Link>
  </article>;

  return <div className="mx-auto max-w-3xl space-y-8">
    {languages}
    <ExploreTestIntro slug={slug} locale="zh">
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title.zh}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description.zh}</p>
      <QuestionnaireTakeEntry quiz={quiz} locale="zh" displayLocale="zh-TW" />
    </ExploreTestIntro>
    <p className="whitespace-pre-line leading-8"><CitedCopy text={quiz.introduction.zh} slug={slug} /></p>
    <section id="questionnaire-results" className="space-y-4">
      <h2 className="text-2xl font-semibold">完整公開結果指南</h2>
      {quiz.profiles.map(item => <div key={item.id} className="rounded-lg border p-4">
        <Link className="inline-block min-h-11 py-2 font-semibold underline" href={questionnaireGuidePath("zh-TW", slug, item.id)}>{item.title.zh}</Link>
        <p className="leading-7">{summaries[item.id]?.zh ?? item.summary.zh}</p>
      </div>)}
    </section>
    <section className="space-y-5 leading-8">
      <h2 className="text-2xl font-semibold">題目、計分與結果讀法</h2>
      {[...quiz.guide, ...sections].map((section, index) => <section key={`${section.id}-${index}`} className="space-y-2">
        <h3 className="text-xl font-semibold">{section.title.zh}</h3>
        {section.paragraphs.map((paragraph, offset) => <p key={offset}><CitedCopy text={paragraph.zh} slug={slug} /></p>)}
      </section>)}
    </section>
    <section className="space-y-4 leading-8">
      <h2 className="text-2xl font-semibold">常見問題</h2>
      {[...quiz.faq, ...faq].map((item, index) => <div key={index}>
        <h3 className="text-xl font-semibold">{item.question.zh}</h3>
        <p><CitedCopy text={item.answer.zh} slug={slug} /></p>
      </div>)}
    </section>
    {slug === "character-strengths" && <QuestionnaireCharacterSource locale="zh" traditional />}
    {slug === "work-traits-reflection" && <WorkTraitsContext locale="zh" traditional />}
    {references}
  </div>;
}
