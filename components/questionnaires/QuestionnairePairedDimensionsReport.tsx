import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { PairedDimensionsResult } from "@/lib/questionnaires/pairedDimensions";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnairePairedDimensionsReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<PairedDimensionsResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "两个维度分别阅读，不跨维排名，也不合成固定恋爱类型。每维12次选择，两侧总和12；次数不是强度、百分位或能力，较少次数不表示缺失。" : "Read the two dimensions separately, without ranking across them or forming a fixed romantic type. Each has 12 choices and the two sides sum to 12. Counts are not intensity, percentiles or ability; a smaller count is not a missing capacity."}</p>
    <section className="rounded-lg bg-slate-50 p-4" aria-labelledby="paired-overview-title">
      <h3 id="paired-overview-title" className="text-xl font-semibold">{zh ? "先看两组原始次数" : "Your two separate comparisons"}</h3>
      <div className="mt-4 space-y-5">{result.pairedDimensions.map(axis => {
        const dimension = quiz.pairedDimensions!.find(d => d.id === axis.id)!;
        return <div key={axis.id} data-paired-overview={axis.id}><h4 className="font-semibold">{dimension.title[locale]}</h4><dl className="mt-2 grid grid-cols-2 gap-4">{dimension.poleIds.map(id => <div key={id} data-paired-overview-pole={id}><dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt><dd className="mt-1 font-semibold">{axis.counts[id]} / 12</dd></div>)}</dl></div>;
      })}</div>
    </section>
    {result.pairedDimensions.map(axis => {
      const dimension = quiz.pairedDimensions!.find(d => d.id === axis.id)!, profile = quiz.profiles.find(p => p.id === axis.profileId)!;
      return <section key={axis.id} aria-labelledby={`paired-title-${axis.id}`} data-paired-dimension={axis.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`paired-title-${axis.id}`} className="text-xl font-semibold">{dimension.title[locale]}</h3>
        <dl className="my-4 space-y-3" aria-label={zh ? "本维度原始选择次数" : "Raw choice counts for this dimension"}>{dimension.poleIds.map(id => <div key={id} data-paired-pole={id}><dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt><dd className="font-semibold">{axis.counts[id]} / 12</dd></div>)}</dl>
        <p className="mb-5 leading-8">{axis.leaders.length === 2 ? (zh ? "两侧各6次，保留并列；次数不能确定原因或现实中的优先安排。" : "Six choices on each side: the tie remains. Counts cannot establish its cause or a real-life priority.") : (zh ? "下面说明本维度次数较多的一侧；这是本题组内比较，不是固定身份或另一侧的缺陷。" : "The explanation below concerns the side selected more often on this dimension, a comparison within this bank rather than a fixed identity or deficit in the other side.")}</p>
        <h3 className="mb-4 text-2xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`paired-report-${axis.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本维度的公开说明" : "Read this dimension’s public explanation"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh ? "本题本尚未完成心理测量学验证，不衡量爱意、成熟、依恋或伴侣适配，也不预测关系去留。可以只做私人回看，不要求与任何人联系或披露结果。" : "This bank has not completed psychometric validation. It does not measure love, maturity, attachment or partner fit, or predict a relationship’s continuation. A private reflection is enough; no contact or disclosure is required."}</p>
  </div>;
}
