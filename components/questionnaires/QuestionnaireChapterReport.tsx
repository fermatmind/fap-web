import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireChapterReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <ResultPage variant="reflection" className="mt-6 space-y-10">
    <section className="rounded-2xl border border-indigo-200 bg-indigo-50/65 p-4 sm:p-6" aria-labelledby="chapter-reading-start">
      <h3 id="chapter-reading-start" className="text-xl font-semibold text-indigo-950">{zh ? "翻开过去四周的一页" : "Open a page from the past four weeks"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? "六种做法可以在同一周出现。从你此刻想回看的做法读起，看看它在日常里长什么样。" : "These six practices can show up in the same week. Pick the one you want to revisit and see what it can look like in everyday life."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <li key={direction.id} className="min-w-0 border-l-2 border-indigo-300 bg-white/75 px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-indigo-950 underline decoration-indigo-400 underline-offset-4" href={`#facet-title-${direction.id}`}>{direction.title[locale]}</a>
          <p className="text-sm leading-6 tabular-nums">{score.mean === null ? (zh ? `${score.rated}/${score.total} 项有效，未算均分` : `${score.rated}/${score.total} rated, no mean`) : `${score.mean.toFixed(1)} / 5`}</p>
        </li>;
      })}</ul>
    </section>


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
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看计分与使用说明" : "View scoring and use notes"}</summary>
      <p className="leading-8 text-slate-700">{zh ? "六组分别回看过去四周有机会且自愿的具体做法，不相加，不按最高均分派人生时代。它们可以同时出现，没有年龄、事件或先后顺序，也不评进度、成熟、成功或心理健康。资料不足时只读通用解释，六份完整指南始终开放。" : "Six groups separately revisit particular practices over four weeks with an opportunity and your willingness. They are not added together or assigned as a highest-mean life era. They may coexist without an age, event or sequence and rate no progress, maturity, success or mental health. Insufficient information permits general reading only; all six full guides remain available."}</p>
    </details>
  </ResultPage>;
}
