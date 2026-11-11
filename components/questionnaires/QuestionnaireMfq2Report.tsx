import { ResultPage } from "./QuestionnaireResultPresentation";
import Link from "next/link";
import { QuestionnaireMfq2Attribution } from "./QuestionnaireMfq2Attribution";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";

export function QuestionnaireMfq2Report({ quiz, result, locale, displayLocale = locale, copy = text => text }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh", missing = zh ? copy("资料不足") : "Insufficient information";
  return <ResultPage variant="dimensions" className="my-6 space-y-8">
    <section className="rounded-xl border border-violet-200 bg-violet-50/55 p-4 sm:p-6" aria-labelledby="mfq2-reading-start">
      <h3 id="mfq2-reading-start" className="text-xl font-semibold text-violet-950">{zh ? copy("你在道德情境里看重什么") : "What matters to you in a moral situation?"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? copy("六项分别保留自己的回答。选一个基础，读它怎样在具体情境里与其他关注点同时出现。") : "Read each of the six foundations separately. Open one to see how it can appear alongside other concerns in a concrete example."}</p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {quiz.directions.map(direction => {
        const score = result.facets[direction.id], scored = score.rated === score.total && score.mean !== null;
        const profile = quiz.profiles.find(item => item.directionIds[0] === direction.id)!;
        return <section key={direction.id} data-mfq2-domain={direction.id} aria-labelledby={`mfq2-title-${direction.id}`} className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 id={`mfq2-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold">{direction.title[locale]}</h3>
          <dl className="my-4 space-y-3 rounded-lg bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("原始和（6—30）") : "Raw sum (6–30)"}</dt><dd data-mfq2-sum>{scored ? score.sum : missing}</dd></div>
            <div className="grid grid-cols-1 gap-2 border-b border-slate-200 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(7rem,auto)] sm:gap-4 [&>dd]:font-semibold [&>dd]:tabular-nums"><dt>{zh ? copy("贴切程度均分（1—5）") : "Describes-me mean (1–5)"}</dt><dd data-mfq2-mean>{scored ? `${(score.sum / score.total).toFixed(2)} / 5` : missing}</dd></div>
            <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? copy("有效贴切程度回答") : "Valid describes-me ratings"}</dt><dd data-mfq2-rated>{zh ? copy(`${score.rated} / ${score.total}条有效回答`) : `${score.rated} / ${score.total} rated items`}</dd></div>
          </dl>
          {!scored && <p data-mfq2-insufficient className="leading-7">{zh ? copy("本基础资料不足，未生成个人总和或均分。其他完整基础仍可单独读，下方指南是通用说明。") : "This foundation has insufficient information, so no personal sum or mean was generated. Other complete foundations can still be read separately; the guides below are general information."}</p>}
          <a className="inline-flex min-h-11 items-center font-semibold text-violet-950 underline decoration-violet-400 underline-offset-4" href={`#mfq2-guide-title-${profile.id}`}>{zh ? copy("读这个基础的具体例子") : "Read an example of this foundation"}</a>
        </section>;
      })}
      </div>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} aria-labelledby={`mfq2-guide-title-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`mfq2-guide-title-${profile.id}`} className="scroll-mt-24 mb-5 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <div data-mfq2-guide={profile.id}><QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={displayLocale === "zh-TW"} headingLevel={4} idPrefix={`report-${profile.id}`} mode="result" previewSectionIds={["higher-reading", "lower-reading", "counterexample", "practical-comparison"]} /></div>
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)}>{zh ? copy("阅读本基础完整公开说明") : "Read this foundation’s full public guide"}</Link>
    </section>)}
    <QuestionnaireMfq2Attribution locale={locale} traditional={displayLocale === "zh-TW"} copy={copy} />

    <details className="border-t border-slate-200 pt-4" data-result-reading-method>
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("查看计分与使用说明") : "View scoring and use notes"}</summary>
      <p className="leading-8">{zh ? copy("六个MFQ-2基础分别呈现源题回答，不合成道德总分、不以最高项派类型，也不映射政党或人物。每组六条全部有效才显示所属原始和与均分；任一NA只使本组不足。六份完整指南始终可读。") : "Six MFQ-2 foundations separately summarize responses to the source items. There is no combined moral total, highest-score type, party or person match. Each group needs all six valid ratings for its own sum and mean; any NA withholds only that group. All six full guides remain available."}</p>
      <p className="text-sm leading-7 text-slate-600">{zh ? copy("完整36条均使用1—5贴切程度正向键，没有反向题。六项原始和为6—30，未舍入总和除6，均分显示两位小数；小数方便复算，不提供个人测量误差或人口排名。3是回答量尺中间编码，不是人口平均。平等与比例公平分别呈现；本版没有自由维度，也不计算个体化／联结化高阶总分。工作中译与NA呈现规则没有自动继承源研究效度。") : "All thirty-six items use direct one-to-five describes-me keys, with no reversed items. Each six-item raw sum ranges from six to thirty; the unrounded sum divided by six is displayed to two decimals. Decimals support recalculation, not an individual error estimate or population ranking. Three is the middle response code, not a population average. Equality and Proportionality remain separate. This edition has no Liberty foundation or individualizing/binding higher-order totals. The working translation and NA presentation rule do not automatically inherit source validation."}</p>
    </details>
  </ResultPage>;
}
