import { countSamplePresentation } from "./comparison-samples";

export const responseColorCounts = [
  { id: "four-way-tie", answers: "AAAAAAAAAAAAAAAAAAAAAAAA", labels: { en: "Every color shares the lead", zh: "四色全部并列", "zh-TW": "四色都並列最高" } },
  { id: "red-leads", answers: "ABABABABABABAAAAAAAAAAAA", labels: { en: "Red leads the count", zh: "红色次数最多", "zh-TW": "紅色次數最高" } },
  { id: "yellow-blue-tie", answers: "BABABABAAAAAAAAAABABABAB", labels: { en: "Yellow and blue share the lead", zh: "黄色和蓝色并列", "zh-TW": "黃色和藍色並列" } },
];

export const responseColorCountPresentation = countSamplePresentation(24, 5, {
  en: { headline: "Original response choices · Full results free", stylesTitle: "Four ways to react, including every leading tie", focus: "What you reach for first in everyday exchanges", output: "Four counts and 15 possible guide pages" },
  zh: { headline: "原创反应方式选择 · 完整结果免费", stylesTitle: "四色反应方式，以及并列时该怎么读", focus: "日常交流或计划有变化时的第一反应", output: "四色计数与 15 份结果指南" },
  "zh-TW": { headline: "原創反應情境 · 完整結果免費", stylesTitle: "四色反應方式與所有並列結果", focus: "日常相處或安排有變時你先做什麼", output: "四色次數與 15 份結果指南" },
}, {
  en: "Each color appears 12 times. Read the raw counts and keep every color sharing the highest count.",
  zh: "每种颜色出现 12 次。看原始选择次数，最高并列全部保留。",
  "zh-TW": "每色出現 12 次。查看原始選擇次數，並保留所有並列最高的顏色。",
});
