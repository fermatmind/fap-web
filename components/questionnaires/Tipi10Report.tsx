import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Tipi10Result, TipiDomain } from "@/lib/questionnaires/tipi10";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { correctTipiMidpoint } from "@/lib/questionnaires/result-content/tipi-midpoint";
import { Tipi10Attribution } from "./Tipi10Attribution";

export function Tipi10Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<Tipi10Result, { status: "complete" }>; locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <div data-tipi10-result className="mt-6 space-y-8">
    <section className="border-y border-indigo-200 bg-indigo-50/60 p-4 sm:p-6" aria-labelledby="tipi-pairs-title">
      <h3 id="tipi-pairs-title" className="text-xl font-semibold text-indigo-950">{zh ? displayText("从五项均值回看对应两题") : "From each average back to its two items"}</h3>
      <p className="mt-3 max-w-prose leading-7">{zh ? displayText("十题均有效。每项单独计算，范围 1 至 7。不合总分、不设百分位或类型。4 是选项中点，不是人群平均。选一个维度，查看原始回答与计分值。") : "All ten responses are valid. Each pair is averaged separately on the 1–7 scale, with no combined total, percentile or type. Four is the response midpoint, not a population average. Select a domain to see the original responses and keyed values."}</p>
      <ol className="mt-4 grid divide-y divide-indigo-200 border-t border-indigo-200 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
        {quiz.directions.map(direction => <li key={direction.id} className="min-w-0">
          <a className="flex min-h-12 items-center justify-between gap-3 px-2 py-2 text-indigo-950 lg:flex-col lg:items-start" href={`#tipi-title-${direction.id}`}>
            <span className="font-medium underline decoration-indigo-400 underline-offset-4">{direction.title[locale]}</span>
            <span className="shrink-0 font-semibold tabular-nums">{result.tipi10[direction.id as TipiDomain].mean.toFixed(2)} / 7</span>
          </a>
        </li>)}
      </ol>
    </section>
    {quiz.directions.map(direction => {
      const score = result.tipi10[direction.id as TipiDomain], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`tipi-title-${direction.id}`}>
        <h3 id={`tipi-title-${direction.id}`} className="scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{direction.title[locale]}</h3>
        <p data-tipi10-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{zh ? displayText("两题均值") : "Two-item mean"}: {score.mean.toFixed(2)} / 7</p>
        <ul className="mb-5 space-y-3 leading-7">{score.items.map(item => {
          const q = quiz.questions.find(q => q.id === item.id)!;
          return <li key={item.id} data-tipi10-item={item.id}><span className="font-medium">{q.prompt[locale]}</span><br />{zh ? displayText(`原回答${item.response}；${item.reverse ? `反向：8 − ${item.response} = ${item.keyed}` : `正向计分${item.keyed}`}`) : `Original response ${item.response}; ${item.reverse ? `reversed: 8 − ${item.response} = ${item.keyed}` : `direct keyed value ${item.keyed}`}`}</li>;
        })}</ul>
        <p className="mb-5 leading-7">{zh ? displayText("本对计算") : "Pair calculation"}: ({score.items[0].keyed} + {score.items[1].keyed}) / 2 = {score.mean.toFixed(2)}</p>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={correctTipiMidpoint(profile)} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`tipi-reading-${profile.id}`} mode="result" previewSectionIds={[`${profile.directionIds[0]}-5`, `${profile.directionIds[0]}-7`]} />
        <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读这一维度的完整公开指南") : "Read this domain’s full public guide"}</Link>
      </section>;
    })}
    <Tipi10Attribution locale={locale} copy={displayText} />
  </div>;
}

export function Tipi10NextSteps({ locale }: { locale: Locale }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  return <section data-tipi10-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? displayText("保留具体例子，或另看较长大五测评") : "Keep a concrete example, or explore a longer Big Five assessment"}</h3><p>{zh ? displayText("可以先对照两题原回答与具体场合，到这里结束。若需要更多细节，可了解较长大五题本，并另行完整作答；TIPI不推算、解锁或补填它的三十面向或报告。不同题本原始数值不能直接互比。") : "Compare the original pair responses with a concrete setting, then stop here if you wish. For more detail, explore a longer Big Five form and complete its own full attempt. TIPI does not infer, unlock or fill its thirty facets or report. Raw values from different instruments are not directly interchangeable."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`}>{zh ? displayText("了解较长大五测评与版本") : "Explore the longer Big Five assessment and its versions"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? displayText("返回全部测试") : "Return to all tests"}</Link></section>;
}
