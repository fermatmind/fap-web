import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireApologyPreferenceReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" data-apology-preference-result className="mt-6 space-y-10">
    <section className="border-y border-rose-200 bg-rose-50/60 p-4 sm:p-6" aria-labelledby="apology-reading-start">
      <h3 id="apology-reading-start" className="text-xl font-semibold text-rose-950">{zh ? copy("收到道歉时，你在意哪些内容") : "What matters to you when someone apologises?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("选五项中的任意一项，读它在真实对话里可能怎样出现。数字表示你对这些内容的重视程度。") : "Open any element to see how it might come up in a conversation. Each number reflects how much importance you gave to the listed elements."}</p>
      <ol className="mt-4 divide-y divide-rose-200 border-t border-rose-200">
        {quiz.directions.map(direction => {
          const score = result.facets[direction.id];
          return <li key={direction.id} className="flex flex-wrap items-center justify-between gap-x-4 py-1">
            <a className="inline-flex min-h-11 items-center font-semibold text-rose-950 underline underline-offset-4" href={`#apology-preference-part-${direction.id}`}>{direction.title[locale]}</a>
            <span className="text-sm font-semibold tabular-nums">{score.mean === null ? (zh ? copy(`${score.rated}/${score.total} 项有效，未算均分`) : `${score.rated}/${score.total} rated, no mean`) : `${score.mean.toFixed(1)} / 5`}</span>
          </li>;
        })}
      </ol>
    </section>

    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section data-apology-preference-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`apology-preference-part-${direction.id}`}>
        <h3 id={`apology-preference-part-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-apology-preference-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/${score.total}题有重视程度回答，需要完整4题；本部分不计算均分。`) : `Insufficient information: ${score.rated}/${score.total} importance ratings; all four are required. No mean for this part.`)
          : (zh ? copy(`重视程度均分：${score.mean.toFixed(1)} / 5（${score.sum} ÷ ${score.rated}，显示一位小数）`) : `Importance mean: ${score.mean.toFixed(1)} / 5 (${score.sum} ÷ ${score.rated}, displayed to one decimal)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? copy("无相关机会或跳过不是低分，不填补。下面保留完整通用读法，不能当成本次个人成绩。") : "No relevant occasion or a skip is not a low score and is not filled in. The complete general guide remains available without assigning a personal score here."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`apology-preference-${profile.id}`} mode="result" previewSectionIds={["meaning", "scene", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一部分的公开完整指南") : "Read this part’s complete public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8 text-slate-700">{zh
      ? copy("五组分别描述接收道歉时对题中内容的重视程度，不相加、不排名，不按并列次序强派主要语言。较高只表示更重视所列内容，不推断你自己怎样道歉、他人是否真诚或关系是否会恢复。相同均分全部保留，小差距不证明需要有重要差别；没有人因此负有原谅义务。")
      : "These five groups describe what you value when receiving an apology, without an aggregate, ranking or primary language selected by a tie-break. Larger means only reflect more stated importance of the listed elements. They do not establish how you apologize, anyone’s sincerity or whether a relationship will recover. Equal means all remain visible; small gaps do not establish meaningful differences. No result creates a duty to forgive."}</p>
    </details>
  </ResultPage>;
}
