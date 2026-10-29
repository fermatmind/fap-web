import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function AttractionExperiencesReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated === 3).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="atr-summary-title">
      <h3 id="atr-summary-title" className="text-xl font-semibold">{zh ? "五项体验分别阅读，不分配身份" : "Five separate experience readings, without an identity assignment"}</h3>
      <p className="leading-8">{zh ? `${available} / 5项三条数值完整。每项原始和除以3，显示一位小数；表示对过去十二个月体验陈述的认同，不是次数、频率、概率、能力或光谱位置。全部同向、0反向。3是中立；未评分不补0或3。` : `${available} / 5 parts have all three numeric ratings. Each raw sum is divided by three and displayed to one decimal. It describes agreement with experiences in the past twelve months, not an event count, frequency, probability, ability or spectrum position. All items are direct, with zero reversals. Three is Neutral; unscored ratings become neither zero nor three.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 3 ? facet.sum / 3 : null;
        return <div key={direction.id} data-atr-facet={direction.id} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          <span data-atr-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>
          {mean !== null && <span data-atr-sum className="ml-3 text-sm">{zh ? `原始和${facet.sum} / 3条数值` : `Raw sum ${facet.sum} / 3 rated items`}</span>}
          <span data-atr-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 3条数值有效；${3 - facet.rated}条未评分` : `${facet.rated} / 3 numeric ratings; ${3 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-atr-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，五篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all five full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "没有相关吸引起点或比较经历的题保留未评分；没有浪漫吸引可以是对再次出现陈述有意义的不同意。五项不加总、不排名、不挑最高型，不分配无浪漫位置、性取向或原型。延续与情境变化可以同时存在。" : "Leave statements unscored when no suitable attraction onset or comparison exists. No romantic attraction can be meaningful disagreement with recurrence statements. The five parts are not added, ranked or assigned a highest type, aromantic position, sexual orientation or archetype. Continuity and context variation can coexist."}</p>
    </section>
    <p className="leading-8">{zh ? "五篇八节全文全部保留，包括资料不足的项；它们解释体验描述，不是五种身份。" : "All five eight-section guides remain open, including for insufficient parts. They explain experience descriptions rather than five identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-atr-profile={profile.id} aria-labelledby={`atr-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`atr-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一体验的公开说明" : "Read this experience’s public explanation"}</Link>
    </section>)}
  </div>;
}
