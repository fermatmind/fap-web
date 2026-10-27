import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireHexacoReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "六个领域分别描述本次符合度自报，不相加、跨域排名或按最高值派型。每域40条都有效才显示个人原始和与均分；任一NA保留该域不足，其他完整领域仍可显示。下面六份全文都可阅读，未评分领域的指南是通用说明。" : "Six domains describe this accuracy self-report separately, without a combined total, cross-domain ranking or highest-factor type. Each domain needs all forty valid ratings for a personal raw sum and mean. Any NA keeps that domain insufficient while other fully rated domains remain available. All six full guides follow; an unscored domain’s guide is general information."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "本版保留preliminary IPIP240条英文与键向，中文为本站试译，不是当前官方HEXACO-PI-R60/100题版。正向1至5分，反向6减回答；均分直接用未舍入原始和除40，显示两位小数，不从计分器的一位小数显示值倒推。小数不代表等距测量精度，3也不是人口平均。本版中文等值、呈现与NA规则尚未经独立验证；不能验证诚实、诊断或用于招聘。" : "This edition retains the preliminary IPIP 240-item English bank and keys with our Chinese trial translation; it is not the current official HEXACO-PI-R 60/100 forms. Direct items score one to five and reverse items six minus the rating. Means divide the unrounded raw sum by forty and display two decimals, without reconstruction from the scorer’s one-decimal value. Decimals establish no interval precision and three is not a population average. Translation equivalence, presentation and the NA rule lack independent validation here; results do not verify honesty, diagnose or support hiring decisions."}</p>
    {quiz.directions.map(direction => {
      const facet = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      const scored = facet.rated === direction.itemCount;
      return <section key={direction.id} data-hexaco-domain={direction.id} aria-labelledby={`hexaco-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
        <h3 id={`hexaco-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <dl className="my-5 space-y-3 rounded-lg bg-slate-50 p-4">
          <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始和（40—200）" : "Raw sum (40–200)"}</dt><dd data-hexaco-sum>{scored ? facet.sum : missing}</dd></div>
          <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（1—5）" : "Descriptive mean (1–5)"}</dt><dd data-hexaco-mean>{scored ? `${(facet.sum / facet.total).toFixed(2)} / 5` : missing}</dd></div>
          <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效符合度回答" : "Valid accuracy ratings"}</dt><dd data-hexaco-rated>{zh ? `${facet.rated} / ${facet.total}条有效符合度评分` : `${facet.rated} / ${facet.total} rated accuracy items`}</dd></div>
        </dl>
        {!scored && <p data-hexaco-insufficient className="mb-5 leading-8">{zh ? "本领域资料不足，没有生成个人总分或均分；以下完整指南不能当作本次个人特质的判断。你可以保留未评分，也可以重测。" : "This domain has insufficient information, so no personal sum or mean was generated. The full guide below is not a judgement of your traits in this attempt. You can leave it unscored or retake."}</p>}
        <div data-hexaco-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本领域完整公开说明" : "Read this domain’s full public guide"}</Link>
      </section>;
    })}
  </div>;
}
