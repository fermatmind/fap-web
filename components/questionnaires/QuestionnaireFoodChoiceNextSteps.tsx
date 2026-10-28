import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";

export function QuestionnaireFoodChoiceNextSteps({ quiz, answers, locale }: {
  quiz: Questionnaire;
  answers: QuestionnaireAnswers;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <section className="mt-10 border-t pt-7" data-food-choice-next-steps>
    <h3 className="text-xl font-semibold">{zh ? "比较一处呈现细节，或在这里结束" : "Compare one presentation detail, or finish here"}</h3>
    <p className="my-4 leading-8">{zh ? "可以私下回看哪种餐具、摆放或措辞吸引自己，以及设想了什么场景。次数不能识别阶层，也不要求购买、试吃或改变饮食；无需再做测评，可以直接结束。" : "You can privately revisit the vessel, arrangement or wording that appealed, and the occasion you pictured. Counts cannot identify class and require no purchase, tasting or dietary change. You can finish without taking another assessment."}</p>
    <details className="my-5 rounded-lg border border-slate-200 p-4 sm:p-6">
      <summary className="cursor-pointer font-semibold">{zh ? "回看12次选择与各次计数去向" : "Review all 12 choices and their count contributions"}</summary>
      <ol className="mt-5 space-y-5">{quiz.questions.map((question, i) => {
        const option = question.options.find(o => o.id === answers[question.id]);
        if (!option) return null;
        const direction = quiz.directions.find(d => d.id === option.directionId)!;
        return <li key={question.id} data-food-choice-answer={question.id} className="leading-8">
          <p className="font-semibold">{i + 1}. {question.prompt[locale]}</p>
          <p>{option.label[locale]}</p>
          <p className="text-sm text-slate-600">{zh ? `计一次至：${direction.title[locale]}` : `One count for: ${direction.title[locale]}`}</p>
        </li>;
      })}</ol>
    </details>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/food-choice#questionnaire-results`}>{zh ? "比较全部七份完整指南" : "Compare all seven complete guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
