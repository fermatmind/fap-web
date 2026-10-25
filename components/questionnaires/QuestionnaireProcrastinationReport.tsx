import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireProcrastinationReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="procrastination-ratings-title">
      <h3 id="procrastination-ratings-title" className="text-xl font-semibold">{zh ? "六种情境分别阅读，不派固定人格" : "Read six patterns separately, without a fixed personality"}</h3>
      <p className="leading-8">{zh ? `六部分中，${valid}个有足够资料显示均分。每部分4题至少3条有效评分，按1从不至5几乎总是、反向题6减有效评分后取一位小数均分。NA排除，不补零；最低条数只是本站完整度规则。` : `${valid} of six parts have enough information for a one-decimal mean. Each four-item part needs three ratings from 1 Never to 5 Almost always, with opposite items scored as six minus a valid response. NA is excluded without zero-filling; the minimum is a website completeness rule.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-procrastination-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-procrastination-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效评分` : `${facet.rated} / 4 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-procrastination-insufficient>{zh ? "本次作答已结束，六部分均未生成个人均分。可以重新测试，下面六份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all six full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括近四周选定普通任务行为的自报频率，不确定隐藏原因、能力、心理健康或实际表现。没有总分、最高人格、百分位或职业适配；相同均分保留，小数差异不证明显著、原因或改变。全部较低也不认证完全没有拖延。" : "Means summarise four weeks of reported selected ordinary-task behaviours, without establishing hidden causes, ability, mental health or actual performance. There is no total, highest-score personality, percentile or career fit. Equal means stay equal, and decimals establish neither significance, causes nor change. All-low responses certify no absence of procrastination."}</p>
    </section>
    <p className="leading-8">{zh ? "全部六份完整说明都呈现具体读法、原创情境、反例、相近比较与可选小观察。必要信息、安全、休息、健康、照护和无法自行改变的工作量须按现实核对；风格名称不替代正式任务要求，均分或资料不足都不隐藏正文。" : "All six full guides retain specific readings, original situations, counterexamples, comparisons and optional observations. Necessary information, safety, rest, health, caring duties and workloads outside your control need actual consideration. Style names do not override task requirements, and means or insufficient information never hide the body."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-procrastination-profile={profile.id} aria-labelledby={`procrastination-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`procrastination-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
