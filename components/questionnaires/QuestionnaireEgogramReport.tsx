import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireEgogramReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="egogram-frequencies-title">
      <h3 id="egogram-frequencies-title" className="text-xl font-semibold">{zh ? "五组自报频率（1—5）" : "Five self-reported frequencies (1–5)"}</h3>
      <p className="leading-8">{zh ? "以下图形分别显示近四周有相应机会时的做法频率，不是心理能量百分比、固定总量或主导人格。每组四条全部有效才有分数，全部直接计分、0反向；其他组不替缺失条目估算。五组可以同时较高或较低，最高、最低或相同均不派型。" : "The chart separately shows how often actions occurred in the past four weeks when relevant occasions arose, not energy percentages, a fixed total or a dominant personality. Each group requires all four ratings, all direct with no reversals; other groups never estimate a missing item. All five can be higher or lower together without highest, lowest or equal patterns assigning a type."}</p>
      <dl className="space-y-6">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], total = facet.rated === 4 ? facet.sum : null, mean = total === null ? null : total / 4;
        return <div key={direction.id} data-ego-facet={direction.id} className="space-y-2">
          <dt className="font-semibold">{direction.title[locale]}</dt>
          <dd className="space-y-2">
            <dl className="space-y-1">
              <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始总分（4—20）" : "Raw sum (4–20)"}</dt><dd data-ego-total>{total === null ? missing : total}</dd></div>
              <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（1—5）" : "Descriptive mean (1–5)"}</dt><dd data-ego-mean>{mean === null ? missing : `${mean.toFixed(2)} / 5`}</dd></div>
              <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "本次有效条目" : "Ratings supplied"}</dt><dd data-ego-rated>{zh ? `${facet.rated} / 4条有效频率评分` : `${facet.rated} / 4 rated frequency items`}</dd></div>
            </dl>
            {mean === null ? <p data-ego-insufficient className="text-sm leading-7">{zh ? "本组未生成个人分数，完整说明仍可阅读。" : "No personal score was generated for this group; its full guide remains readable."}</p> : <div aria-hidden="true" data-ego-bar className="h-3 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-violet-600" style={{ width: `${mean / 5 * 100}%` }} /></div>}
          </dd>
        </div>;
      })}</dl>
      <p className="text-sm leading-7">{zh ? "均分用未舍入原始总和除4，不从一位小数倒推；NA不补零、中立或从不。柱长只对应1—5回答类别，类别求和和小数不表示测量精度。父母、成人、儿童是框架名称，不指实际年龄、家庭身份、成熟程度或童年原因，也不认证正确判断、关怀效果、创造力或同意。" : "Means divide unrounded raw sums by four, never reconstructed from a one-decimal value; NA is not zero, neutral or never. Bar length represents 1–5 response categories, whose sums and decimals establish no measurement precision. Parent, Adult and Child are framework names, not ages, family identities, maturity or childhood causes, and certify no correct judgment, effective care, creativity or consent."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-ego-profile={profile.id} aria-labelledby={`ego-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`ego-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组的完整公开说明" : "Read this group’s full public guide"}</Link>
    </section>)}
  </div>;
}
