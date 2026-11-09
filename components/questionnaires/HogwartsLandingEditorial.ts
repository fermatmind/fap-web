import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "gryffindor": {
    "zh": "勇于迈步：从面对犹豫、先作示范与可撤回的小尝试阅读本次选择，结合对话与反例理解开始行动的条件；不要求冒险，也不评现实勇气或领导力。",
    "en": "Stepping forward: read choices about hesitation, first examples and reversible trials through dialogue and counterexamples. Consider conditions for starting without requiring risk or assessing real courage or leadership."
  },
  "hufflepuff": {
    "zh": "公平与共同投入：回看参与方式、实际需要与工作分担，比较支持同伴和说明自己余量的具体做法；共享投入不等于无条件付出，计数不认证道德或忠诚。",
    "en": "Fairness and shared effort: revisit participation, actual needs and shared work, comparing support with stating your own capacity. Shared effort requires no unconditional giving, and counts certify neither morality nor loyalty."
  },
  "ravenclaw": {
    "zh": "理解与新想法：探索提问、原理和资料联系的优先选择，并与开始行动、共同投入及目标安排比较；喜欢弄懂问题不等于测得智力、学历或创造能力。",
    "en": "Understanding and ideas: explore priorities involving questions, principles and connections, alongside starting, shared effort and goals. Preferring to understand a problem does not measure intelligence, education or creative ability."
  },
  "slytherin": {
    "zh": "目标与资源安排：从路径选择、时间材料与必要取舍理解本次计数，阅读可调整目标的情境与对话；有计划不等于成功保证，也不以学院判断善恶或他人价值。",
    "en": "Goals and resources: interpret choices about routes, time, materials and tradeoffs through adjustable goals and dialogue. Planning guarantees no success, and a house determines neither goodness nor someone’s worth."
  }
};

export function hogwartsLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function hogwartsCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("直接开始、隐私、草稿与可选分享", "直接开始、隐私与可选分享")
      .replace("默认不保存答案；主动保存的草稿仅在当前标签页保留最多24小时，完成、退出清除或重测即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("浏览器内计分，答案不写进网址或分析事件，默认不保存。主动保存的草稿仅本标签页可恢复、最多24小时，完成、退出清除或重测即删除。", "答案在浏览器内计分，不写进网址或分析事件。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Direct start, privacy, drafts and optional sharing", "Direct start, privacy and optional sharing")
      .replace("Answers are not saved by default. An explicitly saved draft stays in the current tab for up to 24 hours and clears on completion, exit-and-clear or retake.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Answers are scored in your browser, enter neither URLs nor analytics and are not saved by default. Opt-in drafts can be resumed only in this tab for up to 24 hours and clear on completion, exit-and-clear or retake.", "Answers are scored in your browser and enter neither URLs nor analytics. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.");
}
