import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import type { Pss4Questionnaire } from "@/lib/questionnaires/pss4";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { StressReflection4Questionnaire, StressReflection4Result } from "@/lib/questionnaires/stressReflection4";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

type Complete = Extract<StressReflection4Result, { status: "complete" }>;
export function QuestionnaireStressCheckInReport({ quiz, result, locale, resultProfile }: { quiz: StressReflection4Questionnaire | Pss4Questionnaire; result: Complete; locale: Locale; resultProfile?: QuestionnaireProfile }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const zh = locale === "zh";
  const valid = result.status === "complete" && result.answered === 4 && result.contributions.length === 4
    && result.contributions.every((p, i) => p.id === quiz.questions[i].id && Number.isInteger(p.chosen) && p.chosen >= 0 && p.chosen <= 4
      && p.reversed === quiz.questions[i].reverse && p.value === (p.reversed ? 4 - p.chosen : p.chosen))
    && result.total === result.contributions.reduce((sum, p) => sum + p.value, 0);
  if (!valid) return <p role="status">{zh ? displayText("本次总分暂不可用，可以清除后重新开始。") : "This total is unavailable. Clear it and start again."}</p>;
  const profile = quiz.profiles[0];
  const readingProfile = (quiz.kind === "stress-reflection4" || quiz.kind === "pss4") && resultProfile?.id === profile.id && resultProfile.resultReading?.quizSlug === quiz.slug ? resultProfile : profile;
  return <div data-stress-check-in-result className="my-6 space-y-8">
    <div className="overflow-hidden rounded-2xl border border-sky-200">
      <div className="grid gap-3 bg-sky-50 p-4 sm:p-6 md:grid-cols-[minmax(0,12rem)_minmax(0,1fr)] md:items-start md:gap-8">
        <p data-stress-check-in-total className="text-sm font-semibold leading-snug text-sky-950">
          {quiz.kind === "pss4" ? quiz.resultHeading[locale] : (zh ? displayText("本次总分") : "This check-in total")}{" "}
          <strong className="mt-2 block whitespace-nowrap text-4xl font-semibold tabular-nums">{result.total} / 16</strong>
        </p>
        <div>
          <p className="leading-8">{profile.scoreReading[locale]}</p>
          <a href="#stress-check-in-calculation" className="mt-1 inline-flex min-h-11 items-center text-sm font-semibold text-sky-900 underline underline-offset-4">{zh ? displayText("查看四条回答怎样得出总分") : "See how your four answers add up"}</a>
        </div>
      </div>
      <section aria-labelledby="stress-check-in-calculation" className="border-t border-sky-200 p-4 sm:p-6">
        <h3 id="stress-check-in-calculation" className="scroll-mt-24 text-xl font-semibold">{zh ? displayText("这四项怎样相加") : "How these four choices add up"}</h3>
        <ol className="my-4 divide-y divide-slate-200">{result.contributions.map((part, i) => <li key={part.id} data-stress-check-in-contribution className="grid gap-1 py-3 leading-7 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)] sm:gap-6">
          <p className="font-medium">{i + 1}. {quiz.questions[i].prompt[locale]}</p>
          <p className="tabular-nums">{quiz.questions[i].options[part.chosen].label[locale]} ({part.chosen}) · {part.reversed ? `4 − ${part.chosen} = ${part.value}` : `${part.chosen} = ${part.value}`}</p>
        </li>)}</ol>
        <p className="font-semibold leading-8 tabular-nums">{result.contributions.map(p => p.value).join(" + ")} = {result.total}</p>
      </section>
      <div className="border-t border-sky-200 px-4 py-5 sm:p-6">
        <QuestionnaireResultReading quizSlug={quiz.slug} profile={readingProfile} locale={locale} traditional={traditional} headingLevel={3} idPrefix="stress-check-in-report" mode="result" previewSectionIds={["meaning", "context", "reflection"]} />
      </div>
    </div>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(traditional ? "zh-TW" : locale, quiz.slug, profile.id)}>{zh ? displayText("单独阅读完整公开指南") : "Read the complete public guide separately"}</Link>
    <p className="rounded-lg border border-slate-200 p-4 leading-8">{quiz.guide.find(s => s.id === "privacy")!.paragraphs[0][locale]}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${traditional ? "zh-TW" : locale}/tests#more-tests`}>{zh ? displayText("返回全部测试") : "Back to all tests"}</Link>
  </div>;
}
