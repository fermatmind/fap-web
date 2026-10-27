import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { FSCRS22_PARTS, type Fscrs22Questionnaire, type Fscrs22Readout } from "@/lib/questionnaires/fscrs22";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireFscrs22Report({ quiz, result, locale }: {
  quiz: Fscrs22Questionnaire; result: Fscrs22Readout; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-fscrs22-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "本次 22 条均已作出明确选择，包括跳过项。三个部分分别呈现；跳过任一条，仅使其所属部分不计分。三篇完整解释始终可读。" : "All 22 statements have an explicit choice, including skips. Each part is separate; a skip leaves only its own part unscored. All three complete explanations remain readable."}</p>
    {FSCRS22_PARTS.map(id => {
      const score = result.parts[id], profile = quiz.profiles.find(item => item.id === id)!;
      return <section key={id} data-fscrs22-part={id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`fscrs22-part-${id}`}>
        <h3 id={`fscrs22-part-${id}`} className="text-2xl font-semibold">{profile.title[locale]}</h3>
        <p data-fscrs22-count className="my-4 leading-7">{zh ? `数字答案 ${score.numericCount}/${score.requiredCount}；跳过 ${score.skippedCount} 条。` : `Numeric responses ${score.numericCount}/${score.requiredCount}; ${score.skippedCount} skipped.`}</p>
        {score.sum === null || score.mean === null ? <p data-fscrs22-unscored className="my-4 rounded-lg bg-slate-50 p-4 leading-8">{zh ? "此部分未计分：有跳过项，不补填，也不按剩余题目求平均。" : "This part is unscored: a statement was skipped. No value is filled in and no average is calculated from the remaining responses."}</p> : <div className="my-4 space-y-3 rounded-lg bg-slate-50 p-4 leading-8">
          <p data-fscrs22-mean className="text-xl font-semibold">{zh ? `平均值：${score.mean.toFixed(2)}（范围 1—5）` : `Mean: ${score.mean.toFixed(2)} (range 1–5)`}</p>
          <p data-fscrs22-sum>{zh ? `原始和：${score.sum}（范围 ${score.requiredCount}—${score.requiredCount * 5}）。平均值为原始和除以 ${score.requiredCount}，不是人群百分位。` : `Raw sum: ${score.sum} (range ${score.requiredCount}–${score.requiredCount * 5}). The mean is the sum divided by ${score.requiredCount}, not a population percentile.`}</p>
        </div>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`fscrs22-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这一部分的完整公开解释" : "Read this part’s complete public explanation"}</Link>
      </section>;
    })}
  </div>;
}
