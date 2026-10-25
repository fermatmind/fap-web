import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { AffectionFacet, AffectionResult } from "@/lib/questionnaires/affection";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireAffectionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<AffectionResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  const rated = Object.values(result.affectionFacets).filter(f => f.mean !== null).length;
  const reading = (facet: AffectionFacet) => <>
    <span className="block font-medium" data-affection-mean>{facet.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${facet.mean.toFixed(1)} / 5`}</span>
    <span className="block text-sm text-slate-600">{zh ? `${facet.rated} / 5条有效评分` : `${facet.rated} / 5 rated items`}</span>
  </>;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="affection-ratings-title">
      <h3 id="affection-ratings-title" className="text-xl font-semibold">{zh ? "五种方式，表达与接收分别看" : "Five ways, giving and receiving separately"}</h3>
      <p className="leading-8" data-affection-summary>{zh ? `十个部分中，${rated}个有足够资料显示均分。每侧至少3条有效评分才显示1—5均分；暂不作答不补零。` : `${rated} of ten parts have enough information for a mean. Each side needs at least three ratings to display a 1–5 mean; unscored responses are never zero.`}</p>
      {rated === 0 && <p className="leading-8" data-affection-insufficient>{zh ? "本次作答已结束，未生成个人均分。可以重新测试，下面五份完整公开说明仍可阅读。" : "This attempt is finished without personal means. You can retake it; all five full public guides remain available below."}</p>}
      <div className="overflow-x-auto"><table className="w-full border-collapse text-left">
        <caption className="pb-3 text-left text-sm">{zh ? "本次情境意义感自评；均分保留一位小数，不是行为次数或人群排名。" : "Meaningfulness ratings for this attempt; means use one decimal, not behaviour counts or population ranks."}</caption>
        <thead><tr><th scope="col" className="p-2">{zh ? "关心方式" : "Way of caring"}</th><th scope="col" className="p-2">{zh ? "表达侧" : "Giving"}</th><th scope="col" className="p-2">{zh ? "接收侧" : "Receiving"}</th></tr></thead>
        <tbody>{quiz.profiles.map(profile => <tr key={profile.id} className="border-t border-slate-200"><th scope="row" className="p-2 font-medium">{profile.title[locale]}</th>{profile.directionIds.map(id => <td key={id} data-affection-facet={id} className="p-2 align-top">{reading(result.affectionFacets[id])}</td>)}</tr>)}</tbody>
      </table></div>
      <p className="text-sm leading-7">{zh ? "可以同时重视五种方式，不强派主副型、不合成总分或配对分。两侧题目描述不同角色下的意义感，不相减为付出差距；均分不观察实际行为，也不代替对方此刻的意愿。" : "All five ways can matter. No primary or secondary type, overall total or compatibility score is assigned. The two sides describe meaningfulness in different roles, not an effort gap to subtract. Means observe no actual behaviour and never replace someone’s willingness in the moment."}</p>
    </section>
    <p className="leading-8">{zh ? "以下五份完整说明分别包含表达、接收、例子、取舍、比较、反例、小尝试与使用范围。每份都可阅读，不因均分高低而隐藏。" : "All five complete guides follow, covering giving, receiving, examples, tradeoffs, comparisons, counterexamples, experiments and scope. Every guide is available regardless of its means."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-affection-profile={profile.id} aria-labelledby={`affection-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`affection-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这种方式的公开说明" : "Read this way of caring’s public guide"}</Link>
    </section>)}
  </div>;
}
