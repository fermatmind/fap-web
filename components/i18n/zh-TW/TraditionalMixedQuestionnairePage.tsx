import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Bpi21Client } from "@/components/questionnaires/Bpi21Client";
import { Bpi21Page } from "@/components/questionnaires/Bpi21Page";
import { FantasyPortrait } from "@/components/questionnaires/FantasyRoster";
import { MentalAgeClassicClient } from "@/components/questionnaires/MentalAgeClassicClient";
import { MentalAgeClassicPage } from "@/components/questionnaires/MentalAgeClassicPage";
import { PatronusClient } from "@/components/questionnaires/PatronusClient";
import { PatronusPage } from "@/components/questionnaires/PatronusPage";
import { PatronusWitness } from "@/components/questionnaires/PatronusWitness";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireSbti31Client } from "@/components/questionnaires/QuestionnaireSbti31Client";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { RicePurityClient } from "@/components/questionnaires/RicePurityClient";
import { RicePurityPage } from "@/components/questionnaires/RicePurityPage";
import { Sbti31GuidePage, Sbti31Page } from "@/components/questionnaires/Sbti31Page";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalMixedQuestionnaire } from "@/lib/i18n/zh-TW/mixedQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isSbti31ConfigurationValid, type Sbti31Questionnaire } from "@/lib/questionnaires/sbti31";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Stage = { slug: string; take: boolean; profile?: string };

const requireMixedQuestionnaire = cache(async (slug: string) => {
  const item = await loadTraditionalMixedQuestionnaire(slug);
  if (!item) notFound();
  return item;
});

function NativeTake({ quiz, takeQuiz }: { quiz: Questionnaire; takeQuiz: Questionnaire }) {
  switch (quiz.kind) {
    case "mental-age": return <MentalAgeClassicClient quiz={quiz} locale="zh" />;
    case "patronus20": return <PatronusClient quiz={quiz} locale="zh" />;
    case "bpi21": return <Bpi21Client quiz={quiz} locale="zh" />;
    case "rice100": return <RicePurityClient quiz={quiz} locale="zh" />;
    case "sbti31": return <QuestionnaireSbti31Client quiz={takeQuiz} displayQuiz={quiz} locale="zh" />;
    default: return notFound();
  }
}

export async function traditionalMixedQuestionnaireMetadata({ slug, take, profile }: Stage): Promise<Metadata> {
  const { quiz } = await requireMixedQuestionnaire(slug);
  const entry = questionnairePath("zh-TW", slug);
  if (take) return questionnaireTakeMetadata(quiz.title.zh, entry);
  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const path = result ? questionnaireGuidePath("zh-TW", slug, result.id) : entry;
  return {
    title: result?.seo?.title?.zh ?? result?.title.zh ?? quiz.seoTitle.zh,
    description: result?.seo?.description?.zh ?? result?.summary.zh ?? quiz.description.zh,
    alternates: { canonical: path },
    robots: { index: false, follow: true },
    openGraph: { locale: "zh_TW", url: path, images: [
      `/og/fun/${slug}?locale=zh-TW${result ? `&portrait=${result.id}` : ""}`,
    ] },
  };
}

export async function TraditionalMixedQuestionnairePage({ slug, take, profile }: Stage) {
  const [item, traditionalCopy] = await Promise.all([requireMixedQuestionnaire(slug), loadTraditionalAssessmentText()]);
  const { quiz, takeQuiz } = item;
  const entry = questionnairePath("zh-TW", slug);
  if (take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <NativeTake quiz={quiz} takeQuiz={takeQuiz} />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const props = { locale: "zh" as const, traditionalCopy };
  let content;
  if (quiz.kind === "mental-age") {
    content = <MentalAgeClassicPage quiz={quiz} guide={Boolean(result)} {...props} />;
  } else if (isSbti31ConfigurationValid(takeQuiz)) {
    const display = { ...takeQuiz, ...quiz } as Sbti31Questionnaire;
    content = result ? <Sbti31GuidePage quiz={display} profile={result} {...props} />
      : <Sbti31Page quiz={display} localizedEditorial={item} {...props} />;
  } else if (result) {
    content = <article className="mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href={entry} className="underline">{quiz.title.zh}</Link>
      <h1 className="text-3xl font-semibold">{result.title.zh}</h1>
      {quiz.kind === "patronus20" && <>
        <FantasyPortrait slug={slug} id={result.id} name={result.title.zh} large />
        <PatronusWitness quiz={quiz} id={result.id} {...props} />
      </>}
      <QuestionnaireResultReading quizSlug={slug} profile={result} locale="zh" traditional headingLevel={2} />
      <Link href={`${entry}/take`} className="underline">開始作答</Link>
    </article>;
  } else {
    switch (quiz.kind) {
      case "patronus20": content = <PatronusPage quiz={quiz} {...props} />; break;
      case "bpi21": content = <Bpi21Page quiz={quiz} localizedEditorial={item} {...props} />; break;
      case "rice100": content = <RicePurityPage quiz={quiz} {...props} />; break;
      default: notFound();
    }
  }

  return <>
    <nav aria-label="測驗語言" className="mx-auto flex max-w-3xl gap-5 px-5 py-3 text-sm">
      {(["zh", "en"] as const).map(locale => <Link key={locale} className="underline"
        lang={locale === "zh" ? "zh-CN" : "en"} href={result ? questionnaireGuidePath(locale, slug, result.id) : questionnairePath(locale, slug)}>
        {locale === "zh" ? "简体中文" : "English"}
      </Link>)}
    </nav>
    {content}
  </>;
}
