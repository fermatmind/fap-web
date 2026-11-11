import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { FSCRS22_PARTS, type Fscrs22Questionnaire, type Fscrs22Readout } from "@/lib/questionnaires/fscrs22";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

export function QuestionnaireFscrs22Report({ quiz, result, locale, readingProfiles }: {
  quiz: Fscrs22Questionnaire; result: Fscrs22Readout; locale: Locale; readingProfiles?: readonly QuestionnaireProfile[];
}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <ResultPage variant="reflection" data-fscrs22-result className="my-6 space-y-8">
    <ResultOverview className="rounded-xl border border-teal-200 bg-teal-50/65" locale={locale} title={zh ? displayText("分别看自我批评与自我安抚") : "Read self-criticism and self-reassurance separately"}
      description={zh ? displayText("均值范围1—5，跳过会使所属部分未计分。名称可跳到该部分的完整解释。") : "Means range from 1–5. A skip leaves its own part unscored. Select a name for that part’s full explanation."}
      items={FSCRS22_PARTS.map(id => ({ id, label: quiz.profiles.find(profile => profile.id === id)!.title[locale], href: `#fscrs22-part-${id}`,
        value: result.parts[id].sum === null || result.parts[id].mean === null ? (zh ? displayText("未计分") : "Unscored") : `${result.parts[id].mean!.toFixed(2)} / 5`,
        note: zh ? displayText(`${result.parts[id].numericCount} / ${result.parts[id].requiredCount}个数字回答`) : `${result.parts[id].numericCount} / ${result.parts[id].requiredCount} numeric responses` }))} />


    {FSCRS22_PARTS.map(id => {
      const score = result.parts[id], sourceProfile = quiz.profiles.find(item => item.id === id)!;
      const profile = readingProfiles?.find(item => item.id === id && item.resultReading?.quizSlug === quiz.slug && item.resultReading.profileId === id) ?? sourceProfile;
      return <section key={id} data-fscrs22-part={id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`fscrs22-part-${id}`}>
        <h3 id={`fscrs22-part-${id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
        <p data-fscrs22-count className="my-4 leading-7">{zh ? displayText(`数字答案 ${score.numericCount}/${score.requiredCount}；跳过 ${score.skippedCount} 条。`) : `Numeric responses ${score.numericCount}/${score.requiredCount}; ${score.skippedCount} skipped.`}</p>
        {score.sum === null || score.mean === null ? <p data-fscrs22-unscored className="my-4 rounded-lg bg-slate-50 p-4 leading-8">{zh ? displayText("此部分未计分：有跳过项，不补填，也不按剩余题目求平均。") : "This part is unscored: a statement was skipped. No value is filled in and no average is calculated from the remaining responses."}</p> : <div className="my-4 space-y-3 rounded-lg bg-slate-50 p-4 leading-8">
          <p data-fscrs22-mean className="text-xl font-semibold">{zh ? displayText(`平均值：${score.mean.toFixed(2)}（范围 1—5）`) : `Mean: ${score.mean.toFixed(2)} (range 1–5)`}</p>
          <p data-fscrs22-sum>{zh ? displayText(`原始和：${score.sum}（范围 ${score.requiredCount}—${score.requiredCount * 5}）。平均值为原始和除以 ${score.requiredCount}，不是人群百分位。`) : `Raw sum: ${score.sum} (range ${score.requiredCount}–${score.requiredCount * 5}). The mean is the sum divided by ${score.requiredCount}, not a population percentile.`}</p>
        </div>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`fscrs22-${id}`} mode="result" previewSectionIds={["scene", "observation", "support", "risk", "next-step", "talk"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, id)}>{zh ? displayText("阅读这一部分的完整公开解释") : "Read this part’s complete public explanation"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh ? displayText("本次 22 条均已作出明确选择，包括跳过项。三个部分分别呈现；跳过任一条，仅使其所属部分不计分。三篇完整解释始终可读。") : "All 22 statements have an explicit choice, including skips. Each part is separate; a skip leaves only its own part unscored. All three complete explanations remain readable."}</p>
    </details>
  </ResultPage>;
}
