import Link from "next/link";
import { notFound } from "next/navigation";
import { CognitiveFunctionsPage, CognitiveFunctionsGuidePage, isCognitiveFunctionsPageAvailable } from "@/components/questionnaires/CognitiveFunctionsPage";
import { CognitiveFunctionsVersions } from "@/components/questionnaires/CognitiveFunctionsVersions";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalCognitive } from "@/lib/i18n/zh-TW/likertQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

export async function TraditionalCognitiveFunctionsPage({ take, profile, edition }: { take: boolean; profile?: string; edition?: string | string[] }) {
  if (edition !== undefined && edition !== "paired56" && edition !== "ratings32") notFound();
  const traditional = await loadTraditionalCognitive();
  if (!traditional || !isCognitiveFunctionsPageAvailable(traditional.quiz)) notFound();
  const { quiz, paired, readings } = traditional;
  const landing = questionnairePath("zh-TW", quiz.slug);

  if (take) {
    const minutes = edition === "paired56" ? 15 : edition === "ratings32" ? 10 : 0;
    return <TraditionalQuestionnaireCopy>
      <QuestionnaireTakeDocument quiz={{ ...quiz, minutes }} locale="zh" landing={landing}>
        <CognitiveFunctionsVersions locale="zh" displayLocale="zh-TW" initialMethod={edition ?? null}
          ratingsQuiz={quiz} paired={paired} jungReadings={readings} />
      </QuestionnaireTakeDocument>
    </TraditionalQuestionnaireCopy>;
  }

  const result = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !result) notFound();
  const copy = await loadTraditionalAssessmentText();
  const localized = { quiz, locale: "zh" as const, displayLocale: "zh-TW" as const, traditional, copy };

  return <>
    <nav aria-label="測驗語言" className="mx-auto flex max-w-3xl flex-wrap gap-5 px-4 py-2 text-sm">
      {(["zh", "en"] as const).map(locale => <Link key={locale} lang={locale === "zh" ? "zh-CN" : "en"}
        className="min-h-11 py-2 underline" href={result ? questionnaireGuidePath(locale, quiz.slug, result.id) : questionnairePath(locale, quiz.slug)}>
        {locale === "zh" ? "简体中文" : "English"}
      </Link>)}
    </nav>
    {result ? <CognitiveFunctionsGuidePage {...localized} profile={result} /> : <CognitiveFunctionsPage {...localized} />}
  </>;
}
