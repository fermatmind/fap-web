import { ResultScoreRow } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function ActivityEngagementReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated >= 3).length;
  return <div className="my-6 min-w-0 space-y-8 [overflow-wrap:anywhere]">
    <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-6" aria-labelledby="aep-summary-title">
      <h3 id="aep-summary-title" className="text-xl font-semibold">{zh ? "什么机会让你开始参与" : "What makes it easier to join in?"}</h3>
      <p className="max-w-prose leading-7">{zh ? "选一个你想回看的参与方式，从它自己的读数进入日常活动例子。" : "Choose a way of getting involved. Its reading links directly to an everyday example."}</p>

      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{quiz.directions.map(direction => {
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        const facet = result.facets[direction.id], mean = facet.rated >= 3 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-aep-facet={direction.id} className="min-w-0 border-b border-slate-200 pb-4"><dt><a className="inline-flex min-h-11 items-center font-semibold text-emerald-950 underline underline-offset-4" href={`#aep-title-${profile.id}`}>{direction.title[locale]}</a></dt><dd>
          <ResultScoreRow label={zh ? "原始均值 · 1–5" : "Raw mean · 1–5"} value={<span data-aep-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>} score={mean} min={1} max={5} description={profile.summary[locale]} />
          {mean !== null && <span data-aep-sum className="mt-3 block text-sm leading-7 text-slate-600">{zh ? `原始和${facet.sum} / ${facet.rated}条数值` : `Raw sum ${facet.sum} / ${facet.rated} rated items`}</span>}
          <span data-aep-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条数值有效；${4 - facet.rated}条未评分` : `${facet.rated} / 4 numeric ratings; ${4 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-aep-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，五篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all five full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "五项可以同时出现，不加总、不挑最高角色，不换算成Human Design类型、能量百分比或决策规则。没有合适机会、无法判断或不愿回答的条目保持未评分。" : "The five patterns can coexist without a total or highest role. They do not convert into a Human Design type, energy percentage or decision rule. Items without a suitable opportunity, a clear judgement or a willing answer stay unscored."}</p>
      <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold underline">{zh ? "查看计分方法" : "View the scoring method"}</summary>
      <p className="leading-8">{zh ? `${available} / 5项至少三条数值有效。每项原始有效和除以有效条数，显示一位小数；描述过去四周的自报频率。1是从不，3是有时，5是几乎每次；全部直接计分、0反向。未评分不补0或3。` : `${available} / 5 parts have at least three numeric ratings. Divide each raw rated sum by rated count and display one decimal. This describes self-reported frequency over the past four weeks. One is Never, three Sometimes and five Almost Always; all items are direct, with zero reversals. Unscored ratings become neither zero nor three.`}</p>
      </details>
    </section>
    <p className="leading-8">{zh ? "五篇八节全文全部保留，包括资料不足的项。结合具体机会与情境阅读，不把频率当固定身份。" : "All five eight-section guides remain open, including for insufficient parts. Read them alongside actual opportunities and context rather than as fixed identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-aep-profile={profile.id} aria-labelledby={`aep-title-${profile.id}`} className="border-t border-slate-200 pt-7">
      <h3 id={`aep-title-${profile.id}`} className="mb-5 scroll-mt-24 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-2", "reading-6"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一参与方式的公开说明" : "Read this engagement pattern’s public explanation"}</Link>
    </section>)}
  </div>;
}
