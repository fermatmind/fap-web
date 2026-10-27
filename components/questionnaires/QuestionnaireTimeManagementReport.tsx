import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireTimeManagementReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-time-management-result className="mt-6 space-y-10">
    <p className="leading-8 text-slate-700">{zh
      ? "四部分分别回看过去两周的自报行为，不相加、不排名、不选出获胜类型。均分包含明示的反向计分，不是生产力百分比或实测能力；实践机会、任务负担和自主权需要一起考虑。相近均分不代表能力相当，也没有重要差异阈值。"
      : "These four parts describe separate reported behaviors over the past two weeks. They are not added, ranked or used to choose a winning type. Means include the stated reverse coding; they are neither productivity percentages nor tested ability. Consider opportunity, workload and autonomy. Close means do not establish equivalent ability or a meaningful difference."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section data-time-management-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`time-part-${direction.id}`}>
        <h3 id={`time-part-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-time-management-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/${score.total}题有频率回答，需要完整6题；本部分不计算均分。` : `Insufficient information: ${score.rated}/${score.total} frequency responses; all six are required. No mean for this part.`)
          : (zh ? `计分后均分：${score.mean.toFixed(1)} / 5（${score.sum} ÷ ${score.rated}，显示一位小数）` : `Keyed mean: ${score.mean.toFixed(1)} / 5 (${score.sum} ÷ ${score.rated}, displayed to one decimal)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "无相关机会或跳过不是低分，不填补。下面保留完整通用读法，不能当成本次个人成绩。" : "No relevant occasion or a skip is not a low score and is not filled in. The complete general guide remains available without assigning a personal score here."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`time-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开完整指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
