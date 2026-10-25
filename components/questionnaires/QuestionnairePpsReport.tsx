import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { QuestionnairePpsAttribution } from "./QuestionnairePpsAttribution";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnairePpsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="pps-ratings-title">
      <h3 id="pps-ratings-title" className="text-xl font-semibold">{zh ? "三部分分别阅读，不划四种人格等级" : "Read three parts separately, without four personality tiers"}</h3>
      <p className="leading-8">{zh ? `三部分中，${valid}个有足够资料显示均分。1完全不符合至5完全符合，均分保留一位小数；自身需要4条至少3条有效，另外两部分各3条都有效。NA排除，不补零或中性。` : `${valid} of three parts have enough information for a one-decimal mean, from 1 Does not apply at all to 5 Completely applies. Own needs requires three of four ratings; the other parts all three each. NA is excluded, not zero or neutrality.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-pps-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-pps-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / ${facet.total}条有效评分` : `${facet.rated} / ${facet.total} rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-pps-insufficient>{zh ? "本次作答已结束，三部分均未生成个人均分。可以重新测试，下方三份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all three full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括本人对条目的认同，不是善良、心理健康或关系安全评分。责任感高本身不证明过度照顾；具体职责、自愿帮助与可选择范围要另外看。三个部分不合成总分、不挑最高驱动、不给四分位或人群排名，小数差异不证明因果或统计显著。" : "Means summarise your agreement, not kindness, mental health or relationship safety. Strong responsibility alone does not prove excessive care; actual duties, voluntary help and available choices require context. Parts produce no total, strongest driver, quartile or population rank; decimal differences establish neither causation nor statistical significance."}</p>
    </section>
    <p className="leading-8">{zh ? "三份完整解释均包括高低与混合读法、原创对话、反例、相近比较、实际限制和可选小观察。均分或资料不足都不隐藏正文；只用于本人日常自我观察，不给伴侣、家人或同事诊断，不预测关系命运，也不要求马上对抗或改变必要照顾。" : "All three full guides include higher, lower and mixed readings, original dialogue, counterexamples, comparisons, real constraints and optional small observations. Means or insufficient information never hide the text. Use them for your own everyday reflection, not diagnosis of a partner, relative or colleague, relationship predictions, immediate confrontation or changing necessary care."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-pps-profile={profile.id} aria-labelledby={`pps-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`pps-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
    <QuestionnairePpsAttribution locale={locale} />
  </div>;
}
