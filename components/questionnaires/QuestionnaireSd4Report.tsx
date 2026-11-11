import Link from "next/link";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireSd4Report({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated === 7).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-xl border border-slate-300 bg-slate-50 p-4 sm:p-6" aria-labelledby="sd4-summary-title">
      <h3 id="sd4-summary-title" className="text-xl font-semibold">{zh ? copy("四项发表版研究维度，分别阅读") : "Four separate published research subscales"}</h3>
      <dl className="grid gap-3 md:grid-cols-2">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 7 ? facet.sum / 7 : null;
        return <div key={direction.id} data-sd4-facet={direction.id} className="min-w-0 rounded-lg border border-slate-200 bg-white px-3 pb-3"><dt className="font-semibold leading-7">{quiz.profiles.some(profile => profile.directionIds.includes(direction.id)) ? <a className="inline-flex min-h-11 items-center py-2 underline decoration-slate-300 underline-offset-4" href={`#sd4-title-${quiz.profiles.find(profile => profile.directionIds.includes(direction.id))!.id}`}>{direction.title[locale]}</a> : direction.title[locale]}</dt><dd>
          <span data-sd4-mean>{mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span>
          {mean !== null && <span data-sd4-sum className="ml-3 text-sm">{zh ? copy(`原始和${facet.sum} / 7条数值`) : `Raw sum ${facet.sum} / 7 rated items`}</span>}
          <span data-sd4-rated className="block text-sm text-slate-600">{zh ? copy(`${facet.rated} / 7条数值有效；${7 - facet.rated}条未评分`) : `${facet.rated} / 7 numeric ratings; ${7 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-sd4-insufficient className="leading-8">{zh ? copy("本次已完成，没有生成个人均值。无需补答，四篇完整说明仍在下方。") : "This attempt is complete without personal means. No further answers are required; all four full guides remain below."}</p>}
    </section>

    {quiz.profiles.map(profile => <section key={profile.id} data-sd4-profile={profile.id} aria-labelledby={`sd4-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`sd4-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      {(() => { const facet = result.facets[profile.directionIds[0]], mean = facet.rated === 7 ? facet.sum / 7 : null; return <p className="mb-5 text-lg font-semibold tabular-nums">{zh ? copy("本次均分：") : "Your mean: "}{mean === null ? (zh ? copy("资料不足") : "Insufficient information") : `${mean.toFixed(2)} / 5`}</p>; })()}

      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["reading-2", "reading-6"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读这一分量表的公开说明") : "Read this subscale’s public explanation"}</Link>
    </section>)}

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("全部读数、计分与使用说明") : "All readings, scoring and use notes"}</summary>
      <p className="leading-8">{zh ? copy(`${available} / 4项七条数值完整。各项原始和除以7，从未舍入的和计算并显示两位小数。全部28条同向、0反向。3是中立；未评分不补0或3，缺一条就不生成该项均值。`) : `${available} / 4 subscales have all seven numeric ratings. Each raw sum is divided by seven and displayed to two decimals from the unrounded sum. All 28 items are direct, with zero reversals. Three is Neutral; unscored ratings become neither zero nor three. Any missing rating withholds that subscale’s mean.`}</p>
      <p className="text-sm leading-7">{zh ? copy("各项不加总、不排名、不派最高类型，不设置常模百分位或高低界线。研究名称不是诊断、善恶、危险性、性兴趣或关系安全的判断。中文为未经验证的本站工作译文，未评分规则是网站扩展。") : "Subscales are not added, ranked or assigned a dominant type. There are no norm percentiles or cutoffs. Research labels are not diagnoses or verdicts about morality, dangerousness, sexual interests or relationship safety. Chinese is our unvalidated working translation; the unscored rule is a website extension."}</p>
      <p className="leading-8">{zh ? copy("四篇八节全文全部保留，包括资料不足的项；它们解释分量表，不是四种人格。") : "All four eight-section guides remain open, including for insufficient subscales. They explain measures rather than four personality types."}</p>
    </details>
  </div>;
}
