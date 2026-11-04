import { ResultOverview, ResultPage, ResultReadingNav } from "./QuestionnaireResultPresentation";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { PracticeResult } from "@/lib/questionnaires/practice";
import { QuestionnaireJavaCode } from "./QuestionnaireJavaCode";
import { QuestionnaireJavaScriptCode } from "./QuestionnaireJavaScriptCode";
import { QuestionnairePythonCode } from "./QuestionnairePythonCode";
import { QuestionnaireSqlCode } from "./QuestionnaireSqlCode";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";

export function QuestionnairePracticeReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<PracticeResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  const focusItem = result.practice.items.find(item => !item.correct) ?? result.practice.items[0];
  const focusQuestion = focusItem ? quiz.questions.find(question => question.id === focusItem.questionId) : undefined;
  return <ResultPage variant="practice" className="space-y-8 leading-8 [overflow-wrap:anywhere]" data-practice-result>
    <p className="text-xl font-semibold" data-practice-correct>{zh ? `本题本答对 ${result.practice.correct} / ${result.practice.total} 题` : `${result.practice.correct} / ${result.practice.total} correct in this question bank`}</p>

    {focusItem && focusQuestion && <section className="border-l-2 border-amber-300 pl-4" data-practice-focus={focusItem.questionId}>
      <h3 className="mb-3 text-xl font-semibold">{focusItem.correct ? (zh ? "先用一题核对思路" : "Check your reasoning on one item") : (zh ? "先复盘一题" : "Start by reviewing one item")}</h3>
      <p className="whitespace-pre-wrap font-medium">{focusQuestion.prompt[locale]}</p>
      <p className="mt-3 text-sm leading-7">{zh ? "你的选择：" : "Your choice: "}{focusQuestion.options.find(option => option.id === focusItem.selectedOptionId)!.label[locale]}</p>
      <p className="text-sm leading-7">{zh ? "正确答案：" : "Answer key: "}{focusQuestion.options.find(option => option.id === focusItem.correctOptionId)!.label[locale]}</p>
      <p className="mt-3" data-practice-focus-explanation>{focusQuestion.explanation![locale]}</p>
    </section>}
    <details className="border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? "查看分项记录与计分范围" : "View section counts and scoring scope"}</summary>
    <ResultOverview locale={locale} title={zh ? "分项答题记录" : "Answers by section"}>
    <dl className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => <div key={direction.id} className="rounded-xl border border-slate-200 p-4" data-practice-section={direction.id}>
        <dt className="font-semibold">{direction.title[locale]}</dt>
        <dd>{result.practice.sections[direction.id].correct} / {result.practice.sections[direction.id].total} {zh ? "题答对" : "correct"}</dd>
      </div>)}
    </dl>
    </ResultOverview>
    <p>{zh ? "这里只核对本题本的答案，不提供常模、能力等级、招聘线或认证。逐题解析和全部分项复习说明都可阅读，答对多少不决定内容权限。" : "These counts check answers in this bank. They supply no norms, ability level, recruitment cutoff or certification. Every explanation and section guide remains available regardless of the count."}</p>
    </details>
    <ResultReadingNav collapsible label={zh ? "答案与复习" : "Answers and revision"} sections={[{ id: "practice-answer-review", title: zh ? "逐题答案与解析" : "Every answer and explanation" }, { id: "practice-revision-guides", title: zh ? "全部分项复习说明" : "All section revision guides" }]} />
    <details id="practice-answer-review" className="scroll-mt-24 border-t border-slate-200 pt-3">
      <summary className="min-h-11 cursor-pointer py-2 text-xl font-semibold">{zh ? "逐题答案与解析" : "Every answer and explanation"}</summary>
      <ol className="space-y-7">
        {result.practice.items.map((item, index) => {
          const question = quiz.questions[index];
          const selected = question.options.find(option => option.id === item.selectedOptionId)!;
          const correct = question.options.find(option => option.id === item.correctOptionId)!;
          return <li key={item.questionId} className="rounded-xl border border-slate-200 p-5" data-practice-question={item.questionId}>
            <h4 className="font-semibold">{index + 1}. {(quiz.slug === "java-test" || quiz.slug === "javascript-test" || quiz.slug === "python-test" || quiz.slug === "sql-test") ? question.prompt[locale].split("\n\n")[0] : question.prompt[locale]}</h4>
            {quiz.slug === "java-test" && <QuestionnaireJavaCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            {quiz.slug === "javascript-test" && <QuestionnaireJavaScriptCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            {quiz.slug === "python-test" && <QuestionnairePythonCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            {quiz.slug === "sql-test" && <QuestionnaireSqlCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            <p className="mt-3 font-semibold">{item.correct ? (zh ? "本题答对" : "Correct answer") : (zh ? "本题未答对" : "Not correct on this item")}</p>
            <dl className="my-3 space-y-2">
              <div><dt className="font-medium">{zh ? "你选择的答案" : "Your selected answer"}</dt><dd>{selected.label[locale]}</dd></div>
              <div><dt className="font-medium">{zh ? "本题正确答案" : "Answer key for this item"}</dt><dd>{correct.label[locale]}</dd></div>
            </dl>
            <p data-practice-explanation>{question.explanation![locale]}</p>
          </li>;
        })}
      </ol>
    </details>
    <section id="practice-revision-guides" className="scroll-mt-24 space-y-8">
      <p className="text-xl font-semibold">{zh ? "全部分项复习说明" : "All section revision guides"}</p>
      {quiz.profiles.map(profile => <details key={profile.id} data-practice-guide={profile.id} className="border-t border-slate-200 pt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-xl font-semibold">{profile.title[locale]}</summary>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} headingLevel={4} idPrefix={`practice-guide-${profile.id}`} mode="guide" />
      </details>)}
    </section>
  </ResultPage>;
}
