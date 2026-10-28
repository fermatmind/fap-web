import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireTechConfidenceNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次自评已结束，下一步由你选择" : "This self-rating is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "可以读完指南就在这里结束。若想尝试，可在示例日历中安排三个虚构事项，再比较预期与实际输出；不要使用真实账户变更或私密信息。这是一个可选小例子，不为本次信心均值提供技能认证，也无需购买软件或继续测试。"
      : "You can finish with the guide alone. If useful, arrange three invented entries in a sample calendar and compare the output with your intended result; avoid real account changes or private information. This optional example does not certify a skill from your confidence mean. No software purchase or further test is needed."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}

export function QuestionnaireTechConfidenceReport({ quiz, result, answers, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  answers: QuestionnaireAnswers;
  locale: Locale;
}) {
  const zh = locale === "zh", score = result.facets["tool-confidence"], profile = quiz.profiles[0];
  return <div className="mt-6 space-y-8" data-tech-confidence-report="">
    <p className="leading-8 text-slate-700">{zh
      ? "这些数值只概括本次六种任务情境的自报信心，不证明操作是否成功，也不派技能等级。请把数字项数、具体回答和完整读法一起看。"
      : "These values summarise confidence in the six stated task situations. They do not demonstrate successful performance or assign a skill level. Read the numeric-response count, individual answers and full guide together."}</p>
    <dl className="grid gap-4 rounded-lg bg-slate-50 p-4 sm:grid-cols-3" data-tech-confidence-summary="">
      <div><dt className="font-semibold">{zh ? "数字回答原始和" : "Sum of numeric ratings"}</dt><dd data-tech-confidence-sum="" className="mt-2">{score.rated ? score.sum : "—"}</dd></div>
      <div><dt className="font-semibold">{zh ? "数字项数／全部题目" : "Numeric responses / all prompts"}</dt><dd data-tech-confidence-count="" className="mt-2">{score.rated} / {score.total}</dd></div>
      <div><dt className="font-semibold">{zh ? "信心自评均值" : "Mean confidence rating"}</dt><dd data-tech-confidence-mean="" className="mt-2">{score.mean === null ? (zh ? "不计算" : "Not calculated") : `${score.mean.toFixed(1)} / 5`}</dd></div>
    </dl>
    {score.mean === null
      ? <p className="leading-8" data-tech-confidence-insufficient="">{zh
        ? `资料不足：六题已回应，但只有${score.rated}项数字；本版至少需要四项。不计分回答不当作零分。以下全文是通用读法，不能当作本次个人均值的解释。`
        : `Insufficient information: all six prompts have responses, but only ${score.rated} are numeric; this edition needs at least four. Unscored answers are not zero. The full guide below is general, without a personal mean to interpret.`}</p>
      : <p className="leading-8" data-tech-confidence-arithmetic="">{zh
        ? `算式：${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)}（保留一位小数）。未评分回答不进入和与分母；没有高低分型、百分位或职场基准。`
        : `Arithmetic: ${score.sum} ÷ ${score.rated} = ${score.mean.toFixed(1)} (rounded to one decimal). Unscored responses are excluded from both sum and denominator. There are no proficiency bands, percentiles or workplace benchmarks.`}</p>}
    <details className="rounded-lg border border-slate-200 p-4 leading-8">
      <summary className="cursor-pointer font-semibold">{zh ? "回看本次六项回答" : "Revisit your six responses"}</summary>
      <ol className="mt-4 list-decimal space-y-4 pl-5">{quiz.questions.map(question => <li key={question.id} data-tech-confidence-answer={question.id}>
        <p>{question.prompt[locale]}</p><p className="font-semibold">{question.options.find(option => option.id === answers[question.id])?.label[locale]}</p>
      </li>)}</ol>
    </details>
    <section aria-labelledby="tech-confidence-full-guide" className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id="tech-confidence-full-guide" className="text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读不含个人数值的公开指南" : "Read the public guide without personal values"}</Link>
    </section>
  </div>;
}
