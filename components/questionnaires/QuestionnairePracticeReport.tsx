import { ResultOverview, ResultPage, ResultReadingNav } from "./QuestionnaireResultPresentation";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { PracticeResult } from "@/lib/questionnaires/practice";
import { QuestionnaireJavaCode } from "./QuestionnaireJavaCode";
import { QuestionnaireJavaScriptCode } from "./QuestionnaireJavaScriptCode";
import { QuestionnairePythonCode } from "./QuestionnairePythonCode";
import { QuestionnaireSqlCode } from "./QuestionnaireSqlCode";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import styles from "./QuestionnaireResultPresentation.module.css";

const practiceCode: Record<string, typeof QuestionnaireSqlCode | undefined> = {
  "java-test": QuestionnaireJavaCode,
  "javascript-test": QuestionnaireJavaScriptCode,
  "python-test": QuestionnairePythonCode,
  "sql-test": QuestionnaireSqlCode,
};

function PracticePrompt({ prompt, number, locale, slug, full }: {
  prompt: string; number: number; locale: Locale; slug: string; full?: boolean;
}) {
  const Code = practiceCode[slug];
  const [lead, ...code] = Code ? prompt.split("\n\n") : [prompt];
  return <>
    {full ? <h4 className="font-semibold">{number}. {lead}</h4> : <p className="whitespace-pre-wrap font-medium">{lead}</p>}
    {Code && <Code code={code.join("\n\n")} locale={locale} number={number} />}
  </>;
}

