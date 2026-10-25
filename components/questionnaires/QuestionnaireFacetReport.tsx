import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireFacetReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="mt-6 space-y-10">
    <p className="leading-8 text-slate-700">{zh ? `${quiz.directions.length}部分分别描述这次自报经验，不相加，也不排出更好的人格类型。较高的负担与较高的恢复感可以同时存在；没有哪一部分等于剩余电量百分比。` : `These ${quiz.directions.length} parts describe separate self-reported experiences. They are not added together or ranked as better personality types. Higher reported demands and stronger recovery can coexist; none is a percentage of battery remaining.`}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`facet-title-${direction.id}`}>
        <h3 id={`facet-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-facet-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/${score.total}题有频率回答，本版至少需要${quiz.minimumRatedItems}题；不计算个人均分。` : `Insufficient information: ${score.rated}/${score.total} items rated; this edition needs at least ${quiz.minimumRatedItems}. No personal mean is calculated.`)
          : (zh ? `计分后均分：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}题有效）` : `Scored mean: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "以下为这一部分的通用读法，不能当作对你本次状态的解释。" : "The following is a general reading guide, not an interpretation of your state in this attempt."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
