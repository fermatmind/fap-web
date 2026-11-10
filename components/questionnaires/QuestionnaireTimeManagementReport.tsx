import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireTimeManagementReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
  displayLocale?: DisplayLocale;
  copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" data-time-management-result className="mt-6 space-y-10">
    <ResultOverview locale={locale} title={zh ? copy("时间管理的四个环节") : "Four parts of managing time"}
      className="border-sky-200 bg-sky-50"
      description={zh ? copy("先找一个想调整的环节，再看近两周的例子和做法。") : "Choose a part to adjust, then read the examples and actions for the past two weeks."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#time-part-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? copy("资料不足") : "Insufficient information"),
          note: zh ? copy(`${score.rated} / ${score.total}条有效回答`) : `${score.rated} / ${score.total} rated items` };
      })} />

    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section data-time-management-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`time-part-${direction.id}`}>
        <h3 id={`time-part-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-time-management-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/${score.total}题有频率回答，需要完整6题；本部分不计算均分。`) : `Insufficient information: ${score.rated}/${score.total} frequency responses; all six are required. No mean for this part.`)
          : (zh ? copy(`计分后均分：${score.mean.toFixed(1)} / 5（${score.sum} ÷ ${score.rated}，显示一位小数）`) : `Keyed mean: ${score.mean.toFixed(1)} / 5 (${score.sum} ÷ ${score.rated}, displayed to one decimal)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? copy("无相关机会或跳过不是低分，不填补。下面保留完整通用读法，不能当成本次个人成绩。") : "No relevant occasion or a skip is not a low score and is not filled in. The complete general guide remains available without assigning a personal score here."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`time-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一部分的公开完整指南") : "Read this part’s complete public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看全部读数、计分与使用说明") : "View all readings, scoring and use notes"}</summary>
      <p className="leading-8 text-slate-700">{zh
      ? copy("四部分分别回看过去两周的自报行为，不相加、不排名、不选出获胜类型。均分包含明示的反向计分，不是生产力百分比或实测能力；实践机会、任务负担和自主权需要一起考虑。相近均分不代表能力相当，也没有重要差异阈值。")
      : "These four parts describe separate reported behaviors over the past two weeks. They are not added, ranked or used to choose a winning type. Means include the stated reverse coding; they are neither productivity percentages nor tested ability. Consider opportunity, workload and autonomy. Close means do not establish equivalent ability or a meaningful difference."}</p>
    </details>
  </ResultPage>;
}
