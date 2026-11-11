import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireExpressionReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="mt-6 space-y-10">
    <section className="border-y border-fuchsia-200 bg-fuchsia-50/55 p-4 sm:p-6" aria-labelledby="expression-in-context">
      <h3 id="expression-in-context" className="text-xl font-semibold text-fuchsia-950">{zh ? copy("在什么场合，你会这样表达") : "Where does each way of expressing yourself show up?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("回想一个适合表达、也愿意表达的场合。每项读数只对应这些场合下报告的频率，选名称即可继续读例子。") : "Think of a setting where you felt willing to express yourself. Each rating describes the reported frequency in these contexts. Open a topic for an example."}</p>
      <dl className="mt-4 divide-y divide-fuchsia-200 border-t border-fuchsia-200">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <div key={direction.id} className="flex flex-wrap items-baseline justify-between gap-x-4 py-1">
          <dt><a className="inline-flex min-h-11 items-center font-semibold text-fuchsia-950 underline underline-offset-4" href={`#facet-title-${direction.id}`}>{direction.title[locale]}</a></dt>
          <dd className="text-sm font-medium tabular-nums">{score.mean === null ? (zh ? copy(`${score.rated}/${score.total} 项有效，未算均分`) : `${score.rated}/${score.total} rated, no mean`) : `${score.mean.toFixed(1)} / 5`}</dd>
        </div>;
      })}</dl>
    </section>


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`facet-title-${direction.id}`}>
        <h3 id={`facet-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-facet-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/${score.total}题有频率回答，本版至少需要${quiz.minimumRatedItems}题；不计算个人均分。`) : `Insufficient information: ${score.rated}/${score.total} items rated; this edition needs at least ${quiz.minimumRatedItems}. No personal mean is calculated.`)
          : (zh ? copy(`有效频率均分：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}题有效）`) : `Rated-frequency mean: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? copy("以下为这一部分的通用读法，不能当作对你本次状态的解释。") : "The following is a general reading guide, not an interpretation of your state in this attempt."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["observed", "example", "experiment"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一部分的公开说明") : "Read this part’s public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8 text-slate-700">{zh ? copy("四组分别回看过去四周自愿、合适场面中的表达频率，不相加，也不按最高值派原型。高低只对应当前条目与机会，不表示女性程度、魅力、激素或他人的反应。每组的完整指南始终可读；资料不足时仅作通用说明。") : "Four groups separately revisit expression frequencies in fitting, voluntary situations over four weeks. They are not added together or assigned as a highest-value archetype. Higher or lower means concern these items and opportunities, not femininity, charm, hormones or other people's responses. Every full guide remains available; insufficient information permits general reading only."}</p>
    </details>
  </ResultPage>;
}
