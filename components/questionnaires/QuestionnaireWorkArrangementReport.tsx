import { ResultOverview, ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, Text } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
const anchors: Record<string, { one: Text; five: Text }> = {
  coordination: { one: { en: "Scheduled live discussion", zh: "预先约定的直接讨论" }, five: { en: "Written coordination with agreed reply times", zh: "有约定回复时间的书面协调" } },
  "decision-room": { one: { en: "Provided steps and review points", zh: "明确步骤与复核点" }, five: { en: "Choosing a method within agreed boundaries", zh: "在约定边界内选择方法" } },
  "change-rhythm": { one: { en: "Stable scope until the agreed review", zh: "范围保持到约定复核点" }, five: { en: "Revisable scope with explicit checkpoints", zh: "通过明确检查点调整范围" } },
  "feedback-rhythm": { one: { en: "Consolidated feedback at a milestone", zh: "里程碑处集中反馈" }, five: { en: "Brief feedback on small pieces", zh: "对小块成果给简短反馈" } },
};
export function QuestionnaireWorkArrangementReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string;
}) {
  const zh = locale === "zh";
  return <ResultPage variant="dimensions" className="my-6 space-y-8" data-work-arrangement-result>
    <ResultOverview locale={locale} title={zh ? copy("四组工作安排位置") : "Four work arrangement preferences"}
      className="border-indigo-200 bg-indigo-50"
      description={zh ? copy("选择一组，核对刻度两端，再看适用的任务条件。") : "Open a group to check both endpoints and then read which task conditions matter."}
      items={quiz.directions.map(direction => {
        const score = result.facets[direction.id];
        return { id: direction.id, label: direction.title[locale], href: `#work-arrangement-${direction.id}`,
          value: score.mean !== null ? `${score.mean.toFixed(1)} / 5` : (zh ? copy("资料不足") : "Insufficient information"),
          note: zh ? copy(`${score.rated} / ${score.total}条有效回答`) : `${score.rated} / ${score.total} rated items` };
      })} />

    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!, pole = anchors[direction.id];
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-work-arrangement-part={direction.id} aria-labelledby={`work-arrangement-${direction.id}`}>
        <h3 id={`work-arrangement-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
        <dl className="my-4 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2" aria-label={zh ? copy("位置两端") : "Position endpoints"}>
          <div><dt className="font-semibold">1.0</dt><dd className="leading-7">{copy(pole.one[locale])}</dd></div>
          <div><dt className="font-semibold">5.0</dt><dd className="leading-7">{copy(pole.five[locale])}</dd></div>
        </dl>
        <p data-work-arrangement-score={direction.id} className="my-4 font-semibold">{score.mean === null
          ? (zh ? copy(`资料不足：${score.rated}/6题有数值回答；需要六题完整，不计算本组位置均值。`) : `Insufficient information: ${score.rated}/6 items rated; all six are needed. No position mean is calculated for this group.`)
          : (zh ? copy(`位置均值：${score.mean.toFixed(1)} / 5（6/6题有效）`) : `Position mean: ${score.mean.toFixed(1)} / 5 (6/6 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? copy("不相关、无法判断或不愿回答都可以不计分，不转成低偏好、低能力或态度判断。以下完整指南仍可阅读。")
          : "Irrelevant situations, uncertainty or a choice not to answer stay unscored, never low preference, low ability or an attitude judgment. The complete guide remains available below."}</p>}
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`work-arrangement-report-${direction.id}`} mode="result" previewSectionIds={["example", "action"]} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读本组完整公开指南") : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? copy("本原创双语反思未建立信度、常模、预测效度或语言等价性，也没有测量任何公司。实际安排仍需看任务要求、许可、参与者、安全与无障碍条件，不按均值决定录用、晋升或是否适合一家公司。")
      : "This original bilingual reflection has no established reliability, norms, predictive validity or language equivalence and does not measure any company. Real arrangements still depend on task requirements, permission, participants, safety and accessibility. Means do not determine hiring, promotion or suitability for a company."}</p>

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看全部读数、计分与使用说明") : "View all readings, scoring and use notes"}</summary>
      <p className="leading-8">{zh
      ? copy("四组分别显示所选安排的位置均值，数字不表示能力、绩效或与公司的契合。两端都可以是合适安排；中间值可能来自无明确偏好或不同情境中的相反选择，不派主导型。")
      : "The four groups separately show position means for the selected arrangements, not ability, performance or company fit. Either endpoint can be suitable. A middle value can reflect no clear preference or opposing choices across situations; no dominant type is assigned."}</p>
    </details>
  </ResultPage>;
}
