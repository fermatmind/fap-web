import type { Locale } from "@/lib/i18n/locales";

// Product display bands on the designed reference scale, not clinical cutoffs
// or estimates of the observed population mean.
export function iqResultCopy(score: number | null, locale: Locale) {
  const zh = locale === "zh";
  if (score === null) return {
    band: "unavailable",
    title: zh ? "成绩概览" : "Result overview",
    description: zh ? "参照分未提供；请结合下方有效的正确题数与表现阅读，不能据此认定提交失败。" : "A reference score was not provided. Read any valid counts and performance below; this alone does not mean submission failed.",
  };
  if (score < 80) return {
    band: "very_low",
    title: zh ? "本次得分偏低，建议重新测试" : "A low result — consider retaking the test",
    description: zh
      ? "你本次的测试得分较低，可以先检查题图是否完整显示、是否理解作答规则。建议在休息充分、环境安静时重新完成测试，不必急于用一次结果评价自己。如果持续担忧认知状态，可咨询当地正规医疗机构进行完整评估。"
      : "Your score on this attempt was low. First check that every image loaded fully and that you understood the instructions. Consider retaking the test when well rested and in a quiet setting, without judging yourself by a single result. If concerns about your cognitive functioning persist, seek a full assessment from a qualified local health professional.",
  };
  if (score < 100) return {
    band: "low",
    title: zh ? "本次参考分处于较低分段" : "Lower reference-score band",
    description: zh
      ? "你在本次测试中的得分偏低，部分题目的变化规律可能还没有完全找到。遇到复杂题目时，可以先观察图形之间的共同点，再逐项比较差异、排除不符合规律的选项。先把思路理清，再逐步提高答题熟练度。"
      : "Your score on this test was on the lower side, and you may not yet have identified all the patterns in some items. For complex questions, look for shared features first, then compare differences and eliminate options that do not fit. Focus on clarifying your reasoning before building fluency.",
  };
  if (score <= 115) return {
    band: "middle",
    title: zh ? "本次参考分处于中间分段" : "Middle reference-score band",
    description: zh
      ? "本次参考分处于设计分段的中间区域，已经正确完成了部分规律识别与推理任务。接下来可以多关注容易忽略的细节，并尝试用不同方法检查答案。保持思考与练习的习惯，积累更多解题经验。"
      : "Your reference score falls in the middle display band, with some pattern recognition and reasoning tasks answered correctly. Pay attention to details that are easy to miss, and try checking your answers with a different approach. Keep thinking and practising to build more problem-solving experience.",
  };
  return {
    band: "high",
    title: zh ? "本次参考分处于较高分段" : "Higher reference-score band",
    description: zh
      ? "你在本次测试中取得了较高得分，在规律识别与推理任务中表现较好。可以进一步挑战条件更多、变化更复杂的题目，尝试清楚地解释每一步推理。遇到熟悉的题型时，也别忘了检查是否存在其他可能的规律。"
      : "You achieved a higher score on this test and performed well on the pattern recognition and reasoning tasks. Try questions with more conditions and more complex changes, explaining each step of your reasoning clearly. Even with familiar item formats, check whether another rule could also fit.",
  };
}
