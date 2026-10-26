import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireLocusReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", facet = result.facets["total-control-beliefs"], total = facet.rated === 20 ? facet.sum : null;
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="locus-total-title">
      <h3 id="locus-total-title" className="text-xl font-semibold">{zh ? "IPIP整体二十条原始分数" : "The twenty-item IPIP total raw score"}</h3>
      <dl data-locus-facet="total-control-beliefs" className="space-y-3"><div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始总分（20—100）" : "Raw total (20–100)"}</dt><dd data-locus-total>{total === null ? missing : total}</dd></div><div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（1—5）" : "Descriptive mean (1–5)"}</dt><dd data-locus-mean>{total === null ? missing : `${(total / 20).toFixed(2)} / 5`}</dd></div><div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "本次有效条目" : "Ratings supplied"}</dt><dd data-locus-rated>{zh ? `${facet.rated} / 20条有效符合度评分` : `${facet.rated} / 20 rated accuracy items`}</dd></div></dl>
      <p className="leading-8">{zh ? "奇数十条直接计分，偶数十条按6减有效回答翻转。二十条全部有效才相加为20—100原始总分；均分只用未舍入总和除20，不从一位小数均分倒推。任一NA保留不足，不补零、中立或按其余条目估算。" : "The ten odd items are direct and ten even items use six minus a valid rating. All twenty ratings are needed for a raw total from 20–100. The mean divides the unrounded sum by twenty, never reconstructing it from a one-decimal value. Any NA retains an insufficient result without zero, neutral or estimates from other items."}</p>
      {total === null && <p data-locus-insufficient className="leading-8">{zh ? "本次作答已结束，没有生成个人总分或均分。可以重测，下面完整连续说明仍可阅读。" : "This attempt is finished without a personal total or mean. You can retake it; the full continuum guide remains readable below."}</p>}
      <p className="text-sm leading-7">{zh ? "较高较低只描述IPIP本键的控制相关自述，不派内部／外部四种类型，也不判断实际掌控、责任、能力、自尊或健康。60可能来自不同回答组合，不认证最平衡或人口平均；有序类别求和与小数不证明等距精度。未独立测内部、有权势他人和机遇三个子量表，不用假设的子量表差值生成总分。英文公有领域许可不验证本站中文、NA规则或个人结果。" : "Higher and lower describe control-related self-reports in this IPIP key, without four internal/external types or judgments of actual control, responsibility, ability, self-esteem or health. Sixty can arise from different patterns, without an ideal balance or population average. Ordered-category sums and decimals establish no interval precision. Internality, Powerful Others and Chance subscales were not independently administered, and imagined subscale differences do not generate this total. English public-domain permission validates neither this Chinese trial, NA rule nor an individual result."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-locus-profile={profile.id} aria-labelledby={`locus-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`locus-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读控制点的完整公开说明" : "Read the full public locus of control guide"}</Link>
    </section>)}
  </div>;
}