export function QuestionnairePracticeReport({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<PracticeResult, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  const { traditional, displayText } = useQuestionnaireDisplayCopy();
  const communication = quiz.slug === "communication-adaptability";
  const focusItem = result.practice.items.find(item => !item.correct) ?? result.practice.items[0];
  const focusQuestion = focusItem ? quiz.questions.find(question => question.id === focusItem.questionId) : undefined;
  return <ResultPage variant="practice" className="space-y-8 leading-8 [overflow-wrap:anywhere]" data-practice-result>
    <div className={styles.practiceLead} data-practice-lead data-scenario-practice={communication || undefined}>
      <div className={styles.practiceTotal}>
        <p data-practice-correct>{zh ? displayText(`本题本答对 ${result.practice.correct} / ${result.practice.total} 题`) : `${result.practice.correct} / ${result.practice.total} correct in this question bank`}</p>
        <a href="#practice-answer-review" onClick={() => {
          const review = document.getElementById("practice-answer-review");
          if (review instanceof HTMLDetailsElement) review.open = true;
        }}>{zh ? displayText("核对全部答案") : "Review every answer"} <span aria-hidden="true">↓</span></a>
        {communication && <nav className={styles.practiceScenarioNav} aria-label={zh ? displayText("按沟通情境复习") : "Review by communication situation"}>
          {quiz.directions.map(direction => {
            const guide = quiz.profiles.find(profile => profile.directionIds.includes(direction.id));
            const section = result.practice.sections[direction.id];
            if (!guide) return null;
            const guideId = `practice-scenario-${guide.id}`;
            return <a key={direction.id} href={`#${guideId}`} onClick={() => {
              const details = document.getElementById(guideId);
              if (details instanceof HTMLDetailsElement) details.open = true;
            }}><span>{direction.title[locale]}</span><strong>{section.correct} / {section.total}</strong></a>;
          })}
        </nav>}
      </div>
      {focusItem && focusQuestion && <section className={styles.practiceFocus} data-practice-focus={focusItem.questionId}>
        <h3 className="mb-3 text-xl font-semibold">{communication
          ? (zh ? displayText("把话放回当时的情境") : "Read the message in context")
          : focusItem.correct ? (zh ? displayText("先用一题核对思路") : "Check your reasoning on one item") : (zh ? displayText("先复盘一题") : "Start by reviewing one item")}</h3>
        <PracticePrompt prompt={focusQuestion.prompt[locale]} number={quiz.questions.indexOf(focusQuestion) + 1} locale={locale} slug={quiz.slug} />
        <p className="mt-3 text-sm leading-7">{zh ? displayText("你的选择：") : "Your choice: "}{focusQuestion.options.find(option => option.id === focusItem.selectedOptionId)!.label[locale]}</p>
        <p className="text-sm leading-7">{zh ? displayText("正确答案：") : "Answer key: "}{focusQuestion.options.find(option => option.id === focusItem.correctOptionId)!.label[locale]}</p>
        <p className="mt-3" data-practice-focus-explanation>{focusQuestion.explanation![locale]}</p>
      </section>}
    </div>
    <details className="border-t border-slate-200 pt-3"><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? displayText("查看分项记录与计分范围") : "View section counts and scoring scope"}</summary>
    <ResultOverview locale={locale} title={zh ? displayText("分项答题记录") : "Answers by section"}>
    <dl className="grid gap-4 sm:grid-cols-2">
      {quiz.directions.map(direction => <div key={direction.id} className="rounded-xl border border-slate-200 p-4" data-practice-section={direction.id}>
        <dt className="font-semibold">{direction.title[locale]}</dt>
        <dd>{result.practice.sections[direction.id].correct} / {result.practice.sections[direction.id].total} {zh ? displayText("题答对") : "correct"}</dd>
      </div>)}
    </dl>
    </ResultOverview>
    <p>{zh ? displayText("这里只核对本题本的答案，不提供常模、能力等级、招聘线或认证。逐题解析和全部分项复习说明都可阅读，答对多少不决定内容权限。") : "These counts check answers in this bank. They supply no norms, ability level, recruitment cutoff or certification. Every explanation and section guide remains available regardless of the count."}</p>
    </details>
    <ResultReadingNav collapsible label={zh ? displayText("答案与复习") : "Answers and revision"} sections={[{ id: "practice-answer-review", title: zh ? displayText("逐题答案与解析") : "Every answer and explanation" }, { id: "practice-revision-guides", title: zh ? displayText("全部分项复习说明") : "All section revision guides" }]} />
    <details id="practice-answer-review" className="scroll-mt-24 border-t border-slate-200 pt-3">
      <summary className="min-h-11 cursor-pointer py-2 text-xl font-semibold">{zh ? displayText("逐题答案与解析") : "Every answer and explanation"}</summary>
      <ol className="space-y-7">
        {result.practice.items.map((item, index) => {
          const question = quiz.questions[index];
          const selected = question.options.find(option => option.id === item.selectedOptionId)!;
          const correct = question.options.find(option => option.id === item.correctOptionId)!;
          return <li key={item.questionId} className="rounded-xl border border-slate-200 p-5" data-practice-question={item.questionId}>
            <PracticePrompt prompt={question.prompt[locale]} number={index + 1} locale={locale} slug={quiz.slug} full />
            <p className="mt-3 font-semibold">{item.correct ? (zh ? displayText("本题答对") : "Correct answer") : (zh ? displayText("本题未答对") : "Not correct on this item")}</p>
            <dl className="my-3 space-y-2">
              <div><dt className="font-medium">{zh ? displayText("你选择的答案") : "Your selected answer"}</dt><dd>{selected.label[locale]}</dd></div>
              <div><dt className="font-medium">{zh ? displayText("本题正确答案") : "Answer key for this item"}</dt><dd>{correct.label[locale]}</dd></div>
            </dl>
            <p data-practice-explanation>{question.explanation![locale]}</p>
          </li>;
        })}
      </ol>
    </details>
    <section id="practice-revision-guides" className="scroll-mt-24 space-y-8">
      <p className="text-xl font-semibold">{zh ? displayText("全部分项复习说明") : "All section revision guides"}</p>
      {quiz.profiles.map(profile => <details key={profile.id} id={communication ? `practice-scenario-${profile.id}` : undefined} data-practice-guide={profile.id} className="scroll-mt-24 border-t border-slate-200 pt-3">
        <summary className="min-h-11 cursor-pointer py-2 text-xl font-semibold">{profile.title[locale]}</summary>
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} traditional={traditional} headingLevel={4} idPrefix={`practice-guide-${profile.id}`} mode="guide" />
      </details>)}
    </section>
  </ResultPage>;
}
