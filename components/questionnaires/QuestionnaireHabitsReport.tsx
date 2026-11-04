import { ResultReadingNav } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireHabitsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.rated === 4).length;
  return <div className="my-6 space-y-8">

    <ResultReadingNav collapsible label={zh ? "选择想读的部分" : "Choose a part to read"} sections={quiz.profiles.map(profile => ({ id: `habits-title-${profile.id}`, title: profile.title[locale] }))} />


    {quiz.profiles.map(profile => <section key={profile.id} data-habits-profile={profile.id} aria-labelledby={`habits-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`habits-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.rated === 4 ? facet.sum / 4 : null; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? "本次均分：" : "Your mean: "}{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`}</p>; })()}

      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "optional"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一部分的完整公开说明" : "Read this part’s full public guide"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "全部读数、计分与使用说明" : "All readings, scoring and use notes"}</summary>
      <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="habits-reflection-title">
      <h3 id="habits-reflection-title" className="text-xl font-semibold">{zh ? "过去三个月，五种做法分开回看" : "Five separate practices over the past three months"}</h3>
      <p className="leading-8">{zh ? `五部分中，${valid}个有完整评分。每部分四条全部数值有效才以原始和除4显示两位描述性均分；0条反向，不从一位小数倒推。3表示不确定或视情况，数值有效但不是中立频率。NA表示没有情境、资料不足或不愿回答，不补零、不补3，也不由其余条目估算。` : `${valid} of five parts have complete ratings. Each needs all four numeric ratings for a two-decimal descriptive mean from the raw sum divided by four, with zero reversals and no reconstruction from a one-decimal mean. Three is numerically valid uncertainty or conditionality, not a neutral frequency. NA means no relevant situation, insufficient information or preferring not to answer, without zero, three or estimates from other items.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 4 ? facet.sum / 4 : null;
        return <div key={direction.id} data-habits-facet={direction.id} className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt className="font-medium">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#habits-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd><span data-habits-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span><span className="block text-sm text-slate-600" data-habits-rated>{zh ? `${facet.rated} / 4条有效符合度评分` : `${facet.rated} / 4 rated accuracy items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p data-habits-insufficient className="leading-8">{zh ? "本次作答已结束，五部分均未生成个人均分。可以重新测试，下面五份完整说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all five full guides remain readable below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括这些具体做法的自述符合度，不是频率、强度、毒性百分比、品德、实际伤害、风险或诊断。五项不排序、不相加、不分等级或人格类型；小数不证明等距精度或显著变化，同均分可来自不同组合。解释、隐私、沉默、退开、求助和安全边界不能据此叫作有毒，不用结果替别人定性或裁定责任。" : "Means summarise self-described accuracy for these specific practices, not frequency, intensity, a toxicity percentage, morality, actual harm, risk or diagnosis. Parts are neither ranked, added nor divided into bands or personality types. Decimals establish no interval precision or significant change, and equal means can represent different patterns. Explanation, privacy, silence, stepping away, support and safety boundaries cannot be classified as toxic from this result, which cannot label someone else or assign responsibility."}</p>
    </section>
      <p className="leading-8">{zh ? "五份完整说明全部保留，资料不足不隐藏正文。每份包含自己的含义、符合度、例子、可选表达、其他主题比较、反例与回顾，再说明完整计分、来源和隐私。它们是本版具体观察主题，不是五种有毒人格；可以先读任何一份，也可以在这里结束。" : "All five full guides remain available, including with missing information. Each offers its own meaning, rating interpretation, example, optional wording, comparisons, counterexamples and review, followed by full scoring, source scope and privacy. These are specific reflection topics, not five toxic personalities. You can read any guide or stop here."}</p>
    </details>
  </div>;
}
