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

export function loveLanguagesCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("完整结果、临时保存与分享", "完整结果、答题进度与分享")
      .replace("默认不保存；主动临时保存后可在本标签页24小时内恢复，完成、重测或清除会删除草稿。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("默认不保存答案，主动临时保存仅限本标签页24小时草稿，完成、重测或清除即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("分享仅包含测试名称和公开入口，不含答卷、均分或私人结果；想讨论分数时，由你自行选择说出哪些内容。", "复制分享只带测试名称与公开入口，不含答卷或均分。个人结果卡在浏览器内生成，包含汇总分数，由你选择保存或分享。")
      .replace("分享只带公开测试入口，不含答案或均分。", "复制分享只带公开测试入口，不含答案或均分。个人结果卡包含汇总分数，由你选择保存或分享。")
    : text
      .replace("Full results, temporary saving and sharing", "Full results, progress and sharing")
      .replace("Saving is off by default. Optional temporary saving allows restoration in this tab for 24 hours; completion, retaking or clearing deletes the draft.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Answers are not saved by default; optional saving creates a 24-hour tab draft, deleted on completion, retaking or clearing.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Sharing contains the test name and public entry only, not answers, means or private results. Choose for yourself which scores, if any, to discuss.", "Copied text includes only the test name and public entry, without answers or means. Your browser creates a personal card with aggregate scores. You choose whether to save or share it.")
      .replace("Sharing includes only the public test entry, without answers or means.", "Copied text links to the public test without answers or means. The optional personal card contains aggregate scores and is yours to save or share.");
}
