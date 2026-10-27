import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireApologyPreferenceReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div data-apology-preference-result className="mt-6 space-y-10">
    <p className="leading-8 text-slate-700">{zh
      ? "五组分别描述接收道歉时对题中内容的重视程度，不相加、不排名，不按并列次序强派主要语言。较高只表示更重视所列内容，不推断你自己怎样道歉、他人是否真诚或关系是否会恢复。相同均分全部保留，小差距不证明需要有重要差别；没有人因此负有原谅义务。"
      : "These five groups describe what you value when receiving an apology, without an aggregate, ranking or primary language selected by a tie-break. Larger means only reflect more stated importance of the listed elements. They do not establish how you apologize, anyone’s sincerity or whether a relationship will recover. Equal means all remain visible; small gaps do not establish meaningful differences. No result creates a duty to forgive."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section data-apology-preference-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`apology-preference-part-${direction.id}`}>
        <h3 id={`apology-preference-part-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-apology-preference-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/${score.total}题有重视程度回答，需要完整4题；本部分不计算均分。` : `Insufficient information: ${score.rated}/${score.total} importance ratings; all four are required. No mean for this part.`)
          : (zh ? `重视程度均分：${score.mean.toFixed(1)} / 5（${score.sum} ÷ ${score.rated}，显示一位小数）` : `Importance mean: ${score.mean.toFixed(1)} / 5 (${score.sum} ÷ ${score.rated}, displayed to one decimal)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "无相关机会或跳过不是低分，不填补。下面保留完整通用读法，不能当成本次个人成绩。" : "No relevant occasion or a skip is not a low score and is not filled in. The complete general guide remains available without assigning a personal score here."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`apology-preference-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开完整指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}
  </div>;
}
