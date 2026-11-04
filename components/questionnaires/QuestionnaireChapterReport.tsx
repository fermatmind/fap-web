import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireChapterReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <ResultPage variant="reflection" className="mt-6 space-y-10">


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`facet-title-${direction.id}`}>
        <h3 id={`facet-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-facet-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/${score.total}题有频率回答，本版至少需要${quiz.minimumRatedItems}题；不计算个人均分。` : `Insufficient information: ${score.rated}/${score.total} items rated; this edition needs at least ${quiz.minimumRatedItems}. No personal mean is calculated.`)
          : (zh ? `有效频率均分：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}题有效）` : `Rated-frequency mean: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "以下为这一部分的通用读法，不能当作对你本次状态的解释。" : "The following is a general reading guide, not an interpretation of your state in this attempt."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "scene", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#facet-title-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
      <p className="leading-8 text-slate-700">{zh ? "六组分别回看过去四周有机会且自愿的具体做法，不相加，不按最高均分派人生时代。它们可以同时出现，没有年龄、事件或先后顺序，也不评进度、成熟、成功或心理健康。资料不足时只读通用解释，六份完整指南始终开放。" : "Six groups separately revisit particular practices over four weeks with an opportunity and your willingness. They are not added together or assigned as a highest-mean life era. They may coexist without an age, event or sequence and rate no progress, maturity, success or mental health. Insufficient information permits general reading only; all six full guides remain available."}</p>
    </details>
  </ResultPage>;
}
