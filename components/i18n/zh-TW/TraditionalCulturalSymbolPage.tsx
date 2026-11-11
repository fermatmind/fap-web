import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { BirthNumberGuidePage, BirthNumberPage } from "@/components/questionnaires/BirthNumberPage";
import { Nakshatra27GuidePage, Nakshatra27Page } from "@/components/questionnaires/Nakshatra27Page";
import { NatalChartGuidePage, NatalChartPage } from "@/components/questionnaires/NatalChartPage";
import { NineStarYearGuidePage, NineStarYearPage } from "@/components/questionnaires/NineStarYearPage";
import { QuestionnaireResultReading } from "@/components/questionnaires/QuestionnaireResultReading";
import { QuestionnaireTakeDocument, questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { WetonStory35Page } from "@/components/questionnaires/WetonStory35Page";
import { loadTraditionalCulturalSymbol } from "@/lib/i18n/zh-TW/culturalSymbolQuestionnaires";
import { isBirthNumberConfigurationValid } from "@/lib/questionnaires/birthNumber";
import { isNakshatra27ConfigurationValid } from "@/lib/questionnaires/nakshatra27";
import { isNatalChartConfigurationValid } from "@/lib/questionnaires/natalChart";
import { isNineStarYearConfigurationValid } from "@/lib/questionnaires/nineStarYear";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { isWetonStory35ConfigurationValid } from "@/lib/questionnaires/wetonStory35";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Stage = { slug: string; take: boolean; profile?: string };

const requireCulturalSymbol = cache(async (slug: string) => {
  const item = await loadTraditionalCulturalSymbol(slug);
  if (!item) notFound();
  return item;
});

export async function traditionalCulturalSymbolMetadata({ slug, take, profile }: Stage): Promise<Metadata> {
  const { quiz } = await requireCulturalSymbol(slug);
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

export async function TraditionalCulturalSymbolPage({ slug, take, profile }: Stage) {
  const [item, traditionalCopy] = await Promise.all([requireCulturalSymbol(slug), loadTraditionalAssessmentText()]);
  const { quiz, takeQuiz } = item;
  const entry = questionnairePath("zh-TW", slug);
  if (take) {
    if (!isWetonStory35ConfigurationValid(takeQuiz)) notFound();
    return <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <WetonStory35Page quiz={quiz} locale="zh" take traditionalCopy={traditionalCopy} />
    </QuestionnaireTakeDocument>;
  }
  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const props = { locale: "zh" as const, traditionalCopy, localizedEditorial: item, readings: quiz.profiles };
  let content;
  if (isBirthNumberConfigurationValid(takeQuiz)) {
    const raw = result && takeQuiz.profiles.find(item => item.id === result.id);
    if (result && !raw) notFound();
    content = raw && result
      ? <BirthNumberGuidePage quiz={takeQuiz} profile={{ ...raw, ...result, id: raw.id }} {...props} />
      : <BirthNumberPage quiz={takeQuiz} {...props} />;
  } else if (isNatalChartConfigurationValid(takeQuiz)) {
    const raw = result && takeQuiz.profiles.find(item => item.id === result.id);
    if (result && !raw) notFound();
    content = raw && result
      ? <NatalChartGuidePage quiz={takeQuiz} profile={{ ...raw, ...result, id: raw.id }} {...props} />
      : <NatalChartPage quiz={takeQuiz} {...props} />;
  } else if (isNineStarYearConfigurationValid(takeQuiz)) {
    const raw = result && takeQuiz.profiles.find(item => item.id === result.id);
    if (result && !raw) notFound();
    content = raw && result
      ? <NineStarYearGuidePage quiz={takeQuiz} profile={{ ...raw, ...result, id: raw.id }} {...props} />
      : <NineStarYearPage quiz={takeQuiz} {...props} />;
  } else if (isWetonStory35ConfigurationValid(takeQuiz)) {
    content = result ? <article className="mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href={entry} className="underline">{quiz.title.zh}</Link>
      <h1 className="text-3xl font-semibold">{result.title.zh}</h1>
      <QuestionnaireResultReading quizSlug={slug} profile={result} locale="zh" traditional headingLevel={2} />
      <Link href={`${entry}/take`} className="underline">開始作答</Link>
    </article> : <WetonStory35Page quiz={quiz} {...props} />;
  } else if (isNakshatra27ConfigurationValid(takeQuiz)) {
    content = result ? <Nakshatra27GuidePage quiz={takeQuiz} profile={result} {...props} />
      : <Nakshatra27Page quiz={takeQuiz} {...props} />;
  } else {
    notFound();
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
