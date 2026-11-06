import type { Locale } from "@/lib/i18n/locales";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { QuestionnaireArchetypeReport } from "./QuestionnaireArchetypeReport";

// One option ID per published question, in order. Neither sheet is a real attempt.
const answerSheets = ["AAADCBAAADCBAAADCB", "BCADDBAAADCABCCBAC"] as const;

export function ChiikawaResultExamples({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const zh = locale === "zh";
  const [single, tie] = answerSheets.map(sheet => scoreArchetypeQuestionnaire(quiz, Object.fromEntries(
    quiz.questions.map((question, index) => [question.id, sheet[index]]),
  )));
  if (single.status !== "complete" || single.profileIds.length !== 1 ||
      tie.status !== "complete" || tie.profileIds.length !== 2) return null;
  const highest = (result: typeof single) => Math.max(...Object.values(result.counts));

  return <section className="my-8 scroll-mt-24 space-y-4" id="chiikawa-examples" aria-labelledby="chiikawa-examples-title">
    <h2 className="text-2xl font-semibold" id="chiikawa-examples-title">{zh ? "角色结果示例" : "Sample character results"}</h2>
    <p className="leading-7 text-slate-700">{zh ? "以下两份虚构答卷使用正式测试的计分规则。" : "These two fictional answer sheets use the same scoring rules as the quiz."}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{zh ? "单一匹配" : "One match"}</h3>
        <p>{zh ? `这位角色被选中 ${highest(single)} 次，次数最高，因此只显示一个匹配。` : `One character leads with ${highest(single)} selections, so the quiz shows a single match.`}</p>
        <QuestionnaireArchetypeReport quiz={quiz} locale={locale} result={single} sampleId="chiikawa-sample-single" />
      </article>
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{zh ? "最高并列" : "Tie for first"}</h3>
        <p>{zh ? `两位角色各被选中 ${highest(tie)} 次，同为最高。两项都保留，显示顺序不分主次。` : `Both characters tie for first with ${highest(tie)} selections each. Both matches are kept, and the order does not break the tie.`}</p>
        <QuestionnaireArchetypeReport quiz={quiz} locale={locale} result={tie} sampleId="chiikawa-sample-tie" />
      </article>
    </div>
  </section>;
}
