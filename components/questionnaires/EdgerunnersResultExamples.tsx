import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { QuestionnaireArchetypeSample } from "./QuestionnaireArchetypeSample";

// One letter per question in the published 21-question bank. These are synthetic, never user attempts.
const answerSheets = ["DAAADCBCADDDCDCDCCDCB", "AADBDBDBABDACACABDABB"] as const;

export function EdgerunnersResultExamples({ quiz, locale, displayLocale = locale, copy = value => value }: { quiz: Questionnaire; locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  const [single, tie] = answerSheets.map(sheet => scoreArchetypeQuestionnaire(quiz, Object.fromEntries(
    quiz.questions.map((question, index) => [question.id, sheet[index]]),
  )));
  if (single.status !== "complete" || tie.status !== "complete" ||
      single.profileIds.length !== 1 || tie.profileIds.length !== 2) return null;
  const runnerUp = [...quiz.directions].filter(direction => !single.profileIds.includes(direction.id))
    .sort((a, b) => single.counts[b.id] - single.counts[a.id])[0];
  const winner = quiz.profiles.find(profile => profile.id === single.profileIds[0])!;
  const high = single.counts[winner.directionIds[0]];
  const next = single.counts[runnerUp.id];
  const tiedCount = tie.counts[quiz.profiles.find(profile => profile.id === tie.profileIds[0])!.directionIds[0]];
  return <section className="my-8 scroll-mt-24 space-y-4" id="edgerunners-examples" aria-labelledby="edgerunners-examples-title">
    <h2 className="text-2xl font-semibold" id="edgerunners-examples-title">{zh ? copy("结果示例") : "Sample results"}</h2>
    <p className="leading-7 text-slate-700">{zh ? copy("两份虚构答卷，按正式测试的计分规则计算。") : "Two fictional answer sheets scored using the same rules as the quiz."}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{zh ? copy("单一匹配") : "One match"}</h3>
        <p className="leading-7">{zh ? copy(`${winner.title.zh}被选中 ${high} 次，第二名${runnerUp.title.zh}被选中 ${next} 次。次数不同，只保留最高的一项。`) : `${winner.title.en} leads with ${high} choices, ahead of ${runnerUp.title.en} with ${next}. Only the highest count is kept.`}</p>
        <QuestionnaireArchetypeSample quiz={quiz} locale={locale} result={single} copy={copy} displayLocale={displayLocale} sampleId="edgerunners-sample-single" />
      </article>
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{zh ? copy("最高并列") : "Tie for first"}</h3>
        <p className="leading-7">{zh ? copy(`两位角色各被选中 ${tiedCount} 次，同为最高。两项都保留，显示顺序不分主次。`) : `Both characters were chosen ${tiedCount} times, the highest count. Both matches are kept, and their order does not break the tie.`}</p>
        <QuestionnaireArchetypeSample quiz={quiz} locale={locale} result={tie} copy={copy} displayLocale={displayLocale} sampleId="edgerunners-sample-tie" />
      </article>
    </div>
  </section>;
}
