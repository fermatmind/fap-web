import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "visual": {
    "zh": "图示与空间关系：阅读箭头、位置和结构概览的使用意愿，结合流程图、文字对照与反例理解结果。它不评空间能力，也不规定所有材料都应改成图片。",
    "en": "Diagrams and spatial layout: explore willingness to use arrows, positions and structural overviews through flowcharts, text alternatives and counterexamples. This does not assess spatial ability or prescribe pictures for all material."
  },
  "auditory": {
    "zh": "口头解释与讨论：观察可暂停讲解、提问与自己讲述的使用意愿。通过同一流程的口头说明和替代安排阅读结果，不推断听觉记忆、社交能力或听课效果。",
    "en": "Spoken explanation and discussion: examine willingness for pausable explanations, questions and speaking in your own words. Compare spoken versions of the same process and alternatives without inferring auditory memory, social ability or lecture effectiveness."
  },
  "reading-writing": {
    "zh": "阅读与书写：回看按自己节奏读步骤、列提纲和写问题的使用意愿。区分整理材料与能否解释、回忆、应用，不把偏好当成阅读能力或应试水平。",
    "en": "Reading and writing: revisit willingness to read steps at your pace, outline ideas and write questions. Separate organising material from explanation, recall and application without equating preference with literacy or exam performance."
  },
  "kinesthetic": {
    "zh": "实例与动手尝试：探索普通例子、空白卡片与可安全撤回的小操作的使用意愿。保留必要说明与观察，不把身体活动、触觉或实践偏好当作效果保证。",
    "en": "Examples and practical trials: explore willingness for ordinary examples, blank cards and safe, reversible actions. Retain necessary explanation and observation rather than treating bodily activity, touch or practice preferences as guarantees of learning."
  }
};

export function learningLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function learningCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("直接开始、完整免费与可选保存", "直接开始、完整免费与隐私")
      .replace("默认不保存；只有主动保存才提供当前标签页24小时内恢复，完成、清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("浏览器内计分，默认不保存，主动保存的草稿仅供本标签页24小时内恢复，完成、清除或重测即删除。", "答案在浏览器内计分。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Direct start, complete free guides and optional saving", "Direct start, complete free guides and privacy")
      .replace("Saving is off by default; an explicitly saved tab draft can be restored within 24 hours and clears on completion, clearing or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Scoring is in the browser with saving off by default; an explicitly saved tab draft is restorable within 24 hours and clears on completion, clearing or retake.", "Scoring happens in the browser. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
