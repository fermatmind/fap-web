import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCompassionReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", facet = result.facets.compassion;
  const total = facet.rated === 10 && facet.mean !== null ? facet.sum : null;
  const missing = zh ? "资料不足" : "Insufficient information";
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-xl bg-slate-50 p-4 sm:p-6" aria-labelledby="compassion-total-title">
      <h3 id="compassion-total-title" className="text-xl font-semibold">{zh ? "IPIP关怀倾向十题的本次读数" : "Your ten-item IPIP Compassion reading"}</h3>
      <dl data-compassion-overview="compassion" className="space-y-3">
        <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "原始总分（10—50）" : "Raw total (10–50)"}</dt><dd data-compassion-total>{total === null ? missing : total}</dd></div>
        <div className="flex flex-wrap justify-between gap-3"><dt>{zh ? "描述性均分（1—5）" : "Descriptive mean (1–5)"}</dt><dd data-compassion-mean>{total === null ? missing : `${(total / 10).toFixed(1)} / 5`}</dd></div>
        <div className="text-sm text-slate-600"><dt className="sr-only">{zh ? "有效符合程度回答" : "Valid accuracy responses"}</dt><dd data-compassion-rated>{zh ? `${facet.rated} / 10题有效` : `${facet.rated} / 10 rated items`}</dd></div>
      </dl>
      <p className="leading-8">{zh ? "奇数题直接计分，偶数题按6减原值反向；十题全部有效才给个人原始总分。均分使用原始和除以10，不从其他已舍入数字倒推。不计分不补零或中立。" : "Odd items keep the original rating and even items use six minus the rating. A personal raw total requires all ten numeric responses. The mean divides the unrounded sum by ten; it is not reconstructed from another rounded value. Unscored answers are not replaced by zero or a midpoint."}</p>
      {total === null && <p data-compassion-insufficient className="rounded-lg bg-amber-50 p-4 leading-8">{zh ? "本次作答已结束，未生成个人总分或均分。下面十二节完整通用指南仍可阅读，也可以选择重测。" : "This attempt is finished without a personal total or mean. The complete twelve-section general guide remains available below, and you may retake the questionnaire."}</p>}
      <p className="text-sm leading-7 text-slate-600">{zh ? "本次数字描述关怀倾向相关自述，不代表同理心百分比、人口排名、读心准确度或工作能力。没有四档派型或情绪共鸣／关怀行动分量表。中文为未独立验证的工作译文；有序选项求和与小数不证明等距精度。" : "This value describes Compassion-related self-report, not an empathy percentage, population rank, mind-reading accuracy or work ability. No four-band type or Emotional Resonance/Caring Action subscore is assigned. Chinese is a working translation without independent validation; ordered-category sums and decimals establish no interval precision."}</p>
    </section>
    {quiz.profiles.map(profile => <section key={profile.id} data-compassion-profile={profile.id} aria-labelledby={`compassion-guide-${profile.id}`} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-8">
      <h3 id={`compassion-guide-${profile.id}`} className="mb-5 scroll-mt-24 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`compassion-report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "打开同理心测试的完整公开读法" : "Open the complete public empathy-test reading"}</Link>
    </section>)}
  </div>;
}

export function QuestionnaireCompassionNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh ? "可以回看一条题句与一次具体互动，或用完整指南中的问题整理下一次沟通。无需继续测试，个人数字也不会换算成其他量表分数。你可以在这里结束。" : "Revisit one statement alongside a specific interaction, or use a question from the full guide to prepare a conversation. No further test is required and this value is not converted into another scale’s score. You can finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, "empathy", "compassion-reading")}>{zh ? "回看完整公开指南" : "Revisit the complete public guide"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
