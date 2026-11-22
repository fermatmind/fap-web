import { countSamplePresentation } from "./comparison-samples";

export const relationshipCounts = [
  { id: "both-tied", answers: "AAAAAAAAAAAAAAAAAAAAAAAA", labels: { en: "Two ties", zh: "两组都并列", "zh-TW": "兩組皆並列" } },
  { id: "one-sided-tie", answers: "ABABABABABABAAAAAAAAAAAA", labels: { en: "One side leads, one pair ties", zh: "一组有侧重，一组并列", "zh-TW": "一組有偏向，另一組並列" } },
  { id: "distinct-emphases", answers: "BABABABABABAABABABABABAB", labels: { en: "Space and certainty", zh: "重视空间，也重视确定性", "zh-TW": "重視獨處，也希望計畫明確" } },
];

export const relationshipCountPresentation = countSamplePresentation(24, 6, {
  en: { headline: "Original relationship choices · Full results free", stylesTitle: "Four preferences and the two ties", focus: "Contact, space, certainty and flexibility", output: "Two pairs of counts and six guides" },
  zh: { headline: "原创恋爱安排选择 · 完整结果免费", stylesTitle: "四种安排偏好和两种并列", focus: "联系、独立空间、确定性和弹性安排", output: "两组原始计数和六份指南" },
  "zh-TW": { headline: "原創戀愛安排題 · 完整結果免費", stylesTitle: "四種安排偏好和兩種平手讀法", focus: "聯絡、自己的空間、確定性與彈性", output: "兩組原始次數和六份公開指南" },
}, {
  en: "Left and right counts total 12 within each pair. Read the two pairs separately.",
  zh: "每组左右合计 12 次。两组各自计算和解读。",
  "zh-TW": "每組左、右相加都是 12 次。兩組分開計算、分開閱讀。",
});
