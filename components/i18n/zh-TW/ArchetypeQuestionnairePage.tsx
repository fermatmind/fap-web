import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { FilmQuestionnaireLanding, hasFilmEditorial } from "./FilmQuestionnaireLanding";
import { hasTraditionalEightQuizOverview } from "@/components/questionnaires/EightQuizOverview";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";
import { FantasyQuestionnaireLanding } from "./FantasyQuestionnaireLanding";
import { FantasyPortrait, hasFantasyArtwork } from "@/components/questionnaires/FantasyRoster";
import { QuestionnaireClient } from "@/components/questionnaires/QuestionnaireClient";
import { SpiritAnimalPage } from "@/components/questionnaires/SpiritAnimalPage";
import { MoonPhaseShareCard } from "@/components/questionnaires/MoonPhaseShareCard";
import { moonPhaseDiagramNote, moonPhaseDisplayCopy, moonPhaseImage, moonPhasePresentation } from "@/lib/questionnaires/moonPhasePresentation";
import { EdgerunnersPortrait } from "@/components/questionnaires/EdgerunnersPortrait";
import { QuizResultArtwork } from "@/components/questionnaires/QuizResultArtwork";
import { WorkValuesPage } from "@/components/questionnaires/WorkValuesPage";
import { StyleImpressionPage } from "@/components/questionnaires/StyleImpressionPage";
import { ConnectionIdealsPage } from "@/components/questionnaires/ConnectionIdealsPage";
import { DogBreedPage } from "@/components/questionnaires/DogBreedPage";
import { MythicalCreaturePage } from "@/components/questionnaires/MythicalCreaturePage";
import { SuperpowerPage } from "@/components/questionnaires/SuperpowerPage";
import { SpaceMarineChapterGuideIntro } from "@/components/questionnaires/SpaceMarineChapterGuideIntro";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalArchetype } from "@/lib/i18n/zh-TW/archetypeQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";

type Stage = { slug: string; profile?: string; take?: boolean };
const preferencePages = {
  "values-assessment": WorkValuesPage,
  "style-impression-preferences": StyleImpressionPage,
  "connection-ideals": ConnectionIdealsPage,
};
const pages = {
  ...preferencePages,
  "mythical-creature": MythicalCreaturePage,
  "spirit-animal": SpiritAnimalPage,
  "what-dog-breed-am-i": DogBreedPage,
  "superpower-test": SuperpowerPage,
};
const requireQuiz = cache(async (slug: string) => {
  const quiz = await loadTraditionalArchetype(slug);
  if (!quiz) notFound();
  const Landing = Object.hasOwn(pages, slug) ? pages[slug as keyof typeof pages] : null;
  if (!Landing && !hasFantasyArtwork(slug) && !hasFilmEditorial(slug)) notFound();
  return { quiz, Landing };
});

