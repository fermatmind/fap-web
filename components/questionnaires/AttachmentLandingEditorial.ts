import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  secure: { zh: "比较担心与退缩都较少时，怎样同时表达需要、接受支持与保留自主。通过分歧、短暂分开和求助的情境，区分关系信任与从不需要回应；这不是对本次关系健康的认证。", en: "Explore how expressing needs, accepting support and autonomy can coexist when worry and distance are less prominent. Compare trust with never needing a response through disagreement, brief separation and asking for help. This is not certification of the relationship’s health." },
  anxious: { zh: "回看反复确认、对回应变化的留意与关系担心。区分已知事实、尚待核实的解释和想提出的请求，尝试更清楚的联系约定；不把担心直接当成对方会离开的证据。", en: "Examine repeated reassurance-seeking, attention to changing responses and relationship worry. Separate known facts, interpretations to check and requests you want to make. Try clearer contact arrangements without treating worry as evidence that someone will leave." },
  avoidant: { zh: "理解亲近、求助与情感表达中想保留距离的体验。比较可协商的暂停、正常独处与不易接受支持的情境，练习说明空间和返回时间，不以风格名称否定个人边界。", en: "Explore distance around closeness, seeking help and disclosure. Compare negotiated pauses, ordinary solitude and difficulty accepting support, practising how to state space needs and a return time without using a style label to dismiss boundaries." },
  fearful: { zh: "比较担心关系与亲近时退缩同时出现的情境。把希望靠近、担忧和具体行动分别整理，讨论可接受的节奏；不由这个成人原型推断童年创伤或婴幼儿分类。", en: "Compare situations involving both relationship worry and distance from closeness. Separate a wish for connection, concerns and concrete actions to discuss an acceptable pace. This adult prototype does not establish childhood trauma or an infant classification." },
};

export function attachmentLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function attachmentCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("完整免费、临时保存与分享范围", "完整免费、答题进度与分享")
      .replace("默认不保存；主动选择临时保存后，可在本标签页24小时内恢复，完成、重测或清除时删除草稿。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("默认不保存，只有主动临时保存才保留本标签页24小时草稿，完成、重测或清除即删除；分享不含答案或均分。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。分享不含答案或均分。")
    : text
      .replace("Full free access, temporary saving and sharing scope", "Free access, progress and sharing")
      .replace("Saving is off by default. Optional temporary saving allows restoration in this tab for 24 hours; completion, retaking or clearing deletes the draft.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Saving is off by default; optional saving creates a 24-hour tab draft deleted on completion, retaking or clearing.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
