import { practiceSamplePresentation } from "./practice-samples";

export const abstractPracticePresentation = practiceSamplePresentation(24, 16, {
  en: { headline: "Original practice bank · Bounded rules", stylesTitle: "Four kinds of pattern to work through", focus: "Testing candidate rules against every example in each item", output: "Four correct counts and worked explanations" },
  zh: { headline: "原创练习题 · 规则范围明确", stylesTitle: "四种规律题，检验哪个规则说得通", focus: "把候选规则逐一放回题目给出的全部例子", output: "四个分项正确数和逐题推导" },
  "zh-TW": { headline: "原創練習題 · 規則範圍明確", stylesTitle: "四種規律題，找出符合所有例子的規則", focus: "用題目給的全部例子檢查可能的規則", output: "四個分項答對題數和每題推導" },
});
