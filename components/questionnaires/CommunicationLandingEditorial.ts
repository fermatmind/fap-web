import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  assertive: {
    zh: "比较清楚表达、坚定拒绝与允许对方解释怎样同时成立。通过临时任务、反馈和约定调整，练习保留边界并核对下一步；清楚表达不保证对方同意。",
    en: "Explore how clear expression, firm refusal and room for another person’s explanation can coexist. Use extra tasks, feedback and changed arrangements to practise boundaries and a shared next step; clarity does not guarantee agreement.",
  },
  passive: {
    zh: "回看想说出需要却压下、或不愿意仍先答应的情境。区分没有表达与自愿让步、倾听、隐私和暂缓，尝试用一句具体限制替代勉强附和。",
    en: "Review holding back a need you wanted to raise or agreeing despite reluctance. Distinguish withheld expression from voluntary compromise, listening, privacy and postponement, and try naming one concrete limit instead of reluctant agreement.",
  },
  aggressive: {
    zh: "辨别贬低、打断和整体责怪怎样挤压对话空间。把对人的判断改为对具体事件的说明，保留明确立场；不将坚定、直接或生气自动视为攻击。",
    en: "Examine how put-downs, interruptions and global blame restrict dialogue. Replace a judgment about a person with a description of a specific event while keeping a clear position; firmness, directness and anger are not automatically aggression.",
  },
  "passive-aggressive": {
    zh: "整理口头答应却有意拖延、或用带刺回应传递未说出的反对。尝试直接说明不愿接受的部分；他人的迟回、沉默或失误不能由此推定为有意抗拒。",
    en: "Examine saying yes while intentionally delaying or using pointed remarks to convey an unstated objection. Try naming the part you do not accept; someone else’s late reply, silence or mistake does not establish intentional resistance.",
  },
};

export function communicationLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function communicationCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("主动保存的草稿仅在本标签页保留24小时，完成、清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("默认不保存答案；主动保存后仅保留本标签页24小时草稿，完成、重测或清除即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("分享只包含测试名称与公开入口，不附答案、均分或私人对话。", "分享链接打开公开测试，不附答案、均分或私人对话。")
    : text
      .replace("An explicitly saved draft lasts 24 hours in this tab and clears on completion, clearing or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Answers are not saved by default. Explicit saving creates a 24-hour draft in this tab, cleared on completion, retake or clearing.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Sharing includes only the test name and public entry, not answers, means or private conversations.", "The share link opens the public test without answers, means or private conversations.");
}
