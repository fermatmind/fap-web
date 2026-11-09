import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "tsundere": {
    "zh": "轻松逞强之后明确关心：比较玩笑与谢意的先后表达，阅读具体对话、反例与小尝试；以对方欢迎玩笑为前提，不把现实拒绝解释为喜欢。",
    "en": "A playful front followed by explicit care: compare the order of joking and appreciation through dialogue, counterexamples and small trials. Jokes need to be welcome; real refusal is never interpreted as affection."
  },
  "kuudere": {
    "zh": "平静简短地说清关心：观察具体、克制的表达形式，并与需要私下或稍后表达的闷娇对照；简短不代表没有情绪，也不认证成熟或可靠。",
    "en": "Calm, concise care: examine specific, restrained wording and compare it with dandere’s preference for privacy or later expression. Brevity means neither absence of feeling nor certified maturity or reliability."
  },
  "dandere": {
    "zh": "熟悉之后或私下慢慢表达：阅读表达时机、空间与寻找措辞的例子，区分愿意说与需要立即说；不以安静诊断社交焦虑或要求他人敞开心扉。",
    "en": "Expression after familiarity or in private: explore timing, space and finding words, distinguishing willingness from an obligation to speak immediately. Quiet diagnoses no social anxiety and obliges nobody to open up."
  },
  "deredere": {
    "zh": "直接表达感谢与温暖：比较当下清楚说出开心、支持与谢意的方式，保留对方的空间和自己的暂停需要；不据此评价真诚、魅力或关系适配。",
    "en": "Direct thanks and warmth: compare clear expressions of pleasure, support and appreciation while retaining the other person’s space and your own need to pause. This does not assess sincerity, charm or relationship compatibility."
  }
};

export function dereLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function dereCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("直接开始、浏览器计分与自愿保存", "直接开始、浏览器计分与分享")
      .replace("默认不保存作答；只有主动保存后，草稿才在本标签页保留最多24小时，完成、退出清除或重测即删除。可随时退出；", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。可随时退出。")
      .replace("浏览器内计算，默认不保存。主动保存的草稿仅在本标签页保留最多24小时，完成、退出清除或重测即删除；答案不写进网址或分析事件。", "答案在浏览器内计算，不写进网址或分析事件。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Direct start, browser scoring and optional saving", "Direct start, browser scoring and sharing")
      .replace("Answers are not saved by default. An explicitly saved draft remains in this tab for up to 24 hours and clears on completion, exit-and-clear or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Scoring happens in your browser, without saving by default. Explicitly saved drafts remain in this tab for up to 24 hours and clear on completion, exit-and-clear or retake. Answers enter neither URLs nor analytics.", "Scoring happens in your browser. Answers enter neither URLs nor analytics. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
