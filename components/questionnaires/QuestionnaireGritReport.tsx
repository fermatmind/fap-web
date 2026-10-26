import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireGritReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.rated >= 6).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="grit-reflection-title">
      <h3 id="grit-reflection-title" className="text-xl font-semibold">{zh ? "同一长期目标，六个月的两部分回顾" : "Two reflections on one long-term aim over six months"}</h3>
      <p className="leading-8">{zh ? `两部分中，${valid}个有足够评分。各八条至少六条数值有效，才用该组未舍入计分和除有效条数，显示两位描述性均分。第9—12条为反向题，按6减有效回答处理；NA先排除，不翻成6或补零。其他十二条直接计分，不从一位小数均分倒推。` : `${valid} of two parts have enough ratings. Each eight-item part needs six numeric ratings for a two-decimal descriptive mean from its unrounded keyed sum divided by rated count. Items nine through twelve reverse a valid response using six minus the rating; NA is excluded first, without becoming six or zero. The other twelve items are direct, with no reconstruction from a one-decimal mean.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated >= 6 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-grit-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-grit-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span><span className="block text-sm text-slate-600" data-grit-rated>{zh ? `${facet.rated} / 8条有效频率评分` : `${facet.rated} / 8 rated frequency items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p data-grit-insufficient className="leading-8">{zh ? "本次作答已结束，两部分均未生成个人均分。可以重新测试，下面两份完整说明仍可阅读。" : "This attempt is finished without personal means for either part. You can retake it; both full guides remain readable below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只描述针对同一私选目标、过去六个月的做法频率，不是Duckworth标准Grit Scale或多年稳定毅力。两项不相加、不排序、不生成总体0—100、四等级或最高类型。有序类别的平均不证明等距精度、两项可比或可靠变化，同均分可来自不同组合。不预测能力、成功、职业、健康或招聘录取；合理调整、休息、暂停和停止不能被分数叫作失败。" : "Means describe reported practices around one privately chosen aim over six months, not the standard Duckworth Grit Scale or stable years-long grit. Parts are neither added nor ranked into an overall 0–100 score, four bands or highest type. Averaging ordered categories establishes no interval precision, cross-part comparability or reliable change, and equal means can represent different patterns. Ability, success, career, health, hiring and admissions are not predicted. Appropriate adjustments, rest, pauses and stopping cannot be classified as failure from a score."}</p>
    </section>
    <p className="leading-8">{zh ? "两份九模块说明全部保留，资料不足不隐藏正文。各自包含定义、频率读法、具体例子、可选尝试、两主题比较、反例与回顾，再完整说明复算、来源和隐私。它们是本版长期目标回顾的两个主题，不是两种或四种毅力人格；可以先读任一份，也可以在这里结束。" : "Both nine-section guides remain available, including with missing information. Each offers its definition, frequency reading, concrete example, optional reflection, comparisons, counterexamples and review, followed by full scoring, source scope and privacy. These are two reflection topics, not two or four grit personalities. You can read either guide or stop here."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-grit-profile={profile.id} aria-labelledby={`grit-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`grit-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的完整公开说明" : "Read this part’s full public guide"}</Link>
    </section>)}
  </div>;
}