export async function traditionalArchetypeMetadata({ slug, profile, take }: Stage): Promise<Metadata> {
  const { quiz } = await requireQuiz(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return questionnaireTakeMetadata(quiz.title.zh, entry);
  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const url = result ? questionnaireGuidePath("zh-TW", slug, result.id) : entry;
  const title = result?.seo?.title.zh ?? result?.title.zh ?? quiz.seoTitle.zh;
  const description = result?.seo?.description.zh ?? result?.summary.zh ?? quiz.description.zh;
  const image = `/og/fun/${slug}?locale=zh-TW${result ? `&portrait=${result.id}` : ""}`;
  return { title, description, alternates: { canonical: url }, robots: { index: false, follow: true },
    openGraph: { title, description, locale: "zh_TW", url, images: [image] } };
}

export async function ArchetypeQuestionnairePage({ slug, profile, take }: Stage) {
  const { quiz, Landing } = await requireQuiz(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      {Landing ? <Landing quiz={quiz} locale="zh" displayLocale="zh-TW" take /> : <QuestionnaireClient quiz={quiz} locale="zh" />}
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const url = (locale: "zh" | "en") => profile ? questionnaireGuidePath(locale, slug, profile) : questionnairePath(locale, slug);
  const languages = <nav aria-label="測驗語言" className="flex flex-wrap gap-5 text-sm">
    <Link href={url("zh")} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
    <Link href={url("en")} lang="en" className="min-h-11 py-2 underline">English</Link>
  </nav>;
  if (!profile) {
    const Preference = Object.hasOwn(preferencePages, slug) ? preferencePages[slug as keyof typeof preferencePages] : null;
    const overviewCopy = hasTraditionalEightQuizOverview(slug) || slug === "moon-phase" || slug === "cyberpunk-edgerunners" ? await loadTraditionalAssessmentText() : undefined;
    return <>
      {languages}
      {slug === "spirit-animal" ? <SpiritAnimalPage quiz={quiz} locale="zh" displayLocale="zh-TW" overviewCopy={await loadTraditionalAssessmentText()} />
        : Preference ? <Preference quiz={quiz} locale="zh" displayLocale="zh-TW" overviewCopy={await loadTraditionalAssessmentText()} />
        : Landing ? <Landing quiz={quiz} locale="zh" displayLocale="zh-TW" />
        : hasFilmEditorial(slug) ? <FilmQuestionnaireLanding quiz={quiz} overviewCopy={overviewCopy} />
        : <FantasyQuestionnaireLanding quiz={quiz} />}
    </>;
  }

  const result = quiz.profiles.find(item => item.id === profile);
  if (!result) notFound();
  const phase = slug === "moon-phase" ? moonPhasePresentation(result.id) : undefined;
  const moonCopy = phase ? moonPhaseDisplayCopy(await loadTraditionalAssessmentText()) : undefined;
  return <article className="mx-auto max-w-3xl space-y-6">
    {languages}
    <Link href={entry} className="inline-block min-h-11 py-2 underline">{quiz.title.zh}</Link>
    <p className="text-sm font-semibold">完整公開指南</p>
    <h1 className="text-3xl font-bold sm:text-4xl">{result.title.zh}</h1>
    <p className="leading-8">{result.summary.zh}</p>
    {slug === "space-marine-chapter" && <SpaceMarineChapterGuideIntro profile={result} locale="zh" displayLocale="zh-TW" />}
    {phase && moonCopy && <section className="my-6 space-y-4" data-moon-phase-public-diagram>
      <Image unoptimized src={moonPhaseImage(result.id)} width={156} height={156} alt="" className="rounded-xl" />
      <p className="text-xl font-semibold">{moonCopy(phase.conclusion.zh)}</p>
      <p className="text-sm leading-7">這是公開月相意象指南。{moonCopy(moonPhaseDiagramNote.zh)}</p>
      <TraditionalQuestionnaireCopy loadingText="正在準備月相分享卡…">
        <MoonPhaseShareCard ids={[result.id]} locale="zh" publicGuide />
      </TraditionalQuestionnaireCopy>
    </section>}
    {slug === "cyberpunk-edgerunners" && <EdgerunnersPortrait id={result.id} className="mb-5 size-32 rounded-xl sm:size-44" />}
    {slug === "aura-color" && <div className="grid w-full max-w-56"><QuizResultArtwork slug={slug} id={result.id} /></div>}
    {hasFantasyArtwork(slug) && <FantasyPortrait slug={slug} id={result.id} name={result.title.zh} large />}
    <p className="text-sm leading-7">這份公開指南只提供閱讀參考，沒有任何人的作答紀錄。</p>
    <Link href={`${entry}/take`} className="inline-block min-h-11 py-2 font-semibold underline">開始免費測驗</Link>
    {slug === "aura-color" && <Link href={`${entry}#questionnaire-results`} className="inline-block min-h-11 py-2 underline">對照七種光環顏色</Link>}
    <QuestionnaireResultReading quizSlug={slug} profile={result} locale="zh" traditional headingLevel={2} mode="guide" showSummary={false} />
    <details>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">本指南的適用範圍與讀法</summary>
      <p className="leading-8">{quiz.description.zh}</p>
    </details>
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">其他公開結果指南</h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {quiz.profiles.filter(item => item.id !== profile).map(item => <li key={item.id}>
          <Link href={questionnaireGuidePath("zh-TW", slug, item.id)} className="inline-block min-h-11 py-2 underline">{item.title.zh}</Link>
        </li>)}
      </ul>
    </section>
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">計分方法與閱讀指引</h2>
      {quiz.guide.map(section => <section key={section.id} className="space-y-3">
        <h3 className="text-xl font-semibold">{section.title.zh}</h3>
        {section.paragraphs.map((paragraph, index) => <p key={index} className="leading-8">{paragraph.zh}</p>)}
      </section>)}
    </section>
    <Link href={entry} className="inline-block min-h-11 py-2 font-semibold underline">返回測驗介紹</Link>
  </article>;
}
