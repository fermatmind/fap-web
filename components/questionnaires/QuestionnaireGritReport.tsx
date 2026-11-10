import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireGritReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.rated >= 6).length;
  return <div className="my-6 space-y-8">

    <section className="rounded-xl bg-orange-50/65 p-4 sm:p-6" aria-labelledby="grit-goal-start">
      <h3 id="grit-goal-start" className="text-xl font-semibold text-orange-950">{zh ? copy("围绕同一个长期目标回看两件事") : "Look at two parts of the same long-term goal"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("目标如何延续、遇到挫折后怎样重新投入，各有自己的读数。选一项，再看时间、资源和目标变化怎样影响你当时的选择。") : "Staying with a goal and returning to effort after setbacks have separate readings. Choose one for examples of how time, resources or a changing goal can affect what you do."}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{quiz.profiles.map(profile => {
        const facet = result.facets[profile.directionIds[0]];
        return <a href={`#grit-title-${profile.id}`} key={profile.id} className="min-w-0 border-t border-orange-300 py-3">
          <span className="block font-semibold text-orange-950 underline decoration-orange-500 underline-offset-4">{profile.title[locale]}</span>
          <span className="mt-2 block text-sm font-semibold tabular-nums">{facet.rated >= 6 ? `${(facet.sum / facet.rated).toFixed(2)} / 5` : (zh ? copy("资料不足") : "Insufficient information")}</span>
        </a>;
      })}</div>
    </section>


    {quiz.profiles.map(profile => <section key={profile.id} data-grit-profile={profile.id} aria-labelledby={`grit-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`grit-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.rated >= 6 ? facet.sum / facet.rated : null; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? copy("本次均分：") : "Your mean: "}{mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${mean.toFixed(2)} / 5`}</p>; })()}

      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "optional"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一部分的完整公开说明") : "Read this part’s full public guide"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("全部读数、计分与使用说明") : "All readings, scoring and use notes"}</summary>
      <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="grit-reflection-title">
      <h3 id="grit-reflection-title" className="text-xl font-semibold">{zh ? copy("同一长期目标，六个月的两部分回顾") : "Two reflections on one long-term aim over six months"}</h3>
      <p className="leading-8">{zh ? copy(`两部分中，${valid}个有足够评分。各八条至少六条数值有效，才用该组未舍入计分和除有效条数，显示两位描述性均分。第9—12条为反向题，按6减有效回答处理；NA先排除，不翻成6或补零。其他十二条直接计分，不从一位小数均分倒推。`) : `${valid} of two parts have enough ratings. Each eight-item part needs six numeric ratings for a two-decimal descriptive mean from its unrounded keyed sum divided by rated count. Items nine through twelve reverse a valid response using six minus the rating; NA is excluded first, without becoming six or zero. The other twelve items are direct, with no reconstruction from a one-decimal mean.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated >= 6 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-grit-facet={direction.id} className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt className="font-medium">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#grit-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd><span data-grit-mean>{mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span><span className="block text-sm text-slate-600" data-grit-rated>{zh ? copy(`${facet.rated} / 8条有效频率评分`) : `${facet.rated} / 8 rated frequency items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p data-grit-insufficient className="leading-8">{zh ? copy("本次作答已结束，两部分均未生成个人均分。可以重新测试，下面两份完整说明仍可阅读。") : "This attempt is finished without personal means for either part. You can retake it; both full guides remain readable below."}</p>}
      <p className="text-sm leading-7">{zh ? copy("均分只描述针对同一私选目标、过去六个月的做法频率，不是Duckworth标准Grit Scale或多年稳定毅力。两项不相加、不排序、不生成总体0—100、四等级或最高类型。有序类别的平均不证明等距精度、两项可比或可靠变化，同均分可来自不同组合。不预测能力、成功、职业、健康或招聘录取；合理调整、休息、暂停和停止不能被分数叫作失败。") : "Means describe reported practices around one privately chosen aim over six months, not the standard Duckworth Grit Scale or stable years-long grit. Parts are neither added nor ranked into an overall 0–100 score, four bands or highest type. Averaging ordered categories establishes no interval precision, cross-part comparability or reliable change, and equal means can represent different patterns. Ability, success, career, health, hiring and admissions are not predicted. Appropriate adjustments, rest, pauses and stopping cannot be classified as failure from a score."}</p>
    </section>
      <p className="leading-8">{zh ? copy("两份完整说明全部保留，资料不足不隐藏正文。各自包含定义、频率读法、具体例子、可选尝试、两主题比较、反例与回顾，再完整说明复算、来源和隐私。它们是本版长期目标回顾的两个主题，不是两种或四种毅力人格；可以先读任一份，也可以在这里结束。") : "Both full guides remain available, including with missing information. Each offers its definition, frequency reading, concrete example, optional reflection, comparisons, counterexamples and review, followed by full scoring, source scope and privacy. These are two reflection topics, not two or four grit personalities. You can read either guide or stop here."}</p>
    </details>
  </div>;
}
