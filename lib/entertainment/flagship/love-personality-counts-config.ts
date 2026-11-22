import { countSamplePresentation } from "./comparison-samples";

export const lovePersonalityCounts = [
  { id: "four-directions-tied", answers: "AAAAAAAAAAAAAAAAAAAAAAAA", labels: { en: "All four share the lead", zh: "四项同时领先", "zh-TW": "四項並列最高" } },
  { id: "clear-expression", answers: "ABABABABABABAAAAAAAAAAAA", labels: { en: "Clear expression leads", zh: "清楚表达一项领先", "zh-TW": "說清自己的想法居首" } },
  { id: "response-space-tie", answers: "BABABABAAAAAAAAAABABABAB", labels: { en: "Listening and space tie", zh: "体察回应和调整空间并列", "zh-TW": "聆聽回應和留一點空間並列" } },
];

export const lovePersonalityCountPresentation = countSamplePresentation(24, 6, {
  en: { headline: "Original relationship choices · Full results free", stylesTitle: "Four everyday moves and ways they can tie", focus: "Which action you reach for first in a made-up relationship situation", output: "Four raw counts and every highest tie" },
  zh: { headline: "原创恋爱情境选择 · 完整结果免费", stylesTitle: "四种相处动作和它们的并列读法", focus: "在虚构的关系情境里你先做哪一步", output: "四项原始计数与全部最高并列" },
  "zh-TW": { headline: "原創戀愛情境題 · 完整結果免費", stylesTitle: "四種常見的相處做法，最高分也可能並列", focus: "在想像的相處情境中，你會先做哪一件事", output: "四項原始次數與全部並列最高結果" },
}, {
  en: "Each action appears 12 times. The highest raw counts share the lead when tied.",
  zh: "每种做法出现 12 次。原始次数相同时，保留全部最高并列项。",
  "zh-TW": "每種做法出現 12 次。若最高次數相同，所有並列做法都會保留。",
});
