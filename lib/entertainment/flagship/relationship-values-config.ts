import { countSamplePresentation } from "./comparison-samples";

export const relationshipValuesCounts = [
  { id: "four-values-tied", answers: Array(24).fill("o1") as string[], labels: { en: "All four values tie", zh: "四项价值都并列", "zh-TW": "四項價值並列最高" } },
  { id: "romance-leads", answers: Array.from("121212121212111111111111", key => `o${key}`), labels: { en: "Romantic expression leads", zh: "浪漫表达最常被选", "zh-TW": "浪漫表達最常被選中" } },
  { id: "two-values-tie", answers: Array.from("212121211111111112121212", key => `o${key}`), labels: { en: "Cooperation and companionship tie", zh: "务实合作与情绪陪伴并列", "zh-TW": "實際分工與情感陪伴並列" } },
];

export const relationshipValuesCountPresentation = countSamplePresentation(24, 6, {
  en: { headline: "Original relationship values choices · Full results free", stylesTitle: "Four values you can prioritise in a relationship", focus: "Which relationship value you choose first when priorities compete", output: "Four counts and 15 single or tied guides" },
  zh: { headline: "原创关系价值选择 · 完整结果免费", stylesTitle: "相处时可能优先考虑的四种价值", focus: "日常安排出现取舍时你会优先照顾什么", output: "四项次数与 15 份单项及并列指南" },
  "zh-TW": { headline: "原創關係價值情境 · 完整結果免費", stylesTitle: "一段關係裡，四種可以優先照顧的事", focus: "當相處的選擇無法全顧到時，你會先在意什麼", output: "四項次數與 15 份單項及並列指南" },
}, {
  en: "Every value is available in 12 comparisons. All values sharing the highest count stay in the result.",
  zh: "每项价值都出现 12 次。最高次数相同的项目全部保留。",
  "zh-TW": "每項價值都會出現 12 次，所有並列最高的選擇都會保留在結果裡。",
});
