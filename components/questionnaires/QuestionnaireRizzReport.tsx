import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireRizzReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <ResultPage variant="reflection" className="mt-6 space-y-10">
    <section className="rounded-2xl border border-teal-200 bg-teal-50/65 p-4 sm:p-6" aria-labelledby="rizz-conversation-start">
      <h3 id="rizz-conversation-start" className="text-xl font-semibold text-teal-950">{zh ? copy("挑一个对话片段回看") : "Revisit one moment from a conversation"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("可以从表达兴趣、接住话头、玩笑或邀约开始。数字只说本次你怎样回答，点开可看对话中的具体做法。") : "Start with showing interest, responding, joking or checking an invitation. The numbers describe your own responses. Open a topic for a conversation example."}</p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">{quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return <li key={direction.id} className="min-w-0 rounded-xl rounded-bl-sm border border-teal-200 bg-white px-3 pb-3">
          <a className="inline-flex min-h-11 items-center font-semibold text-teal-950 underline decoration-teal-400 underline-offset-4" href={`#facet-title-${direction.id}`}>{direction.title[locale]}</a>
          <p className="text-sm leading-6 tabular-nums">{score.mean === null ? (zh ? copy(`${score.rated}/${score.total} 项有效，未算均分`) : `${score.rated}/${score.total} rated, no mean`) : `${score.mean.toFixed(1)} / 5`}</p>
        </li>;
      })}</ul>
    </section>


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`facet-title-${direction.id}`}>
        <h3 id={`facet-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-facet-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/${score.total}题有频率回答，本版至少需要${quiz.minimumRatedItems}题；不计算个人均分。`) : `Insufficient information: ${score.rated}/${score.total} items rated; this edition needs at least ${quiz.minimumRatedItems}. No personal mean is calculated.`)
          : (zh ? copy(`有效频率均分：${score.mean.toFixed(1)} / 5（${score.rated}/${score.total}题有效）`) : `Rated-frequency mean: ${score.mean.toFixed(1)} / 5 (${score.rated}/${score.total} items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? copy("以下为这一部分的通用读法，不能当作对你本次状态的解释。") : "The following is a general reading guide, not an interpretation of your state in this attempt."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["plain", "detail", "ordinary", "clear", "example", "paper"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一部分的公开说明") : "Read this part’s public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8 text-slate-700">{zh ? copy("四组分别回看过去四周你自己的做法，不相加、不派Rizz等级，也不替对方判断好感。没有机会时不补零，四份完整指南始终可读。笑容、沉默和本次结果都不能替代对具体下一步的同意。") : "Read four practice groups separately. Means describe the frequencies you reported over four weeks, not a Rizz tier or another person’s feelings. All four full guides remain open; missing opportunities stay unscored. A smile, silence or this result cannot replace agreement to a particular next step."}</p>
    </details>
  </ResultPage>;
}
