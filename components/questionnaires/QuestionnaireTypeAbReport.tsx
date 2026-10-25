import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireTypeAbReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="type-ab-reflection-title">
      <h3 id="type-ab-reflection-title" className="text-xl font-semibold">{zh ? "四项独立行为观察，不派固定A/B类型" : "Four separate behaviour reflections, without a fixed A/B type"}</h3>
      <p className="leading-8">{zh ? `四部分中，${valid}个有足够资料显示均分。每部分5条至少3条有效，1从不至5几乎总是；每部分2条相反表述按6减有效回答，共8条反向。NA排除不补零，最低条数只是本站完整度规则。` : `${valid} of four parts have enough information for a mean. Each five-item part needs three ratings from 1 Never to 5 Almost always. Two opposite statements per part, eight overall, use six minus a valid response. NA is excluded without zero-filling; the minimum is a website completeness rule.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-type-ab-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-type-ab-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 5条有效频率评分` : `${facet.rated} / 5 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-type-ab-insufficient>{zh ? "本次作答已结束，四部分均未生成个人均分。可以重新测试，下面四份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all four full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分概括本组题目中的自报频率，不判断原因、能力、健康或实际表现。四项不相加、不按最高项派型，没有A/B总分、百分位或科学阈值。中间值可能由不同答案组合产生，不认证最平衡、最灵活或更健康；资料不足不记成B型。相同均分保留，小数差异不证明显著或改变。" : "Means summarise reported frequencies in these items, without establishing causes, ability, health or actual performance. Parts produce no total, highest-score type, A/B score, percentile or scientific cutoff. Different answers can produce the same middle mean, which certifies no ideal balance, flexibility or health. Insufficient information is not Type B. Equal means stay equal, and decimals establish neither significance nor change."}</p>
    </section>
    <p className="leading-8">{zh ? "全部四份完整说明保留高低、混合与资料不足读法、普通例子、表达、相近比较、反例和可选观察。A/B是历史讨论背景，四项是本版原创编辑观察框架；真实职责、资源、时间和选择余地仍要另看，不用均分给自己或别人贴标签。均分与NA都不隐藏正文，也不决定聘用、职业或健康安排。" : "All four full guides retain higher, lower, mixed and insufficient readings, ordinary examples, wording, comparisons, counterexamples and optional observations. A/B is historical context; these four parts are original editorial observation categories. Actual duties, resources, time and choice still matter. Means label neither you nor others. Scores and NA never hide the body or determine hiring, careers or health arrangements."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-type-ab-profile={profile.id} aria-labelledby={`type-ab-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`type-ab-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
