import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { assessmentChineseCopy } from "@/lib/tests/traditionalAssessmentDisplay";

// Product display bands on the designed reference scale, not clinical cutoffs
// or estimates of the observed population mean.
export function iqResultCopy(score: number | null, locale: Locale, displayLocale: DisplayLocale = locale) {
  const zh = locale === "zh";
  const copy = (source: string, traditional: string) => assessmentChineseCopy(displayLocale, source, traditional);
  if (score === null) return {
    band: "unavailable",
    title: zh ? copy("成绩概览", "成績概覽") : "Result overview",
    description: zh ? copy("参照分未提供；请结合下方有效的正确题数与表现阅读，不能据此认定提交失败。", "未提供參照分數。請搭配下方有效的答對題數與表現解讀，缺少參照分數不代表提交失敗。") : "A reference score was not provided. Read any valid counts and performance below; this alone does not mean submission failed.",
  };
  if (score < 80) return {
    band: "very_low",
    title: zh ? copy("本次得分偏低，建议重新测试", "本次得分偏低，建議重新測試") : "A low result — consider retaking the test",
    description: zh
      ? copy("你本次的测试得分较低，可以先检查题图是否完整显示、是否理解作答规则。建议在休息充分、环境安静时重新完成测试，不必急于用一次结果评价自己。如果持续担忧认知状态，可咨询当地正规医疗机构进行完整评估。", "你本次的測試得分較低，可以先檢查題圖是否完整顯示、是否理解作答規則。建議在休息充分、環境安靜時重新完成測試，不必急於用一次結果評價自己。如果持續擔憂認知狀態，可諮詢當地正規醫療機構進行完整評估。")
      : "Your score on this attempt was low. First check that every image loaded fully and that you understood the instructions. Consider retaking the test when well rested and in a quiet setting, without judging yourself by a single result. If concerns about your cognitive functioning persist, seek a full assessment from a qualified local health professional.",
  };
  if (score < 100) return {
    band: "low",
    title: zh ? copy("本次参考分处于较低分段", "本次參照分數落在較低分段") : "Lower reference-score band",
    description: zh
      ? copy("你在本次测试中的得分偏低，部分题目的变化规律可能还没有完全找到。遇到复杂题目时，可以先观察图形之间的共同点，再逐项比较差异、排除不符合规律的选项。先把思路理清，再逐步提高答题熟练度。", "你在本次測試中的得分偏低，部分題目的變化規律可能還沒有完全找到。遇到複雜題目時，可以先觀察圖形之間的共同點，再逐項比較差異、排除不符合規律的選項。先把思路理清，再逐步提高答題熟練度。")
      : "Your score on this test was on the lower side, and you may not yet have identified all the patterns in some items. For complex questions, look for shared features first, then compare differences and eliminate options that do not fit. Focus on clarifying your reasoning before building fluency.",
  };
  if (score <= 115) return {
    band: "middle",
    title: zh ? copy("本次参考分处于中间分段", "本次參照分數落在中間分段") : "Middle reference-score band",
    description: zh
      ? copy("本次参考分处于设计分段的中间区域，已经正确完成了部分规律识别与推理任务。接下来可以多关注容易忽略的细节，并尝试用不同方法检查答案。保持思考与练习的习惯，积累更多解题经验。", "本次參照分數落在設計分段的中間區域，已經正確完成了部分規律識別與推理任務。接下來可以多關注容易忽略的細節，並嘗試用不同方法檢查答案。保持思考與練習的習慣，積累更多解題經驗。")
      : "Your reference score falls in the middle display band, with some pattern recognition and reasoning tasks answered correctly. Pay attention to details that are easy to miss, and try checking your answers with a different approach. Keep thinking and practising to build more problem-solving experience.",
  };
  return {
    band: "high",
    title: zh ? copy("本次参考分处于较高分段", "本次參照分數落在較高分段") : "Higher reference-score band",
    description: zh
      ? copy("你在本次测试中取得了较高得分，在规律识别与推理任务中表现较好。可以进一步挑战条件更多、变化更复杂的题目，尝试清楚地解释每一步推理。遇到熟悉的题型时，也别忘了检查是否存在其他可能的规律。", "你在本次測試中取得了較高得分，在規律識別與推理任務中表現較好。可以進一步挑戰條件更多、變化更複雜的題目，嘗試清楚地解釋每一步推理。遇到熟悉的題型時，也別忘了檢查是否存在其他可能的規律。")
      : "You achieved a higher score on this test and performed well on the pattern recognition and reasoning tasks. Try questions with more conditions and more complex changes, explaining each step of your reasoning clearly. Even with familiar item formats, check whether another rule could also fit.",
  };
}
