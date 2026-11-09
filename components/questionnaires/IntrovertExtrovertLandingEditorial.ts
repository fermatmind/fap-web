import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  introvert: { zh: "较低总分的阅读入口：回看交谈、陌生人和注意焦点相关的回答。通过具体场合核对安静与参与方式，不把较少发言解释为不友好、能力不足或固定身份。", en: "Read a lower total through responses about conversation, unfamiliar people and social attention. Examine quietness and participation in context, without equating speaking less with unfriendliness, low ability or a fixed identity." },
  "ambivert-intro": { zh: "靠近中段较低一侧的读法。区分温和评分与高低混合，比较熟悉和陌生场合的具体差异；中间偏内向不是新的IPIP人格类型，也不证明两端能力兼备。", en: "Explore the lower-middle band by distinguishing moderate from mixed ratings and comparing familiar with unfamiliar situations. This is not a new IPIP type or proof of proficiency at both ends." },
  "ambivert-extro": { zh: "靠近中段较高一侧的读法。观察哪些条目推动总分、哪些情境仍希望少些注意；比较主动交谈与实际沟通效果，而不把中间位置当成社交全能。", en: "Examine which items raise an upper-middle total and where less attention may still be welcome. Compare initiating conversation with its actual effects, without treating a middle position as all-round social skill." },
  extrovert: { zh: "较高总分的阅读入口：关注主动交谈、群体中的表现与注意焦点。通过停顿、倾听和活动安排的例子核对日常体验；外向侧不保证表达有效或不需要休息。", en: "Read a higher total through conversation, group participation and social attention. Use examples of pausing, listening and activity planning to check experience. An extrovert-side score guarantees neither effective expression nor freedom from needing rest." },
};

export function introvertExtrovertLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function introvertExtrovertCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("重测、草稿与个人答案", "重测与分享")
      .replace("默认不保存；主动开启时只保留本标签页24小时草稿，完成、清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("草稿默认关闭，仅主动开启保留本标签页24小时，完成、清除或重测即删。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Retests, drafts and personal answers", "Retaking and sharing")
      .replace("Saving is off by default; an optional 24-hour tab draft is deleted on completion, clearing or retaking.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Draft saving is off by default; if enabled it lasts 24 hours in this tab and is deleted on completion, clearing or retaking.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
