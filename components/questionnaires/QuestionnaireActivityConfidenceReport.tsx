import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireActivityConfidenceReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-activity-confidence-result>
    <p className="leading-8">{zh
      ? "八组分别显示对选定活动的自报把握，不测八种智能或实际能力，不选最强项、不合成总分，也不按数值指定学习风格或职业。相近与并列值都原样保留。"
      : "The eight groups show self-reported confidence about selected activities, not eight measured intelligences or actual ability. There is no strongest group, total, learning-style assignment or career match. Close and equal means remain visible."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-activity-confidence-part={direction.id} aria-labelledby={`activity-confidence-${direction.id}`}>
        <h3 id={`activity-confidence-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-activity-confidence-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/4题有数值回答；需要四题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/4 items rated; all four are needed. No mean is calculated for this group.`)
          : (zh ? `自报把握均分：${score.mean.toFixed(1)} / 5（4/4题有效）` : `Self-reported confidence mean: ${score.mean.toFixed(1)} / 5 (4/4 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "经验不足、无法接触或不愿评价都可以不计分，不转成低分。以下完整指南是通用读法，不是对你能力或状态的判断。"
          : "Insufficient experience, inaccessible activities or a choice not to rate remain unscored, never low scores. The complete guide below is general information, not a judgment of your ability or state."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`activity-confidence-report-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本原创反思没有建立心理测量学效度或常模，没有加德纳背书。可以只回看一次普通任务，不要求实际尝试、公开答案或把结果用于录用、分班及其他重要判断。"
      : "This original reflection has no established psychometric validation or norms and no Gardner endorsement. A private review of one ordinary task is enough; no activity, disclosure or use in hiring, placement or other consequential judgments is required."}</p>
  </div>;
}
