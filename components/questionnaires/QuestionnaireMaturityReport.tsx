import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMaturityReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="maturity-reflection-title">
      <h3 id="maturity-reflection-title" className="text-xl font-semibold">{zh ? "近四周，四部分分别回看" : "Four separate reflections over the past four weeks"}</h3>
      <p className="leading-8">{zh ? `四部分中，${valid}个有足够资料显示均分。每部分6条至少4条有效，1从不至5几乎总是，全部直接键向、0条反向。没有机会、资料不足或不愿回答均排除，不补零；最低条数只是本站完整度规则。` : `${valid} of four parts have enough information for a mean. Each six-item part needs four ratings from 1 Never to 5 Almost always, with all items directly keyed and zero reversals. No opportunity, insufficient information or preferring not to answer is excluded without zero-filling. The minimum is a website completeness rule.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-maturity-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-maturity-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 6条有效频率评分` : `${facet.rated} / 6 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-maturity-insufficient>{zh ? "本次作答已结束，四部分均未生成个人均分。可以重新测试，下面四份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all four full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括本组具体做法的自报频率，不评是否够成熟、年龄、能力、健康或品德。频率标签是有序类别，平均为呈现约定，不证明等距测量；同均分可来自不同组合。四项不排序、不相加，不生成总分、年龄或固定类型，小数差异不证明显著变化。机会、现实选择空间和记忆仍需另看，接受帮助或修改约定不能被分数叫作不成熟。" : "Means summarise reported frequencies of these practices without judging whether you are mature enough, your age, ability, health or morality. Frequency labels are ordered categories; averaging is a display convention rather than established interval measurement. Equal means can come from different patterns. Parts are neither ranked nor added into a total, age or fixed type, and decimals establish no significant change. Opportunity, room to choose and recall still matter. Receiving help or revising an agreement is not immaturity inferred from a score."}</p>
    </section>
    <p className="leading-8">{zh ? "四份九模块说明全部保留，均分或资料不足都不隐藏正文。各部分包含自己的定义、频率读法、日常例子、可选表达、另外三部分比较、反例和回顾，再说明完整计分与范围。四部分是本版原创自我观察主题，不是四种成熟等级；可以先读任何一份，也可以在这里结束。" : "All four nine-section guides remain visible regardless of means or insufficient information. Each provides its own definition, frequency reading, everyday example, optional wording, comparisons with three other parts, counterexamples and review, followed by complete scoring and scope. The parts are original reflection topics rather than four maturity levels. You may read any guide first or stop here."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-maturity-profile={profile.id} aria-labelledby={`maturity-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`maturity-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的公开说明" : "Read this part’s public guide"}</Link>
    </section>)}
  </div>;
}
