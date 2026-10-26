import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { PracticeResult } from "@/lib/questionnaires/practice";
import { QuestionnaireJavaCode } from "./QuestionnaireJavaCode";
import { QuestionnaireJavaScriptCode } from "./QuestionnaireJavaScriptCode";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnairePracticeReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<PracticeResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="space-y-8 leading-8 [overflow-wrap:anywhere]" data-practice-result>
    <p className="text-xl font-semibold" data-practice-correct>{zh ? `本题本答对 ${result.practice.correct} / ${result.practice.total} 题` : `${result.practice.correct} / ${result.practice.total} correct in this question bank`}</p>
    <p>{zh ? "这里只核对本题本的答案，不提供常模、能力等级、招聘线或认证。逐题解析和全部分项复习说明都可阅读，答对多少不决定内容权限。" : "These counts check answers in this bank. They supply no norms, ability level, recruitment cutoff or certification. Every explanation and section guide remains available regardless of the count."}</p>
    <dl className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => <div key={direction.id} className="rounded-xl border border-slate-200 p-4" data-practice-section={direction.id}>
        <dt className="font-semibold">{direction.title[locale]}</dt>
        <dd>{result.practice.sections[direction.id].correct} / {result.practice.sections[direction.id].total} {zh ? "题答对" : "correct"}</dd>
      </div>)}
    </dl>
    <section>
      <h3 className="mb-4 text-xl font-semibold">{zh ? "逐题答案与解析" : "Every answer and explanation"}</h3>
      <ol className="space-y-7">
        {result.practice.items.map((item, index) => {
          const question = quiz.questions[index];
          const selected = question.options.find(option => option.id === item.selectedOptionId)!;
          const correct = question.options.find(option => option.id === item.correctOptionId)!;
          return <li key={item.questionId} className="rounded-xl border border-slate-200 p-5" data-practice-question={item.questionId}>
            <h4 className="font-semibold">{index + 1}. {(quiz.slug === "java-test" || quiz.slug === "javascript-test") ? question.prompt[locale].split("\n\n")[0] : question.prompt[locale]}</h4>
            {quiz.slug === "java-test" && <QuestionnaireJavaCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            {quiz.slug === "javascript-test" && <QuestionnaireJavaScriptCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={index + 1} />}
            <p className="mt-3 font-semibold">{item.correct ? (zh ? "本题答对" : "Correct answer") : (zh ? "本题未答对" : "Not correct on this item")}</p>
            <dl className="my-3 space-y-2">
              <div><dt className="font-medium">{zh ? "你选择的答案" : "Your selected answer"}</dt><dd>{selected.label[locale]}</dd></div>
              <div><dt className="font-medium">{zh ? "本题正确答案" : "Answer key for this item"}</dt><dd>{correct.label[locale]}</dd></div>
            </dl>
            <p data-practice-explanation>{question.explanation![locale]}</p>
          </li>;
        })}
      </ol>
    </section>
    <section className="space-y-8">
      <p className="text-xl font-semibold">{zh ? "全部分项复习说明" : "All section revision guides"}</p>
      {quiz.profiles.map(profile => <section key={profile.id} data-practice-guide={profile.id}>
        <h3 className="mb-4 text-xl font-semibold">{profile.title[locale]}</h3>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`practice-guide-${profile.id}`} />
      </section>)}
    </section>
  </div>;
}
