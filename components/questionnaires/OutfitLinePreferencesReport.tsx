import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function OutfitLinePreferencesReport({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated === 3).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4 sm:p-6" aria-labelledby="olp-summary-title">
      <h3 id="olp-summary-title" className="text-xl font-semibold">{zh ? copy("挑一类你想用在衣服上的线条") : "Choose a clothing line you want to try"}</h3>
      <p className="max-w-prose leading-7">{zh ? copy("每项保留自己的认同读数。点开线条名称，读服装的轮廓、结构和搭配例子。") : "Each line keeps its own endorsement rating. Open a name for examples of garment outlines, construction and styling."}</p>
      <p className="leading-8">{zh ? copy(`${available} / 5项三条数值完整。每项原始和除以3，显示一位小数；表示对服装线条描述的认同，不是合身、外貌、身体测量或人群排名。全部同向、0反向。3是中立；未评分不补0或3。`) : `${available} / 5 parts have all three numeric ratings. Each raw sum is divided by three and displayed to one decimal. It describes agreement with garment-line preferences, not actual fit, beauty, body measurements or a population rank. All items are direct, with zero reversals. Three is Neutral; unscored ratings become neither zero nor three.`}</p>
      <dl className="grid gap-x-6 md:grid-cols-2">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 3 ? facet.sum / 3 : null;
        return <div key={direction.id} data-olp-facet={direction.id} className="min-w-0 space-y-2 border-t border-rose-200 py-2"><dt className="font-semibold leading-7">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#olp-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd>
          <span data-olp-mean>{mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>
          {mean !== null && <span data-olp-sum className="ml-3 text-sm">{zh ? copy(`原始和${facet.sum} / 3条数值`) : `Raw sum ${facet.sum} / 3 rated items`}</span>}
          <span data-olp-rated className="block text-sm text-slate-600">{zh ? copy(`${facet.rated} / 3条数值有效；${3 - facet.rated}条未评分`) : `${facet.rated} / 3 numeric ratings; ${3 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-olp-insufficient className="leading-8">{zh ? copy("本次已完成，没有生成个人均值。无需补答，五篇完整说明仍在下方。") : "This attempt is complete without personal means. No further answers are required; all five full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? copy("不清楚、不适用或不愿评价的题保留未评分。五项不加总、不排名、不挑最高家族，不分配身体类型、Image Identity或阴阳轴位置；同一人可以同时喜欢不同线条安排。") : "Leave unclear, unsuitable or private statements unscored. The five parts are not added, ranked or assigned a highest family, body type, Image Identity or yin-yang placement. Different outfit preferences can coexist."}</p>
    </section>
    <p className="leading-8">{zh ? copy("五篇八节全文全部保留，包括资料不足的项；它们解释衣服偏好，不是五种身体身份。") : "All five eight-section guides remain open, including for insufficient parts. They explain clothing preferences rather than five body identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-olp-profile={profile.id} aria-labelledby={`olp-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`olp-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-2", "reading-6"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一线条偏好的公开说明") : "Read this line preference’s public explanation"}</Link>
    </section>)}
  </div>;
}
