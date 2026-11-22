import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scoreAlignmentQuestionnaire } from "@/lib/questionnaires/alignment";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { countSamplePresentation } from "./comparison-samples";

const vocabulary = {
  en: { examples: ["Both axes in the middle", "Rules and helping", "Two boundary counts"], axes: ["Lawful–chaotic", "Good–evil"] },
  zh: { examples: ["两轴都在中段", "倾向规则与助人", "两轴都在区间边界"], axes: ["守序—混乱", "善良—邪恶"] },
  "zh-TW": { examples: ["兩軸都落在中段", "傾向遵守規則、幫助他人", "兩軸都落在區間邊界"], axes: ["守序—混亂", "善良—邪惡"] },
};

export const alignmentPresentation = countSamplePresentation(24, 7, {
  en: { headline: "Original fictional alignment quiz · Free", stylesTitle: "Nine fictional alignments to compare", focus: "The trade-offs you choose when playing an imagined role", output: "Two pairs of counts and one or more of nine readings" },
  zh: { headline: "原创虚构阵营测试 · 完整结果免费", stylesTitle: "九种虚构阵营，看看取舍在哪里", focus: "扮演虚构角色时，你愿意怎样取舍", output: "两对计数与九种阵营中的匹配读法" },
  "zh-TW": { headline: "原創虛構陣營測驗 · 完整結果免費", stylesTitle: "比較九種虛構陣營如何下決定", focus: "扮演想像中的角色時，你會怎麼取捨", output: "兩對原始次數與相符的陣營讀法" },
}, {
  en: "Each axis has 12 choices. Totals of 4 or 8 on either first pole retain the adjacent readings.",
  zh: "每轴 12 道选择。前一端计数为 4 或 8 时，保留该轴两种相邻区间。",
  "zh-TW": "每軸 12 題。前一端次數為 4 或 8 時，該軸保留兩種相鄰讀法。",
});

const pairs = [["lawful", "chaotic"], ["good", "evil"]] as const;
export const alignmentSampleIds = ["middle", "rules-and-help", "boundary"] as const;

export function alignmentAnswers(quiz: Questionnaire, sample: number) {
  const targets = [[6, 6], [12, 12], [4, 8]][sample];
  const seen = [0, 0];
  return quiz.questions.map(question => {
    const pairIndex = pairs.findIndex(pair => question.options.some(option => option.directionId === pair[0]));
    const side = seen[pairIndex]++ < targets[pairIndex] ? 0 : 1;
    return question.options.find(option => option.directionId === pairs[pairIndex][side])!.id;
  });
}

export function alignmentSamples(quiz: Questionnaire, locale: DisplayLocale, key: Locale) {
  const text = vocabulary[locale];
  return alignmentSampleIds.map((id, sample) => {
    const options = alignmentAnswers(quiz, sample);
    const result = scoreAlignmentQuestionnaire(quiz, Object.fromEntries(quiz.questions.map((question, index) => [question.id, options[index]])));
    if (result.status !== "complete") throw new Error(`Invalid alignment sample ${id}`);
    return { id, title: text.examples[sample], axes: pairs.map(([first, second], i) => ({
      id: first, title: text.axes[i], value: result.counts[first], maximum: 12,
      score: `${result.counts[first]} : ${result.counts[second]}`,
    })), guideSummary: result.alignmentIds.map(profileId => quiz.profiles.find(profile => profile.id === profileId)!.title[key]).join(locale === "en" ? " · " : "、") };
  });
}
