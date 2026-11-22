import { countSamplePresentation } from "./comparison-samples";

export const likableCounts = [
  { id: "five-way-tie", answers: "AAAAAAAAAAAAAAAAAAAA", labels: { en: "All five share the lead", zh: "五项同时领先", "zh-TW": "五項並列最高" } },
  { id: "warmth-leads", answers: "ABABABABAAAAAAAAAAAA", labels: { en: "Warmth comes to the fore", zh: "热心一项领先", "zh-TW": "溫暖接待領先" } },
  { id: "two-way-tie", answers: "BABAAAAAAAABABABABAA", labels: { en: "Two ways share the lead", zh: "两项并列领先", "zh-TW": "兩個做法並列" } },
];

export const likableCountPresentation = countSamplePresentation(20, 5, {
  en: { headline: "Original interaction choices · Full results free", stylesTitle: "What you bring to an everyday conversation", focus: "The contribution you choose in ordinary interactions", output: "Five counts and all leading ties" },
  zh: { headline: "原创互动选择 · 完整结果免费", stylesTitle: "你在日常互动里会带来什么", focus: "日常互动中你会先贡献什么", output: "五项原始次数与全部最高并列" },
  "zh-TW": { headline: "原創互動情境 · 完整結果免費", stylesTitle: "你會為一場日常對話帶來什麼？", focus: "日常相處時你傾向先做的事", output: "五項原始次數與所有最高並列" },
}, {
  en: "Raw selections out of eight opportunities per direction. Equal highest counts share the lead.",
  zh: "各项各有 8 次出现机会。最高次数相同时，保留所有并列项。",
  "zh-TW": "每一項各有 8 次出現機會。如果最高次數相同，所有並列分項都會保留。",
});
