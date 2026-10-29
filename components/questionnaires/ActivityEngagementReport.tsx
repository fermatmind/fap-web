import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function ActivityEngagementReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated >= 3).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="aep-summary-title">
      <h3 id="aep-summary-title" className="text-xl font-semibold">{zh ? "五项活动参与方式分别阅读" : "Five separate activity-engagement readings"}</h3>
      <p className="leading-8">{zh ? `${available} / 5项至少三条数值有效。每项原始有效和除以有效条数，显示一位小数；描述过去四周的自报频率。1是从不，3是有时，5是几乎每次；全部直接计分、0反向。未评分不补0或3。` : `${available} / 5 parts have at least three numeric ratings. Divide each raw rated sum by rated count and display one decimal. This describes self-reported frequency over the past four weeks. One is Never, three Sometimes and five Almost Always; all items are direct, with zero reversals. Unscored ratings become neither zero nor three.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated >= 3 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-aep-facet={direction.id} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          <span data-aep-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>
          {mean !== null && <span data-aep-sum className="ml-3 text-sm">{zh ? `原始和${facet.sum} / ${facet.rated}条数值` : `Raw sum ${facet.sum} / ${facet.rated} rated items`}</span>}
          <span data-aep-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条数值有效；${4 - facet.rated}条未评分` : `${facet.rated} / 4 numeric ratings; ${4 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-aep-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，五篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all five full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "五项可以同时出现，不加总、不挑最高角色，不换算成Human Design类型、能量百分比或决策规则。没有合适机会、无法判断或不愿回答的条目保持未评分。" : "The five patterns can coexist without a total or highest role. They do not convert into a Human Design type, energy percentage or decision rule. Items without a suitable opportunity, a clear judgement or a willing answer stay unscored."}</p>
    </section>
    <p className="leading-8">{zh ? "五篇八节全文全部保留，包括资料不足的项。结合具体机会与情境阅读，不把频率当固定身份。" : "All five eight-section guides remain open, including for insufficient parts. Read them alongside actual opportunities and context rather than as fixed identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-aep-profile={profile.id} aria-labelledby={`aep-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`aep-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一参与方式的公开说明" : "Read this engagement pattern’s public explanation"}</Link>
    </section>)}
  </div>;
}
