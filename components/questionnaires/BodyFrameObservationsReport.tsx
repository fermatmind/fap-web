import { ResultScoreRow } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function BodyFrameObservationsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated >= 3).length;
  return <div className="my-6 min-w-0 space-y-8 [overflow-wrap:anywhere]">
    <section className="space-y-4 rounded-xl border border-stone-200 bg-stone-50/60 p-4 sm:p-6" aria-labelledby="bfo-summary-title">
      <h3 id="bfo-summary-title" className="text-xl font-semibold">{zh ? "从熟悉视角看你的轮廓观察" : "Start with a familiar view of your outline"}</h3>
      <p className="max-w-prose leading-7">{zh ? "选择一个你熟悉的视角对应主题，再读如何把观察用在衣物选择上。" : "Choose a topic that matches a view you know and see how it can inform a clothing choice."}</p>

      <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">{quiz.directions.map(direction => {
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        const facet = result.facets[direction.id], mean = facet.rated >= 3 ? facet.sum / facet.rated : null;
        return <div key={direction.id} data-bfo-facet={direction.id} className="min-w-0 border-b border-slate-200 pb-4"><dt><a className="inline-flex min-h-11 items-center font-semibold text-stone-950 underline underline-offset-4" href={`#bfo-title-${profile.id}`}>{direction.title[locale]}</a></dt><dd>
          <ResultScoreRow label={zh ? "原始均值 · 1–5" : "Raw mean · 1–5"} value={<span data-bfo-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(1)} / 5`}</span>} score={mean} min={1} max={5} description={profile.summary[locale]} />
          {mean !== null && <span data-bfo-sum className="mt-3 block text-sm leading-7 text-slate-600">{zh ? `原始和${facet.sum} / ${facet.rated}条数值` : `Raw sum ${facet.sum} / ${facet.rated} rated items`}</span>}
          <span data-bfo-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 4条数值有效；${4 - facet.rated}条未评分` : `${facet.rated} / 4 numeric ratings; ${4 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-bfo-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，三篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all three full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "三组可以同时符合，不加总、不挑最高类型，不换算成Straight、Wave或Natural，不推断骨骼性质、健康或适合度。没有熟悉视角、无法判断或不愿回答的条目保持未评分。" : "The three groups can coexist without a total or highest type. They do not convert into Straight, Wave or Natural, or infer skeletal properties, health or clothing suitability. Unclear, unfamiliar or declined observations stay unscored."}</p>
      <details><summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold underline">{zh ? "查看计分方法" : "View the scoring method"}</summary>
      <p className="leading-8">{zh ? `${available} / 3项至少三条数值有效。每项原始有效和除以有效条数，显示一位小数；描述与熟悉视觉印象的符合程度。1不符合，3部分符合，5很符合；全部直接计分、0反向。未评分不补0或3。` : `${available} / 3 parts have at least three numeric ratings. Divide each raw rated sum by rated count and display one decimal. This describes agreement with familiar visual impressions. One means Does not describe, three Somewhat and five Very well; all items are direct, with zero reversals. Unscored ratings become neither zero nor three.`}</p>
      </details>
    </section>
    <p className="leading-8">{zh ? "三篇八节全文全部保留，包括资料不足的组。结合熟悉视角阅读，不把印象当固定身体身份。" : "All three eight-section guides remain open, including for insufficient groups. Read them alongside familiar views rather than as fixed body identities."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-bfo-profile={profile.id} aria-labelledby={`bfo-title-${profile.id}`} className="border-t border-slate-200 pt-7">
      <h3 id={`bfo-title-${profile.id}`} className="mb-5 scroll-mt-24 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-2", "reading-5"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一观察组的公开说明" : "Read this observation group’s public explanation"}</Link>
    </section>)}
  </div>;
}
