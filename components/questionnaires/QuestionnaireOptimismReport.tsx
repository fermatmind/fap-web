import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { OptimismResult } from "@/lib/questionnaires/optimism";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireOptimismReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<OptimismResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  if (result.total === null || result.mean === null) return <section className="my-6 space-y-4 rounded-lg bg-slate-50 p-4" data-optimism-insufficient>
    <h3 className="text-xl font-semibold">{zh ? "资料不足，未生成分数或个人分区" : "Insufficient information: no score or personal band"}</h3>
    <p className="leading-8">{zh ? `本次有${result.rated}项有效评分，需要十项全部有效才能计分。暂不作答或无法判断不补成零分或中间值。可以重新测试，也可以直接阅读下面五份公开说明。` : `${result.rated} of ten items have ratings. All ten are required for scoring. An unscored response is never replaced by zero or a midpoint. You can retake the test or read any of the five public guides below.`}</p>
    <ul>{quiz.profiles.map(profile => <li key={profile.id}><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{profile.title[locale]}</Link></li>)}</ul>
  </section>;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次IPIP乐观原始分数" : "Raw IPIP Optimism score for this attempt"} data-optimism-score>
      <h3 className="text-xl font-semibold">{zh ? "十项原始分数与均分" : "Ten-item raw total and mean"}</h3>
      <dl className="space-y-3"><div className="flex justify-between gap-4"><dt>{zh ? "原始总分（范围10—50）" : "Raw total (range 10–50)"}</dt><dd data-optimism-total>{result.total}</dd></div><div className="flex justify-between gap-4"><dt>{zh ? "均分（范围1—5）" : "Mean (range 1–5)"}</dt><dd data-optimism-mean>{result.mean.toFixed(1)}</dd></div></dl>
      <p className="text-sm leading-7">{zh ? "四条正向题按原值计分，六条反向题按6减原回答。均分3只是回答尺度的中点，不是人群平均。总分18、26、34、42时保留相邻两份报告；这是本站阅读约定，不是IPIP官方分类、常模、百分位或置信区间。" : "Four positive items use the response; six negative items use 6 minus the response. A mean of three is the response-scale midpoint, not a population average. Totals of 18, 26, 34 and 42 keep both adjacent reports. This is a website reading convention, not official IPIP classification, norms, percentiles or confidence intervals."}</p>
    </section>
    <p className="leading-8">{zh ? `本次对应${result.outlookProfileIds.length}份完整说明，全部呈现在下方。标签帮助阅读一个连续维度，不是固定人格、健康、能力或职业结论。` : `This attempt corresponds to ${result.outlookProfileIds.length} full guide${result.outlookProfileIds.length === 1 ? "" : "s"}, all shown below. Labels help read one continuous dimension; they do not establish a fixed personality, health, ability or career verdict.`}</p>
    {result.outlookProfileIds.map(id => {
      const profile = quiz.profiles.find(p => p.id === id)!;
      return <section key={id} aria-labelledby={`optimism-title-${id}`} data-optimism-match={id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`optimism-title-${id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, id)}>{zh ? "阅读这项结果的公开说明" : "Read this result’s public guide"}</Link>
      </section>;
    })}
  </div>;
}
