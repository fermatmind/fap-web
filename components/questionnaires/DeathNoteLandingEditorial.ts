import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "light-yagami": {
    "zh": "从一本私人阅读摘记，说明这次自己选择的目标。比较目标、区分解释与一致条件，让目标保留修订空间。",
    "en": "Name a chosen aim for a personal reading notebook. Compare aims, distinguishing explanations and consistent criteria, with room to revise the aim."
  },
  "l": {
    "zh": "面对一张普通照片的两种解释，找出能区分它们的问题。比较提问、资料排列与意外细节，结论仍待实际信息核对。",
    "en": "Find a question that distinguishes two readings of an ordinary photo. Compare questioning, arranged information and unusual details, checking conclusions against evidence."
  },
  "ryuk": {
    "zh": "参观普通小展览时，留意一个出乎意料的细节。通过例子比较观察、个人表达和另试路径，决定是否继续关注。",
    "en": "Notice an unexpected detail in an ordinary small exhibition. Compare observation, expression and alternative routes, with a choice about what to follow."
  },
  "misa-amane": {
    "zh": "为私人笔记选择一种可见的表达方式。比较呈现风格、记录细节与自选目的，允许随场景调整表达。",
    "en": "Choose a visible expression for personal notes. Compare presentation, recorded detail and chosen purpose, adjusting expression to the situation."
  },
  "near": {
    "zh": "把手边的零散材料按已知、未知与来源排列。比较整理资料、提出区分问题和规定条件，保留信息不足之处。",
    "en": "Arrange available materials by what is known, unknown and sourced. Compare organization, distinguishing questions and criteria while keeping gaps visible."
  },
  "mello": {
    "zh": "在自愿小活动中另试一种可以撤回的布局。比较替代路径、先定目标与重新利用材料，先约定修改空间。",
    "en": "Try a reversible layout in a voluntary activity. Compare alternatives, chosen aims and reused materials, first agreeing room to revise."
  },
  "teru-mikami": {
    "zh": "为私人收藏写明一致使用的纳入条件。通过例子区分条件、资料整理与目标，遇到反例时也可以修订。",
    "en": "State consistent inclusion criteria for a personal collection. Compare criteria, organization and aims, with room to revise when counterexamples appear."
  },
  "minoru-tanaka": {
    "zh": "重新想一张空白卡片在小活动里还能怎样使用。比较资源用途、自选目标和替代路径，并确认材料使用意愿。",
    "en": "Reconsider what a blank card could do in a small activity. Compare resource uses, chosen aims and alternatives, checking permission to use materials."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function deathNoteLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
