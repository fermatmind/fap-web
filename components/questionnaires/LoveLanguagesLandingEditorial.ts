import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  words: { zh: "比较说出与听到感谢、欣赏和鼓励的意义。通过具体措辞与情境区分真诚肯定、泛泛夸奖和需要澄清的反馈，尝试把想表达的关心说清楚。", en: "Compare the meaning of offering and hearing thanks, appreciation and encouragement. Use concrete wording and situations to distinguish sincere affirmation, generic praise and feedback needing clarification, then try expressing care more clearly." },
  acts: { zh: "分别回看提供与接收实际帮助时的意义。比较主动分担、先问需要与未经同意的包办，选择一项双方认可的小行动，并核对是否确实有帮助。", en: "Examine the meaning of offering and receiving practical help. Compare taking initiative, asking what is needed and taking over without agreement. Choose one mutually welcome action and check whether it actually helped." },
  gifts: { zh: "从准备和收到小心意两个角度，理解物件、记忆与被惦记的感觉。区分个人意义与价格，讨论预算、接收意愿及不增加消费的表达方式。", en: "Explore preparing and receiving thoughtful tokens through objects, memories and feeling remembered. Distinguish personal meaning from price, discussing budgets, whether a gift is wanted and ways to show care without another purchase." },
  time: { zh: "比较投入注意与获得专注陪伴的意义。用共同活动、谈话和可协商的时间安排，区分相互在场与只是待在一起，同时保留独处和暂停的空间。", en: "Compare giving attention with receiving attentive company. Use activities, conversation and negotiable time arrangements to distinguish mutual presence from simply sharing a space, while leaving room for solitude and pauses." },
  touch: { zh: "分别观察表达与接收日常非性接触的意义。通过具体询问与当下反馈讨论舒适方式，尊重拒绝和改变主意；任何评分都不能代替双方意愿。", en: "Consider giving and receiving everyday nonsexual contact separately. Discuss comfortable gestures through specific questions and current feedback, respecting refusal and changed preferences. No rating replaces mutual willingness." },
};

export function loveLanguagesLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
