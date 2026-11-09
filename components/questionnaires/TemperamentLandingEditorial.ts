import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  sanguine: { zh: "活跃参与方向的读法：从新活动、交流与共同体验的选择，观察自己怎样进入一个场景。比较参与带来的新机会与后续投入，结合需要安静准备的反例阅读。", en: "Explore open engagement through choices about activities, conversation and shared experiences. Compare the opportunities participation creates with the follow-through it needs, including occasions when quiet preparation works better." },
  choleric: { zh: "目标推进方向的读法：回看确定下一步、作出决定与推动行动的选择。区分及时启动与过早定案，用共同目标、现实条件和对方反馈核对推进方式。", en: "Examine directed action through decisions, next steps and getting started. Distinguish timely initiative from deciding too soon, checking your approach against shared goals, circumstances and others’ feedback." },
  melancholic: { zh: "细致思量方向的读法：从观察、准备和比较中整理自己的偏好。区分有帮助的核对与迟迟难以行动，借具体例子理解这个古典名称，而非把它当成情绪诊断。", en: "Read considered reflection through observing, preparing and comparing. Distinguish useful checking from difficulty moving forward, using concrete examples to interpret the classical name rather than treating it as an emotional diagnosis." },
  phlegmatic: { zh: "稳定节奏方向的读法：观察熟悉安排、渐进投入与缓冲空间的选择。比较平稳节奏怎样支持持续参与，以及何时需要明确表达或调整计划，不把缓慢等同于消极。", en: "Explore steady pace through familiar arrangements, gradual involvement and room to adjust. Consider how an even rhythm supports participation and when clear expression or a changed plan is needed, without equating slowness with passivity." },
};

export function temperamentLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function temperamentCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("作答时间、完整免费、保存与重测", "作答时间、免费内容与重测")
      .replace("默认不保存；主动选择临时保存后，可在本标签页24小时内恢复。完成、退出清除或重测会删除草稿。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("默认不保存，答案仅在浏览器内计分。主动临时保存可在本标签页24小时内恢复，完成、退出清除或重测会删除。", "答案在浏览器内计分。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Timing, full free access, saving and retaking", "Timing, free access and retaking")
      .replace("Saving is off by default. Optional temporary saving permits restoration in this tab for 24 hours; completion, clearing on exit or retaking deletes the draft.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Saving is off by default and answers are scored in the browser. Optional temporary saving permits restoration in this tab for 24 hours; completion, clearing on exit or retaking deletes the draft.", "Answers are scored in your browser. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
