import { PortraitFacetLead } from "./PortraitFacetLead";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireHumorReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <PortraitFacetLead quiz={quiz} result={result} locale={locale} anchorPrefix="humor-title-" />

    {quiz.profiles.map(profile => <section key={profile.id} data-humor-profile={profile.id} aria-labelledby={`humor-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`humor-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.mean; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? "本次均分：" : "Your mean: "}{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</p>; })()}

      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["meaning", "example", "experiment"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target="_blank" rel="noopener">{zh ? "阅读这种表达的公开说明（新标签页）" : "Read this expression’s public guide (new tab)"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "全部读数、计分与使用说明" : "All readings, scoring and use notes"}</summary>
      <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="humor-ratings-title">
      <h3 id="humor-ratings-title" className="text-xl font-semibold">{zh ? "六种表达分别阅读，不派主风格" : "Read six expressions separately, without a primary type"}</h3>
      <p className="leading-8">{zh ? `六部分中，${valid}个有足够资料显示均分。每项4题至少3条有效评分，按1—5回答取一位小数均分；NA不补零。` : `${valid} of six parts have enough information for a mean. Each four-item part needs at least three ratings; its 1–5 mean uses one decimal. Unscored responses are never zero.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-humor-facet={direction.id} className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt className="font-medium">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#humor-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd><span data-humor-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条有效评分` : `${facet.rated} / 4 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-humor-insufficient>{zh ? "本次作答已结束，六部分均未生成个人均分。可以重新测试，下方六份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all six full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括最近四周的自报表达频率，不是幽默质量、智力、受欢迎程度或别人笑了多少。六种方式可以同时出现，最高值不决定身份；不合成总分、比例或常模，小数差异不等于统计显著。自嘲与机锋不自动等于HSQ自我挫败或攻击型分数。" : "Means summarise reported expression frequency in the past four weeks, not humor quality, intelligence, popularity or audience laughter. Expressions can coexist without a highest-score identity, total, proportion or norm. Decimal differences establish no statistical significance. Self-deprecation and banter are not automatically HSQ self-defeating or aggressive scores."}</p>
    </section>
      <p className="leading-8">{zh ? "以下六份完整说明都有原创例子、条件、取舍、日常应用、相近比较、反例和小尝试。均分或资料不足均不隐藏正文；听众是否愿意接玩笑要看其实际回应，任何标签都不能取消停止或拒绝的选择。" : "All six full guides include original examples, conditions, tradeoffs, everyday use, comparisons, counterexamples and small experiments. Means or insufficient information never hide the text. Whether humor is welcome depends on the audience’s actual response; no label overrides a choice to stop or decline."}</p>
    </details>
  </div>;
}
