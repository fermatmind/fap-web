import { practiceSamplePresentation } from "./practice-samples";

export const aptitudePracticePresentation = practiceSamplePresentation(30, 15, {
  en: { headline: "Original practice bank · No time limit", stylesTitle: "Five kinds of reasoning to practise", focus: "Short problems with stated rules and one keyed answer", output: "Total and five sections, with explanations" },
  zh: { headline: "原创练习题 · 不限时", stylesTitle: "五类短题帮你找到下一次练习的重点", focus: "根据题面条件作推理、找规律和查错", output: "总正确数、五个分项及逐题解析" },
  "zh-TW": { headline: "原創練習題 · 不限作答時間", stylesTitle: "從五類推理題挑出想加練的地方", focus: "依題目交代的條件推理、找規律或核對錯誤", output: "總答對題數、五個分項與逐題解析" },
});
