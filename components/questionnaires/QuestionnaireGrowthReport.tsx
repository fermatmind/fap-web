import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireGrowthReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", facet = result.facets["changeability-belief"];
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="growth-belief-title">
      <h3 id="growth-belief-title" className="text-xl font-semibold">{zh ? "所选技能的当前可改变信念" : "Current changeability beliefs for your selected skill"}</h3>
      <dl><div data-growth-facet="changeability-belief" className="flex flex-wrap justify-between gap-3"><dt>{quiz.directions[0].title[locale]}</dt><dd><span data-growth-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 12条有效同意度评分` : `${facet.rated} / 12 rated agreement items`}</span></dd></div></dl>
      <p className="leading-8">{zh ? "六条可改变表述直接计分，六条较固定表述（第2、4、6、8、10、12题）按6减有效回答翻转。至少9条有效才显示简单均分／一位小数；缺失排除不补零，最低条数只是本站完整度约定。" : "Six changeable statements are direct; six more fixed statements, items 2, 4, 6, 8, 10 and 12, use six minus a valid rating. Nine ratings are needed for a simple mean rounded to one decimal. Missing information is excluded without zero substitution; the minimum is a website completeness rule."}</p>
      {facet.mean === null && <p data-growth-insufficient className="leading-8">{zh ? "本次作答已结束，没有足够资料生成个人均分。可用一致的技能参照重新作答，下面完整读法仍可阅读。" : "This attempt is finished without enough information for a personal mean. You can retake with a consistent skill reference; the complete reading remains available below."}</p>}
      <p className="text-sm leading-7">{zh ? "较高只表示在本题表述上较偏可改变看法，较低偏较固定看法；不按阈值派成长或固定类型。中间可能来自中立或不同组合，不认证最平衡。数字不评技能、IQ、努力或成绩；有序同意类别的平均不证明等距测量，小数差异不证明显著变化。同一技能参照、方法、资源和支持都需另看，休息、停止或求助不等于固定心态。" : "Higher means lean toward changeable beliefs on these statements; lower means toward more fixed beliefs, without a cutoff assigning types. A middle mean may reflect neutral or different response patterns, not an ideal balance. Numbers assess neither skill, IQ, effort nor achievement. Averaging ordered agreement categories establishes no interval measurement or significant decimal change. The reference, methods, resources and support still matter. Resting, stopping or seeking help is not a fixed mindset inferred here."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-growth-profile={profile.id} aria-labelledby={`growth-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`growth-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读完整连续读法的公开说明" : "Read the full public continuum guide"}</Link>
    </section>)}
  </div>;
}
