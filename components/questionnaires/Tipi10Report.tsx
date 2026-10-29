import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Tipi10Result, TipiDomain } from "@/lib/questionnaires/tipi10";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { Tipi10Attribution } from "./Tipi10Attribution";

export function Tipi10Report({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<Tipi10Result, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-tipi10-result className="mt-6 space-y-8">
    <p className="leading-8">{zh ? "十题均有效。以下为五项独立原始两题均值，范围1至7。不合总分、不设百分位或类型；4是选项中点，不是人群平均。每对都保留原回答与计分值，五篇完整读法均可阅读。" : "All ten responses are valid. These are five separate raw two-item means, ranging from 1 to 7, without a combined total, percentile or type. Four is the response midpoint, not a population average. Each pair retains its original and keyed values, and all five complete guides remain available."}</p>
    {quiz.directions.map(direction => {
      const score = result.tipi10[direction.id as TipiDomain], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" aria-labelledby={`tipi-title-${direction.id}`}>
        <h3 id={`tipi-title-${direction.id}`} className="text-2xl font-semibold">{direction.title[locale]}</h3>
        <p data-tipi10-mean={direction.id} className="my-4 rounded-lg bg-slate-50 p-4 text-xl font-semibold">{zh ? "两题均值" : "Two-item mean"}: {score.mean.toFixed(2)} / 7</p>
        <ul className="mb-5 space-y-3 leading-7">{score.items.map(item => {
          const q = quiz.questions.find(q => q.id === item.id)!;
          return <li key={item.id} data-tipi10-item={item.id}><span className="font-medium">{q.prompt[locale]}</span><br />{zh ? `原回答${item.response}；${item.reverse ? `反向：8 − ${item.response} = ${item.keyed}` : `正向计分${item.keyed}`}` : `Original response ${item.response}; ${item.reverse ? `reversed: 8 − ${item.response} = ${item.keyed}` : `direct keyed value ${item.keyed}`}`}</li>;
        })}</ul>
        <p className="mb-5 leading-7">{zh ? "本对计算" : "Pair calculation"}: ({score.items[0].keyed} + {score.items[1].keyed}) / 2 = {score.mean.toFixed(2)}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`tipi-reading-${profile.id}`} />
        <Link prefetch={false} className="mt-4 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这一维度的完整公开指南" : "Read this domain’s full public guide"}</Link>
      </section>;
    })}
    <Tipi10Attribution locale={locale} />
  </div>;
}

export function Tipi10NextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-tipi10-next-steps className="my-8 space-y-4 leading-8"><h3 className="text-xl font-semibold">{zh ? "保留具体例子，或另看较长大五测评" : "Keep a concrete example, or explore a longer Big Five assessment"}</h3><p>{zh ? "可以先对照两题原回答与具体场合，到这里结束。若需要更多细节，可了解较长大五题本，并另行完整作答；TIPI不推算、解锁或补填它的三十面向或报告。不同题本原始数值不能直接互比。" : "Compare the original pair responses with a concrete setting, then stop here if you wish. For more detail, explore a longer Big Five form and complete its own full attempt. TIPI does not infer, unlock or fill its thirty facets or report. Raw values from different instruments are not directly interchangeable."}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}`}>{zh ? "了解较长大五测评与版本" : "Explore the longer Big Five assessment and its versions"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Return to all tests"}</Link></section>;
}
