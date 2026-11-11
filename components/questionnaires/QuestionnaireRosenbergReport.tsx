import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { RosenbergResult } from "@/lib/questionnaires/rosenberg";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnaireRosenbergReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<RosenbergResult, { status: "complete" }>; locale: Locale;
}) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh", score = result.rosenberg, profile = quiz.profiles[0];
  return <div data-rosenberg-result className="mt-6 space-y-8">
    <section className="rounded-2xl border border-stone-300 bg-stone-50 p-4 sm:p-6" aria-labelledby="rses-total-heading">
      <h3 id="rses-total-heading" className="text-xl font-semibold leading-snug text-stone-950 sm:text-2xl">{zh ? displayText("本次 RSES 原始总分") : "Your RSES raw total"}</h3>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
      <p data-rosenberg-score className="rounded-lg bg-white p-4 text-xl font-semibold tabular-nums text-stone-950 sm:p-5">{score.total === null
        ? (zh ? displayText(`资料不足：${score.rated}/10 题有量表回答；${score.skipped}题跳过，不计算总分。`) : `Insufficient information: ${score.rated}/10 scale responses; ${score.skipped} skipped. No total is calculated.`)
        : (zh ? displayText(`${score.total} / 30（10/10题有效）`) : `${score.total} / 30 (10/10 scale responses)`)}</p>
      <p className="leading-8 text-stone-700">{score.total === null
        ? (zh ? displayText("跳过不是零分，也不会用其余题目的平均值填补。下面的完整读法仍可阅读，但不代表本次个人成绩。") : "A skipped item is not a zero and is not filled from the other answers. The complete guide remains available, without assigning a personal score to this attempt.")
        : (zh ? displayText("这是十条自报陈述按明示反向键求和的结果，较高总分表示在这些条目上报告了较多正向自我评价。它不是你的个人价值、百分位、诊断、能力或招聘资格。") : "This sums ten self-reported statements with the stated reverse keys. A higher total reflects more positive reported self-regard on these items. It is not your worth, percentile, diagnosis, ability or hiring qualification.")}</p>
      </div>
      <p className="mt-3 text-sm leading-7 text-stone-700">{zh ? displayText("不套用统一的“正常区间”或高低分档。中文为费马工作译文，尚未验证其心理测量表现或跨语言等值性。") : "No universal normal range or high/low bands are applied. The Chinese wording is a FermatMind working translation without established psychometric performance or cross-language equivalence."}</p>
      <a className="mt-3 inline-flex min-h-11 items-center font-semibold text-stone-950 underline decoration-stone-500 underline-offset-4" href="#rses-reading-heading">{zh ? displayText("继续读什么会影响这些回答") : "Read what can shape these answers"}</a>
    </section>
    <section aria-labelledby="rses-reading-heading">
      <h3 id="rses-reading-heading" className="mb-4 scroll-mt-24 text-xl font-semibold leading-snug sm:text-2xl">{profile.title[locale]}</h3>
      <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix="rses-score-reading" mode="result" previewSectionIds={["global", "context", "reflection"]} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("阅读公开的完整分数说明") : "Read the complete public score guide"}</Link>
    </section>
  </div>;
}
