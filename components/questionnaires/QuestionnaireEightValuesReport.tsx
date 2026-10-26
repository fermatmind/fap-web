import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { eightValuesPairs, type EightValuesResult } from "@/lib/questionnaires/eightValues";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireEightValuesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<EightValuesResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const title = (id: string) => quiz.profiles.find(p => p.id === id)!.title[locale];
  return <div className="my-6 space-y-8">
    <section className="rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次四轴八极结果" : "Four axes and eight poles for this attempt"}>
      <h3 className="text-xl font-semibold">{zh ? "本次四轴，分别阅读" : "Read each of your four axes separately"}</h3>
      <dl className="mt-4 space-y-6">{eightValuesPairs.map(({ axis, positive, negative }) => {
        const score = result.eightValuesAxes[axis];
        return <div key={axis} data-eight-values-axis={axis} className="space-y-2">
          <dt className="font-semibold">{quiz.directions.find(d => d.id === axis)!.title[locale]}</dt>
          <dd>{title(positive)}: {score.percentage.toFixed(1)}% · {title(negative)}: {score.complement.toFixed(1)}%</dd>
          <dd className="text-sm">{zh ? "原始加权和 / 绝对权重和：" : "Weighted sum / absolute weight sum: "}{score.sum} / {score.maximum}</dd>
        </div>;
      })}</dl>
      <p className="mt-5 leading-8">{zh ? "每一对合100%，是固定题本的归一回应，不是人口百分位、概率或两个独立特质。50可来自中立／不确定，也可来自相反回应抵消；小舍入差不构成已验证显著差。四轴不排名，没有唯一最高价值、自动意识形态或投票建议。" : "Each pair adds to 100% and normalizes responses to this fixed bank; it is not a population percentile, probability or two independent traits. A midpoint can come from neutral/unsure responses or offsetting views. Small rounded differences have no established significance. The axes are not ranked and produce no highest value, automatic ideology or voting recommendation."}</p>
    </section>
    <p className="leading-8">{zh ? "以下八份读法全部完整呈现，解释各极与互补、较高、较低、中间混合和版本边界，不是为你指定八选一人格。" : "All eight complete guides follow. Read each pole with its complement, higher, lower and mixed values and edition limits. They do not assign you one of eight personalities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`eight-values-title-${profile.id}`} data-eight-values-guide={profile.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`eight-values-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`eight-values-report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这项结果的公开说明" : "Read this result’s public guide"}</Link>
    </section>)}
  </div>;
}
