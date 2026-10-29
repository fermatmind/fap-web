import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function OutfitLinePreferencesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated === 3).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="olp-summary-title">
      <h3 id="olp-summary-title" className="text-xl font-semibold">{zh ? "五项服装线条偏好分别阅读" : "Five separate outfit-line preference readings"}</h3>
      <p className="leading-8">{zh ? `${available} / 5项三条数值完整。每项原始和除以3，显示一位小数；表示对服装线条描述的认同，不是合身、外貌、身体测量或人群排名。全部同向、0反向。3是中立；未评分不补0或3。` : `${available} / 5 parts have all three numeric ratings. Each raw sum is divided by three and displayed to one decimal. It describes agreement with garment-line preferences, not actual fit, beauty, body measurements or a population rank. All items are direct, with zero reversals. Three is Neutral; unscored ratings become neither zero nor three.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 3 ? facet.sum / 3 : null;
        return <div key={direction.id} data-olp-facet={direction.id} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          <span data-olp-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>
          {mean !== null && <span data-olp-sum className="ml-3 text-sm">{zh ? `原始和${facet.sum} / 3条数值` : `Raw sum ${facet.sum} / 3 rated items`}</span>}
          <span data-olp-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 3条数值有效；${3 - facet.rated}条未评分` : `${facet.rated} / 3 numeric ratings; ${3 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-olp-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，五篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all five full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "不清楚、不适用或不愿评价的题保留未评分。五项不加总、不排名、不挑最高家族，不分配身体类型、Image Identity或阴阳轴位置；同一人可以同时喜欢不同线条安排。" : "Leave unclear, unsuitable or private statements unscored. The five parts are not added, ranked or assigned a highest family, body type, Image Identity or yin-yang placement. Different outfit preferences can coexist."}</p>
    </section>
    <p className="leading-8">{zh ? "五篇八节全文全部保留，包括资料不足的项；它们解释衣服偏好，不是五种身体身份。" : "All five eight-section guides remain open, including for insufficient parts. They explain clothing preferences rather than five body identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-olp-profile={profile.id} aria-labelledby={`olp-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`olp-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一线条偏好的公开说明" : "Read this line preference’s public explanation"}</Link>
    </section>)}
  </div>;
}
