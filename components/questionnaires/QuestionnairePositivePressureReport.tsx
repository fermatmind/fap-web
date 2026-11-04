import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnairePositivePressureReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" data-positive-pressure-result className="mt-6 space-y-10">


    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section data-positive-pressure-part={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" key={direction.id} aria-labelledby={`positive-pressure-part-${direction.id}`}>
        <h3 id={`positive-pressure-part-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-positive-pressure-score={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/${score.total}题有频率回答，需要完整6题；本部分不计算均分。` : `Insufficient information: ${score.rated}/${score.total} frequency responses; all six are required. No mean for this part.`)
          : (zh ? `计分后均分：${score.mean.toFixed(1)} / 5（${score.sum} ÷ ${score.rated}，显示一位小数）` : `Keyed mean: ${score.mean.toFixed(1)} / 5 (${score.sum} ÷ ${score.rated}, displayed to one decimal)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh ? "无相关机会或跳过不是低分，不填补。下面保留完整通用读法，不能当成本次个人成绩。" : "No relevant occasion or a skip is not a low score and is not filled in. The complete general guide remains available without assigning a personal score here."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`positive-pressure-${profile.id}`} mode="result" previewSectionIds={["example", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开完整指南" : "Read this part’s complete public guide"}</Link>
      </section>;
    })}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看全部读数、计分与使用说明" : "View all readings, scoring and use notes"}</summary>
      <ResultOverview locale={locale} title={zh ? "各部分读数概览" : "Your separate readings"}
      description={zh ? "按题本顺序呈现，各部分独立阅读。点击名称可查看完整解释；资料不足与低分分开保留。" : "Shown in the form’s order, with each part read separately. Select a name for its full explanation. Insufficient information stays distinct from a lower value."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#positive-pressure-part-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? "资料不足" : "Insufficient information"),
          note: zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items` };
      })} />
      <p className="leading-8 text-slate-700">{zh
      ? "三部分分别回看过去两周的自报习惯，不相加、不排名、不选类型。较高计分均分仅表示对所选积极压力习惯认可较多，不能证明伤害、疾病或“有毒人格”；较低也不认证沟通良好。保留隐私、普通希望和安全边界本身不等于有害。相近均分不证明习惯相同。"
      : "These three parts describe separate reported habits over the past two weeks, without an aggregate, ranking or type. Higher keyed means only reflect more endorsement of the selected positive-pressure habits, not proof of harm, illness or a toxic personality; lower means do not certify helpful communication. Privacy, ordinary hope and safety boundaries are not inherently harmful. Close means do not establish equivalent habits."}</p>
    </details>
  </ResultPage>;
}
