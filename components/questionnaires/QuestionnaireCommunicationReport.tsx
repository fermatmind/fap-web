import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCommunicationReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", valid = Object.values(result.facets).filter(f => f.mean !== null).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="communication-ratings-title">
      <h3 id="communication-ratings-title" className="text-xl font-semibold">{zh ? "四种回应的自报频率，分别阅读" : "Read four reported response patterns separately"}</h3>
      <p className="leading-8">{zh ? `四部分中，${valid}个有足够资料显示均分。每项6题至少4条有效评分，按1—5回答取一位小数均分；NA不补零。` : `${valid} of four parts have enough information for a mean. Each six-item part needs at least four ratings; its 1–5 mean uses one decimal. Unscored responses are never zero.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id];
        return <div key={direction.id} data-communication-facet={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-communication-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 6条有效评分` : `${facet.rated} / 6 rated items`}</span></dd></div>;
      })}</dl>
      {valid === 0 && <p className="leading-8" data-communication-insufficient>{zh ? "本次作答已结束，四部分均未生成个人均分。可以重新测试，下面四份完整公开说明仍可阅读。" : "This attempt is finished without personal means for any part. You can retake it; all four full public guides remain available below."}</p>}
      <p className="text-sm leading-7">{zh ? "均分只概括本组情境中的自报频率，不是能力、情商或工作表现。四种方式可以相近、并列或同时出现，不按最高值派主型，不合成总分、百分比或常模；小数差异不等于统计上明确的区别。" : "Means summarise reported frequencies in these situations, not ability, emotional intelligence or work performance. Patterns can be similar, tied or coexist. No highest-score primary type, total, percentage or norm is assigned. Decimal differences do not establish statistically meaningful distinctions."}</p>
    </section>
    <p className="leading-8">{zh ? "以下四份完整说明都呈现具体回应、工作与日常例子、边界、取舍、相近比较、反例和小尝试。它们不因均分高低而隐藏，也不用于替别人判断动机。" : "All four full guides follow, with concrete responses, work and everyday examples, boundaries, tradeoffs, comparisons, counterexamples and small experiments. None is hidden by its mean or used to infer someone else’s motives."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-communication-profile={profile.id} aria-labelledby={`communication-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`communication-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这种方式的公开说明" : "Read this response pattern’s public guide"}</Link>
    </section>)}
  </div>;
}
