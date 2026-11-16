import type { DisplayLocale } from "@/lib/i18n/locales";
import { scoreArchetypeQuestionnaire } from "@/lib/questionnaires/basicScoring";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { QuestionnaireArchetypeSample } from "./QuestionnaireArchetypeSample";

// One option ID per published question, in order. Neither sheet is a real attempt.
const answerSheets = ["AAADCBAAADCBAAADCB", "BCADDBAAADCABCCBAC"] as const;

const traditionalChartCopy: Record<string, string> = {
  "查看全部选择次数": "查看所有選擇次數",
  "示例选择次数": "示例選擇次數",
  "分母是这一类选项出现的次数。所有最高计数都保留。计数占比不是相似度，也不是人群排名。": "分母是這類選項出現的次數。所有最高次數的選項都會保留。此比例不代表相似度或人群排名。",
};

export function ChiikawaResultExamples({ quiz, locale }: { quiz: Questionnaire; locale: DisplayLocale }) {
  const zh = locale !== "en";
  const traditional = locale === "zh-TW";
  const sourceLocale = zh ? "zh" : "en";
  const chartCopy = (value: string) => {
    if (!traditional) return value;
    return traditionalChartCopy[value] ?? value;
  };
  const [single, tie] = answerSheets.map(sheet => scoreArchetypeQuestionnaire(quiz, Object.fromEntries(
    quiz.questions.map((question, index) => [question.id, sheet[index]]),
  )));
  if (single.status !== "complete" || single.profileIds.length !== 1 ||
      tie.status !== "complete" || tie.profileIds.length !== 2) return null;
  const highest = (result: typeof single) => Math.max(...Object.values(result.counts));

  return <section className="my-8 scroll-mt-24 space-y-4" id="chiikawa-examples" aria-labelledby="chiikawa-examples-title">
    <h2 className="text-2xl font-semibold" id="chiikawa-examples-title">{traditional ? "角色結果示例" : zh ? "角色结果示例" : "Sample character results"}</h2>
    <p className="leading-7 text-slate-700">{traditional ? "以下兩份虛構答卷使用正式測驗的計分規則。" : zh ? "以下两份虚构答卷使用正式测试的计分规则。" : "These two fictional answer sheets use the same scoring rules as the quiz."}</p>
    <div className="grid items-start gap-4 sm:grid-cols-2">
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{traditional ? "單一配對" : zh ? "单一匹配" : "One match"}</h3>
        <p>{traditional ? `這位角色被選中 ${highest(single)} 次，次數最高，因此只顯示這一位角色。` : zh ? `这位角色被选中 ${highest(single)} 次，次数最高，因此只显示一个匹配。` : `One character leads with ${highest(single)} selections, so the quiz shows a single match.`}</p>
        <QuestionnaireArchetypeSample quiz={quiz} locale={sourceLocale} displayLocale={locale} copy={chartCopy} result={single} sampleId="chiikawa-sample-single" />
      </article>
      <article className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-lg font-semibold">{traditional ? "最高次數並列" : zh ? "最高并列" : "Tie for first"}</h3>
        <p>{traditional ? `兩位角色各被選中 ${highest(tie)} 次，並列最高。兩位都會保留，顯示順序不代表名次。` : zh ? `两位角色各被选中 ${highest(tie)} 次，同为最高。两项都保留，显示顺序不分主次。` : `Both characters tie for first with ${highest(tie)} selections each. Both matches are kept, and the order does not break the tie.`}</p>
        <QuestionnaireArchetypeSample quiz={quiz} locale={sourceLocale} displayLocale={locale} copy={chartCopy} result={tie} sampleId="chiikawa-sample-tie" />
      </article>
    </div>
  </section>;
}
