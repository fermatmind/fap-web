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
