import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireFrictionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="friction-ratings-title">
      <h3 id="friction-ratings-title" className="text-xl font-semibold">{zh ? "七部分分别阅读，不派难相处人格" : "Read seven parts separately, without a difficult-person type"}</h3>
      <p className="leading-8">{zh ? `七部分中，${valid}个有足够资料显示均分。每项4题至少3条有效评分，按1从不至5几乎总是、反向题6减评分后取一位小数均分。NA排除，不补零或中性。` : `${valid} of seven parts have enough information for a one-decimal mean. Each four-item part needs three ratings from 1 Never to 5 Almost always, with rated reverse items scored as six minus the response. NA is excluded, not zero or neutrality.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-friction-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-friction-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效评分` : `${facet.rated} / 4 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-friction-insufficient>{zh ? "本次作答已结束，七部分均未生成个人均分。可以重新测试，下方七份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all seven full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括最近四周所选行为的自报频率，不是他人实际评价、道德、能力、心理健康或现实安全。七项不合成总分、难相处百分比或最高人格；同分保留，小数差异不证明统计显著、原因或改善。全部低也不认证容易相处，高分不诊断或给行为免责。" : "Means summarise reported frequency of selected behaviours in four weeks, not observers’ judgments, morality, ability, mental health or actual safety. There is no total, difficulty percentage or highest-score personality. Equal means stay equal; decimals establish neither significance, causes nor improvement. All-low responses certify no easy-going identity, and high means diagnose nothing or excuse no behaviour."}</p>
    </section>
    <p className="leading-8">{zh ? "七份完整说明均保留高低与混合读法、原创对话、反例、相近比较、情境限制和可选小观察。均分或资料不足都不隐藏正文。需要、职责、隐私、合理谨慎、坚定反对与经过考虑的尝试，都要按实际情况理解；不靠自报给伴侣判型、判断关系安全或预测伤害。" : "All seven full guides retain higher, lower and mixed readings, original dialogue, counterexamples, comparisons, context limits and optional observations. Means or insufficiency never hide the text. Needs, duties, privacy, reasonable caution, firm opposition and considered attempts require actual context. Self-report cannot type a partner, judge relationship safety or predict harm."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-friction-profile={profile.id} aria-labelledby={`friction-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`friction-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
