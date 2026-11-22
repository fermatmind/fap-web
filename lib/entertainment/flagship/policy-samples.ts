import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scorePoliticalCoordinatesQuestionnaire } from "@/lib/questionnaires/politicalCoordinates";
import { scoreSecsQuestionnaire } from "@/lib/questionnaires/secs";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { countSamplePresentation } from "./comparison-samples";

const policyLabels = {
  en: {
    neutral: "Equal counts", separate: "Economic and social choices differ", missing: "One axis lacks enough answers",
    legend: "Each axis needs all 18 choices. Its coordinate is the second pole’s count minus the first’s.",
    titles: ["Economic left–right", "Communitarian–liberal"], unrated: "No coordinate", noScore: "This answer is unscored. This axis then has no coordinate.",
  },
  zh: {
    neutral: "两端次数相同", separate: "经济与社会侧重不同", missing: "一轴资料不足",
    legend: "每轴需要 18 道有效回答。坐标是后一端的次数减去前一端的次数。",
    titles: ["经济左向—右向", "共同体优先—个人自由优先"], unrated: "无坐标", noScore: "这个答案不计数，因此对应轴不生成坐标。",
  },
  "zh-TW": {
    neutral: "兩端次數相同", separate: "經濟與社會兩軸各有側重", missing: "其中一軸資料不足",
    legend: "每軸需要 18 題有效作答。坐標是後一端的選擇次數減前一端。",
    titles: ["經濟左向—右向", "共同體優先—個人自由優先"], unrated: "無坐標", noScore: "這個答案不計次，因此無法取得這一軸的坐標。",
  },
};

export const politicalCoordinatesPresentation = countSamplePresentation(36, 8, {
  en: { headline: "Original policy choices · Full results free", stylesTitle: "Four guides for comparing policy choices", focus: "How you choose between specific economic and social policies", output: "Two axes, raw counts and four public guides" },
  zh: { headline: "原创政策情境选择 · 完整结果免费", stylesTitle: "用四份指南对照不同的政策取舍", focus: "具体经济与社会政策上的选择倾向", output: "两条独立轴、原始次数和四份指南" },
  "zh-TW": { headline: "原創政策情境題 · 完整結果免費", stylesTitle: "從四份指南看不同政策取捨", focus: "你在經濟與社會政策情境中的選擇", output: "兩條獨立軸、原始次數和四份指南" },
}, { en: policyLabels.en.legend, zh: policyLabels.zh.legend, "zh-TW": policyLabels["zh-TW"].legend });

export function politicalCoordinateSamples(quiz: Questionnaire, locale: DisplayLocale) {
  const text = policyLabels[locale];
  const identifiers = ["balanced", "opposite", "one-missing"] as const;
  return [text.neutral, text.separate, text.missing].map((title, sample) => {
    const answers = Object.fromEntries(quiz.questions.map((question, index) => [question.id, sample === 2 && index === 0 ? "na"
      : sample === 1 ? (index % 2 === 0 ? "left" : "liberal")
      : sample === 2 ? (index % 2 === 0 ? "right" : "communitarian") : question.options[0].id]));
    const result = scorePoliticalCoordinatesQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw new Error(`Invalid political coordinates sample ${identifiers[sample]}`);
    const axes = (["economic", "social"] as const).map((id, index) => {
      const { rated, total, negativeCount, positiveCount, difference } = result.politicalCoordinates[id];
      return { id, title: text.titles[index], value: negativeCount ?? 0, maximum: total,
        score: difference === null ? `${text.unrated} · ${rated} / ${total}` : `${negativeCount} : ${positiveCount} · ${difference > 0 ? "+" : ""}${difference}` };
    });
    return { id: identifiers[sample], title, axes };
  });
}

export function politicalChoiceNote(quiz: Questionnaire, directionId: string, locale: DisplayLocale, key: Locale) {
  const direction = quiz.directions.find(item => item.id === directionId);
  if (!direction) return policyLabels[locale].noScore;
  const label = direction.title[key];
  return locale === "en" ? `Adds one to ${label}.` : locale === "zh" ? `给「${label}」计入 1 次。` : `讓「${label}」的次數加 1。`;
}

