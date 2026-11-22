import { practiceSamplePresentation } from "./practice-samples";

export const numericalPracticePresentation = practiceSamplePresentation(30, 18, {
  en: { headline: "Original practice bank · Calculator allowed", stylesTitle: "Five numerical tasks you can review", focus: "Choosing the right quantities, units and operations from a stated problem", output: "Total and five counts with full workings" },
  zh: { headline: "原创练习题 · 可用计算器", stylesTitle: "五类数量题，先找出容易算错的那类", focus: "从题面找数量、单位和合适的运算", output: "总数、五项答对数与逐题解法" },
  "zh-TW": { headline: "原創練習題 · 可以用計算機", stylesTitle: "五類數量練習，從容易混淆的地方開始", focus: "從題目辨認數量、單位和應用的算式", output: "總答對題數、五個分項與解題過程" },
});
