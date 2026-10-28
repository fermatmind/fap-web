import Link from "next/link";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireCulturalDimensionsReport({ quiz, result, answers, locale }: { quiz: Questionnaire; result: Extract<FacetResult, { status: "complete" }>; answers: QuestionnaireAnswers; locale: Locale }) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-cultural-dimensions-report>
    <p className="leading-8">{zh ? "以下仅汇总本原创题本的六组作答，不是个人文化、国家指数或群体调查。各组分别读，不合总分、不跨组排名，也不选主导类型；相同均值仍保留各自情境。每组至少四条数字回答才显示均值。" : "These are six summaries of responses to this original bank, not an individual culture, national index or group survey. Read them separately, without a total, cross-topic ranking or dominant type. Equal means retain their separate contexts. A mean is displayed only with at least four numeric responses in that group."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6" data-cultural-full={direction.id}>
        <h3 className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
        <dl className="mb-5 grid gap-5 rounded-lg bg-slate-50 p-4 sm:grid-cols-3">
          <div><dt>{zh ? "数字贡献之和" : "Sum of numeric contributions"}</dt><dd className="mt-1 font-semibold" data-cultural-sum={direction.id}>{score.rated ? score.sum : "—"}</dd></div>
          <div><dt>{zh ? "数字条数／全部条目" : "Numeric responses / all statements"}</dt><dd className="mt-1 font-semibold" data-cultural-coverage={direction.id}>{score.rated} / 6</dd></div>
          <div><dt>{zh ? "本组描述性均值" : "Descriptive response-code mean"}</dt><dd className="mt-1 font-semibold" data-cultural-mean={direction.id}>{score.mean === null ? (zh ? "不计算" : "Not calculated") : `${score.mean.toFixed(1)} / 5`}</dd></div>
        </dl>
        {score.mean === null ? <p className="mb-5 leading-8">{zh ? `本组六条均已回应，其中${score.rated}条为数字；至少四条才显示均值。未评分不作零分，以下完整指南仍可阅读。` : `All six statements have responses, of which ${score.rated} are numeric; at least four are needed to show a mean. Unscored is not zero. The complete guide below remains available.`}</p> : null}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`culture-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本主题的公开完整指南" : "Read this topic’s complete public guide"}</Link>
      </section>;
    })}
    <details className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <summary className="cursor-pointer font-semibold">{zh ? "回看36条回答与反向换算" : "Revisit all 36 responses and reverse keys"}</summary>
      <ol className="mt-5 space-y-5">{quiz.questions.map((question, i) => {
        const option = question.options.find(o => o.id === answers[question.id])!, keyed = typeof option.score === "number" ? question.reverse ? 6 - option.score : option.score : null;
        return <li key={question.id} data-cultural-answer={question.id} className="leading-8">
          <p className="font-semibold">{i + 1}. {question.prompt[locale]}</p><p>{option.label[locale]}</p>
          <p className="text-sm text-slate-600">{keyed === null ? (zh ? "本条不评分，不当作零分。" : "Unscored; not treated as zero.") : question.reverse ? (zh ? `反向贡献：6 − ${option.score} = ${keyed}` : `Reverse contribution: 6 − ${option.score} = ${keyed}`) : (zh ? `直接贡献：${keyed}` : `Direct contribution: ${keyed}`)}</p>
        </li>;
      })}</ol>
    </details>
  </div>;
}
export function QuestionnaireCulturalDimensionsNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "选一条题文核对情境，或在这里结束" : "Check one statement against its context, or finish here"}</h3>
    <p className="my-4 leading-8">{zh ? "可以私下记下这条题文涉及什么安排、自己更希望什么，以及仍不知道的条件。无需按均值改变行为、联系小组、披露答案或判断他人的文化；也可以直接结束。" : "You can privately note the arrangement in one statement, what you would prefer, and what remains unknown. No mean requires a behavior change, contact with a group, disclosure, or a judgment about another person’s culture. You can finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/cultural-dimensions#questionnaire-results`}>{zh ? "比较六份完整主题指南" : "Compare all six complete topic guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