const secsLabels = {
  en: ["All responses at the midpoint", "Different averages", "One set without a mean"],
  zh: ["各题都选中点", "两组均分不同", "有一项没有均分"],
  "zh-TW": ["每題都選中點", "兩組均分不同", "有一項資料不足"],
};

export const conservatismPresentation = countSamplePresentation(12, 4, {
  en: { headline: "SECS 2013 U.S. issues · Full results free", stylesTitle: "Two sets of terms, two readings", focus: "How warmly you respond to specific social and economic terms", output: "Two independent 0–100 means" },
  zh: { headline: "SECS2013美国议题 · 完整结果免费", stylesTitle: "两组词语分开读", focus: "你对特定社会与经济词语的感受", output: "两项独立的 0–100 均分" },
  "zh-TW": { headline: "2013 年美國議題用語 · 完整結果免費", stylesTitle: "社會與經濟詞語分開看", focus: "你對特定社會與經濟詞語的感受", output: "兩項各自的 0–100 均分" },
}, {
  en: "Each mean is on a 0–100 scale. A set needs all its responses, including any reverse marking.",
  zh: "每组均分范围为 0–100。该组须全部有效作答，反向题先转换。",
  "zh-TW": "每組均分從 0 到 100。該組需有效作答滿題數，反向題會先換算。",
});

export function conservatismSamples(quiz: Questionnaire, locale: DisplayLocale, key: Locale) {
  const identifiers = ["midpoint", "different", "one-missing"] as const;
  return secsLabels[locale].map((title, sample) => {
    const answers = Object.fromEntries(quiz.questions.map((question, index) => {
      if (sample === 2 && index === 0) return [question.id, "na"];
      const value = sample === 1 ? (question.options[0].directionId === "social" ? 80 : 20) : 50;
      return [question.id, String(question.reverse ? 100 - value : value)];
    }));
    const result = scoreSecsQuestionnaire(quiz, answers);
    if (result.status !== "complete") throw new Error(`Invalid conservatism sample ${identifiers[sample]}`);
    const axes = (["social", "economic"] as const).map((id, index) => {
      const { mean, rated, total } = result.secsDomains[id];
      return { id, title: quiz.directions[index].title[key], value: mean ?? 0, maximum: 100,
        score: mean === null ? `${rated} / ${total} · ${conservatismPresentation[locale].insufficient}` : `${mean.toFixed(2)} / 100` };
    });
    return { id: identifiers[sample], title, axes };
  });
}

export function politicalCoordinatesCurrentGuideCopy(paragraph: string, locale: DisplayLocale) {
  return paragraph.replace({
    en: "Optional tab drafts expire after twenty-four hours and clear on completion or retake; share text contains public titles and links only.",
    zh: "主动保存的标签页草稿二十四小时后失效，完成或重测清除；分享只有公开标题和链接。",
    "zh-TW": "主動儲存的標籤頁草稿二十四小時後失效，完成或重測清除；分享只有公開標題和連結。",
  }[locale], {
    en: "Answers stay on the current page until you leave. Share text contains public titles and links only.",
    zh: "答案仅保留在当前页面。分享只包含公开标题和链接。",
    "zh-TW": "答案只留在目前頁面。分享只包含公開標題和連結。",
  }[locale]);
}

export function conservatismChoiceNote(
  _quiz: Questionnaire,
  question: Questionnaire["questions"][number],
  option: Questionnaire["questions"][number]["options"][number],
  locale: DisplayLocale,
) {
  if (typeof option.score !== "number") return locale === "en" ? "This response is unscored. Its domain will not have a mean."
    : locale === "zh" ? "这个答案不计分，该项不生成均分。" : "這個答案不計分，因此該項不會顯示均分。";
  const score = question.reverse ? 100 - option.score : option.score;
  return locale === "en" ? `Adds ${score} to the domain’s raw sum.`
    : locale === "zh" ? `本组原始和加 ${score}。` : `這個領域的原始總和加 ${score}。`;
}
