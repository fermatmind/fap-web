import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireValuesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = quiz.directions.filter(d => result.facets[d.id].mean !== null).length;
  const fullyRated = quiz.directions.every(d => result.facets[d.id].rated === 3);
  const baseline = fullyRated ? quiz.directions.reduce((sum, d) => sum + result.facets[d.id].sum, 0) / 30 : null;
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="values-reflection-title">
      <h3 id="values-reflection-title" className="text-xl font-semibold">{zh ? "十类价值：原始重要程度与本次相对优先级" : "Ten values: raw importance and relative priorities"}</h3>
      <p className="leading-8">{zh ? `十部分中，${valid}个有足够资料显示原始均分。每类三条全部有效，1不重要至5极其重要；没有反向题。暂不作答不补成零或中点。只有全部30条有效，才计算个人整体均分和相对值。` : `${valid} of ten parts have enough information for raw means. Each value requires all three ratings from 1 Not important to 5 Extremely important, with no reverse items. Unscored responses are never filled with zero or a midpoint. Only all 30 ratings permit an overall mean and relative values.`}</p>
      <p className="leading-8">{zh ? "本次个人整体均分：" : "Your overall mean for this attempt: "}<span data-values-baseline>{baseline === null ? missing : baseline.toFixed(2)}</span></p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], raw = facet.mean === null ? null : facet.sum / facet.rated;
        const relative = baseline === null || raw === null ? null : raw - baseline;
        const relativeText = relative === null ? missing : `${relative > 0 ? "+" : ""}${(Math.abs(relative) < 0.0000001 ? 0 : relative).toFixed(2)}`;
        return <div key={direction.id} data-values-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span className="block">{zh ? "原始均分：" : "Raw mean: "}<span data-values-mean>{raw === null ? missing : `${raw.toFixed(2)} / 5`}</span></span><span className="block">{zh ? "相对值：" : "Relative value: "}<span data-values-relative>{relativeText}</span></span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 3条有效重要程度评分` : `${facet.rated} / 3 rated importance items`}</span></dd></div>;
      })}</dl>
      {baseline === null && <p className="leading-8" data-values-baseline-insufficient>{zh ? "本次没有估计整体基线或相对值。已完整部分的原始均分仍保留，不用其余回答推算缺失；十份正文均可完整阅读。" : "No overall baseline or relative values were estimated. Fully rated parts retain raw means without estimating missing responses. All ten full guides remain available."}</p>}
      {valid === 0 && <p className="leading-8" data-values-insufficient>{zh ? "本次作答已结束，十部分均未生成个人均分。可以重新测试，也可以阅读下面全部完整说明。" : "This attempt is finished without personal means for any part. You can retake it or read every full guide below."}</p>}
      <p className="text-sm leading-7">{zh ? "相对值用该类未舍入的和除3，减全部30条的和除30。显示值已舍入，计算不先舍入；小数位不表示测量精度。正值只高于本次自己的整体评分，负值只低于自己整体，零不是不重视。全部选相同答案时，十项相对值均为零，仍是有效回答。十类按框架顺序一起呈现，不排名、不硬派唯一顶部或主副型，也不是人群百分位、道德、能力、健康或职业结论。" : "Each relative value uses its unrounded sum divided by three minus the overall sum divided by 30. Displayed values are rounded; calculations are not rounded first, and decimals imply no measurement precision. Signs compare with your own overall ratings only, and zero does not mean unimportant. Identical responses give ten valid zero relative values. All ten appear in framework order without ranking or a sole top or primary/secondary type, population percentiles, morality, ability, health or career verdicts."}</p>
    </section>
    <p className="leading-8">{zh ? "下面十份完整说明同时保留例子、其他九类比较、表达、反例、使用范围和可选回顾。题目问目标的重要程度，不测实际行为或人物相似度。这是30条原创框架反思，不是PVQ、SVS标准问卷或经验证的工具；分数和资料不足都不隐藏正文。" : "All ten full guides retain examples, nine comparisons, wording, counterexamples, scope and optional observations. Items concern the importance of goals rather than actual behaviour or portrait similarity. This is an original 30-item framework reflection, not a standard PVQ, SVS or validated instrument. Scores and insufficient information never hide the body."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-values-profile={profile.id} aria-labelledby={`values-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`values-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
