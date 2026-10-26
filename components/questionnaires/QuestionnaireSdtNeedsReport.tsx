import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSdtNeedsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="sdt-needs-reflection-title">
      <h3 id="sdt-needs-reflection-title" className="text-xl font-semibold">{zh ? "六项需要体验，满足与受阻分别理解" : "Six need experiences: satisfaction and frustration separately"}</h3>
      <p className="leading-8">{zh ? `六部分中，${valid}个有足够资料显示均分。每部分4条至少3条有效，1从不至5几乎总是；没有反向题。受阻体验不反向补成满足，NA排除不补零，最低条数只是本站完整度规则。` : `${valid} of six parts have enough information for a mean. Each four-item part needs three ratings from 1 Never to 5 Almost always. There are no reverse items: frustration never reverses into satisfaction. NA is excluded without zero-filling; the minimum is a website completeness convention.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-sdt-needs-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-sdt-needs-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效频率评分` : `${facet.rated} / 4 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-sdt-needs-insufficient>{zh ? "本次作答已结束，六部分均未生成个人均分。可以重新测试，下面六份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all six full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分概括同一选定领域近四周的自报体验。自主满足与受阻、胜任满足与受阻、联结满足与受阻分别保留，不相加、不相减、不按最高项派型。低满足不自动等于高受阻；两项都高可以回看不同事件，都低也不证明理想平衡。这里不测需要重要程度、实际能力、内外在动机调节、健康或职业。相同均分保留，小数差异不证明显著或改变。" : "Means summarise four weeks of reported experiences in one selected area. Keep satisfaction and frustration separate for autonomy, competence and relatedness, without adding, subtracting or assigning a highest-score type. Low satisfaction does not automatically mean high frustration. Two higher means can prompt a look at different events; two lower means establish no ideal balance. Need importance, actual ability, motivational regulation, health and careers are unmeasured. Equal means stay equal, and decimals establish neither significance nor change."}</p>
    </section>
    <p className="leading-8">{zh ? "全部六份完整说明保留高低、混合与资料不足读法、具体情境、表达、其他五项比较、反例和可选观察。自主不等于必须独立做事，胜任感不等于客观技能，联结不等于朋友数量。它是原创情境观察，不是官方标准量表或固定动机人物分类。均分与NA都不隐藏正文；现实条件、他人意图和行动原因仍需实际信息。" : "All six full guides retain higher, lower, mixed and insufficient readings, concrete situations, wording, five comparisons, counterexamples and optional observations. Autonomy requires no independence, felt competence is no measured skill, and connection is no friend count. This is an original contextual reflection rather than an official standard instrument or fixed motivation-persona classification. Means and NA never hide the body; actual conditions, intentions and reasons for action need actual information."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-sdt-needs-profile={profile.id} aria-labelledby={`sdt-needs-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`sdt-needs-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
