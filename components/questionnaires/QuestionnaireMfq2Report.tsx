import Link from "next/link";
import { QuestionnaireMfq2Attribution } from "./QuestionnaireMfq2Attribution";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireMfq2Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <p className="leading-8">{zh ? "六个MFQ-2基础分别呈现源题回答，不合成道德总分、不以最高项派类型，也不映射政党或人物。每组六条全部有效才显示所属原始和与均分；任一NA只使本组不足。六份完整指南始终可读。" : "Six MFQ-2 foundations separately summarize responses to the source items. There is no combined moral total, highest-score type, party or person match. Each group needs all six valid ratings for its own sum and mean; any NA withholds only that group. All six full guides remain available."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh ? "完整36条均使用1—5贴切程度正向键，没有反向题。六项原始和为6—30，未舍入总和除6，均分显示两位小数；小数方便复算，不提供个人测量误差或人口排名。3是回答量尺中间编码，不是人口平均。平等与比例公平分别呈现；本版没有自由维度，也不计算个体化／联结化高阶总分。工作中译与NA呈现规则没有自动继承源研究效度。" : "All thirty-six items use direct one-to-five describes-me keys, with no reversed items. Each six-item raw sum ranges from six to thirty; the unrounded sum divided by six is displayed to two decimals. Decimals support recalculation, not an individual error estimate or population ranking. Three is the middle response code, not a population average. Equality and Proportionality remain separate. This edition has no Liberty foundation or individualizing/binding higher-order totals. The working translation and NA presentation rule do not automatically inherit source validation."}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], scored = score.rated === score.total && score.mean !== null;
        return <section key={direction.id} data-mfq2-domain={direction.id} aria-labelledby={`mfq2-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`mfq2-title-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
          <dl className="my-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始和（6—30）" : "Raw sum (6–30)"}</dt><dd data-mfq2-sum>{scored ? score.sum : missing}</dd></div>
            <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "贴切程度均分（1—5）" : "Describes-me mean (1–5)"}</dt><dd data-mfq2-mean>{scored ? `${(score.sum / score.total).toFixed(2)} / 5` : missing}</dd></div>
            <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效贴切程度回答" : "Valid describes-me ratings"}</dt><dd data-mfq2-rated>{zh ? `${score.rated} / ${score.total}条有效回答` : `${score.rated} / ${score.total} rated items`}</dd></div>
          </dl>
          {!scored && <p data-mfq2-insufficient className="leading-7">{zh ? "本基础资料不足，未生成个人总和或均分。其他完整基础仍可单独读，下方指南是通用说明。" : "This foundation has insufficient information, so no personal sum or mean was generated. Other complete foundations can still be read separately; the guides below are general information."}</p>}
        </section>;
      })}
    </div>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`mfq2-guide-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`mfq2-guide-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <div data-mfq2-guide={profile.id}><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} /></div>
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本基础完整公开说明" : "Read this foundation’s full public guide"}</Link>
    </section>)}
    <QuestionnaireMfq2Attribution locale={locale} />
  </div>;
}
