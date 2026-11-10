import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { QuestionnaireTakeEntry } from "@/components/questionnaires/QuestionnaireTakeEntry";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { NumberSeriesPage } from "@/components/questionnaires/NumberSeriesPage";
import { loadTraditionalPractice, traditionalNumberSeriesSummaries } from "@/lib/i18n/zh-TW/practiceQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { QuestionnaireSection } from "@/lib/questionnaires/types";

type PracticeStage = { slug: string; take: boolean; profile?: string };
const requirePractice = cache(async (slug: string) => {
  const item = await loadTraditionalPractice(slug);
  if (!item) notFound();
  return item;
});

export async function traditionalPracticeMetadata({ slug, take, profile }: PracticeStage): Promise<Metadata> {
  const { quiz } = await requirePractice(slug);
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

function PracticeSections({ sections }: { sections: readonly QuestionnaireSection[] }) {
  return <div className="space-y-5">
    {sections.map(section => <section key={section.id} id={section.id} className="space-y-2 leading-8">
      <h3 className="text-xl font-semibold">{section.title.zh}</h3>
      {section.paragraphs.map((paragraph, index) => <p key={index} className="whitespace-pre-line">{paragraph.zh}</p>)}
    </section>)}
  </div>;
}

export async function PracticeQuestionnairePage({ slug, take, profile }: PracticeStage) {
  const { quiz, sections, faq, references } = await requirePractice(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <QuestionnaireClient quiz={quiz} locale="zh" />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const languages = <nav aria-label="練習語言" className="flex flex-wrap gap-5">
    {(["zh", "en"] as const).map(locale => <Link key={locale}
      href={profile ? questionnaireGuidePath(locale, slug, profile) : questionnairePath(locale, slug)}
      lang={locale === "zh" ? "zh-CN" : "en"} className="min-h-11 py-2 underline">
      {locale === "zh" ? "简体中文" : "English"}
    </Link>)}
  </nav>;
  if (slug === "number-series" && !profile) return <>
    {languages}
    <NumberSeriesPage quiz={quiz} locale="zh" traditional={{ sections, faq, summaries: traditionalNumberSeriesSummaries() }} />
  </>;
  const guides = <section className="space-y-4">
    <h2 className="text-2xl font-semibold">分項複習指南</h2>
    <ul className="grid gap-4 sm:grid-cols-2">
      {quiz.profiles.filter(item => item.id !== profile).map(item => <li key={item.id} className="rounded-lg border p-4">
        <Link href={questionnaireGuidePath("zh-TW", slug, item.id)} className="inline-block min-h-11 py-2 font-semibold underline">{item.title.zh}</Link>
        <p className="leading-7">{item.summary.zh}</p>
      </li>)}
    </ul>
  </section>;

  if (result) return <article className="mx-auto max-w-3xl space-y-6">
    {languages}
    <Link href={entry} className="inline-block min-h-11 py-2 underline">{quiz.title.zh}</Link>
    <h1 className="text-3xl font-bold">{result.title.zh}</h1>
    <p className="leading-8">{result.summary.zh}</p>
    <QuestionnaireResultReading quizSlug={slug} profile={result} locale="zh" traditional headingLevel={2} mode="guide" showSummary={false} />
    <Link href={`${entry}/take`} className="inline-block min-h-11 py-2 underline">開始免費練習</Link>
    {guides}
    <PracticeSections sections={quiz.guide} />
  </article>;

  return <div className="mx-auto max-w-3xl space-y-8">
    {languages}
    <ExploreTestIntro slug={slug} locale="zh">
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title.zh}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description.zh}</p>
      <p className="explore-intro-meta"><span>{quiz.questions.length} 題 · 約 {quiz.minutes} 分鐘 · 無需註冊</span><span>原創練習題 · 逐題解析與複習指南免費</span></p>
      <QuestionnaireTakeEntry quiz={quiz} locale="zh" displayLocale="zh-TW" />
    </ExploreTestIntro>
    <p className="whitespace-pre-line leading-8">{quiz.introduction.zh}</p>
    <PracticeSections sections={sections} />
    {guides}
    <section className="space-y-4 leading-8">
      <h2 className="text-2xl font-semibold">計分方法與使用範圍</h2>
      <PracticeSections sections={quiz.guide} />
    </section>
    <section className="space-y-4 leading-8">
      <h2 className="text-2xl font-semibold">常見問題</h2>
      {[...quiz.faq, ...faq].map(item => <div key={item.question.zh}>
        <h3 className="text-xl font-semibold">{item.question.zh}</h3>
        <p>{item.answer.zh}</p>
      </div>)}
    </section>
    {references.length ? <section className="space-y-3">
      <h2 className="text-2xl font-semibold">參考資料</h2>
      <ul>{references.map(item => <li key={item.url}>
        <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-block min-h-11 py-2 underline">{item.title.zh}</a>
      </li>)}</ul>
    </section> : null}
  </div>;
}
