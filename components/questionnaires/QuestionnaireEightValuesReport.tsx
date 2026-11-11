import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { eightValuesPairs, type EightValuesResult } from "@/lib/questionnaires/eightValues";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireEightValuesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<EightValuesResult, { status: "complete" }>; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  const colors = {
    econ: ["#b53e46", "#236962"], dipl: ["#a85e1d", "#2267a0"],
    govt: ["#9a751a", "#494b9d"], scty: ["#52782a", "#843f93"],
  } as const;
  const title = (id: string) => quiz.profiles.find(p => p.id === id)!.title[locale];
  return <div className="my-6 space-y-8">
    <section className="rounded-xl border border-violet-200 bg-violet-50/55 p-4 sm:p-6" aria-label={zh ? displayText("本次四轴八极结果") : "Four axes and eight poles for this attempt"}>
      <h3 className="text-xl font-semibold">{zh ? displayText("本次四轴，分别阅读") : "Read each of your four axes separately"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? displayText("每条轴的两端一起读。选一端可读它涉及哪些议题和取舍，另一端的指南也始终可读。") : "Read both ends of each axis together. Open either end for its issues and trade-offs. The guide to the other end remains available."}</p>
      <dl className="mt-5 grid gap-3">{eightValuesPairs.map(({ axis, positive, negative }) => {
        const score = result.eightValuesAxes[axis];
        const [left, right] = colors[axis];
        const reversed = axis === "dipl" || axis === "scty";
        const poles = [{ id: positive, value: score.percentage }, { id: negative, value: score.complement }];
        const [leftPole, rightPole] = reversed ? [poles[1], poles[0]] : poles;
        return <div key={axis} data-eight-values-axis={axis} className="min-w-0 space-y-2 rounded-lg border border-violet-200 bg-white p-3 sm:p-4">
          <dt className="font-semibold">{quiz.directions.find(d => d.id === axis)!.title[locale]}</dt>
          <dd className="grid grid-cols-2 gap-3 text-sm leading-6">
            <a className="inline-flex min-h-11 flex-col justify-center font-medium text-violet-950 underline underline-offset-4" href={`#eight-values-title-${leftPole.id}`}>{title(leftPole.id)} <span className="tabular-nums">{leftPole.value.toFixed(1)}%</span></a>
            <a className="inline-flex min-h-11 flex-col items-end justify-center text-right font-medium text-teal-950 underline underline-offset-4" href={`#eight-values-title-${rightPole.id}`}>{title(rightPole.id)} <span className="tabular-nums">{rightPole.value.toFixed(1)}%</span></a>
          </dd>
          <dd aria-hidden="true" className="relative flex h-4 overflow-hidden rounded-full sm:h-6"><span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white" /><span style={{ backgroundColor: left, width: `${leftPole.value}%` }} /><span style={{ backgroundColor: right, width: `${rightPole.value}%` }} /></dd>
          <dd className="text-sm">{zh ? displayText("原始加权和 / 绝对权重和：") : "Weighted sum / absolute weight sum: "}{score.sum} / {score.maximum}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 leading-8">{zh ? displayText("每一对合100%，是固定题本的归一回应，不是人口百分位、概率或两个独立特质。50可来自中立／不确定，也可来自相反回应抵消；小舍入差不构成已验证显著差。四轴不排名，没有唯一最高价值、自动意识形态或投票建议。") : "Each pair adds to 100% and normalizes responses to this fixed bank; it is not a population percentile, probability or two independent traits. A midpoint can come from neutral/unsure responses or offsetting views. Small rounded differences have no established significance. The axes are not ranked and produce no highest value, automatic ideology or voting recommendation."}</p>
    </section>
    <p className="leading-8">{zh ? displayText("以下八份读法全部完整呈现，解释各极与互补、较高、较低、中间混合和版本边界，不是为你指定八选一人格。") : "All eight complete guides follow. Read each pole with its complement, higher, lower and mixed values and edition limits. They do not assign you one of eight personalities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`eight-values-title-${profile.id}`} data-eight-values-guide={profile.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`eight-values-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`eight-values-report-${profile.id}`} mode="result" previewSectionIds={[`${profile.id}-2`, `${profile.id}-5`]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读这项结果的公开说明") : "Read this result’s public guide"}</Link>
    </section>)}
  </div>;
}
