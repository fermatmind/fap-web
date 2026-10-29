import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSd4Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", available = Object.values(result.facets).filter(f => f.rated === 7).length;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="sd4-summary-title">
      <h3 id="sd4-summary-title" className="text-xl font-semibold">{zh ? "四项发表版研究维度，分别阅读" : "Four separate published research subscales"}</h3>
      <p className="leading-8">{zh ? `${available} / 4项七条数值完整。各项原始和除以7，从未舍入的和计算并显示两位小数。全部28条同向、0反向。3是中立；未评分不补0或3，缺一条就不生成该项均值。` : `${available} / 4 subscales have all seven numeric ratings. Each raw sum is divided by seven and displayed to two decimals from the unrounded sum. All 28 items are direct, with zero reversals. Three is Neutral; unscored ratings become neither zero nor three. Any missing rating withholds that subscale’s mean.`}</p>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const facet = result.facets[direction.id], mean = facet.rated === 7 ? facet.sum / 7 : null;
        return <div key={direction.id} data-sd4-facet={direction.id} className="space-y-2"><dt className="font-semibold leading-7">{direction.title[locale]}</dt><dd>
          <span data-sd4-mean>{mean === null ? (zh ? "资料不足" : "Insufficient information") : `${mean.toFixed(2)} / 5`}</span>
          {mean !== null && <span data-sd4-sum className="ml-3 text-sm">{zh ? `原始和${facet.sum} / 7条数值` : `Raw sum ${facet.sum} / 7 rated items`}</span>}
          <span data-sd4-rated className="block text-sm text-slate-600">{zh ? `${facet.rated} / 7条数值有效；${7 - facet.rated}条未评分` : `${facet.rated} / 7 numeric ratings; ${7 - facet.rated} unscored responses`}</span>
        </dd></div>;
      })}</dl>
      {available === 0 && <p data-sd4-insufficient className="leading-8">{zh ? "本次已完成，没有生成个人均值。无需补答，四篇完整说明仍在下方。" : "This attempt is complete without personal means. No further answers are required; all four full guides remain below."}</p>}
      <p className="text-sm leading-7">{zh ? "各项不加总、不排名、不派最高类型，不设置常模百分位或高低界线。研究名称不是诊断、善恶、危险性、性兴趣或关系安全的判断。中文为未经验证的本站工作译文，未评分规则是网站扩展。" : "Subscales are not added, ranked or assigned a dominant type. There are no norm percentiles or cutoffs. Research labels are not diagnoses or verdicts about morality, dangerousness, sexual interests or relationship safety. Chinese is our unvalidated working translation; the unscored rule is a website extension."}</p>
    </section>
    <p className="leading-8">{zh ? "四篇八节全文全部保留，包括资料不足的项；它们解释分量表，不是四种人格。" : "All four eight-section guides remain open, including for insufficient subscales. They explain measures rather than four personality types."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-sd4-profile={profile.id} aria-labelledby={`sd4-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`sd4-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一分量表的公开说明" : "Read this subscale’s public explanation"}</Link>
    </section>)}
  </div>;
}
