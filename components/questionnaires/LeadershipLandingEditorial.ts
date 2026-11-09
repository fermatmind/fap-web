import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  autocratic: {
    zh: "回看由带领者确定方向、分工与修正步骤的选择。核对权限、信息与反馈怎样衔接，比较明确决策和压缩成员意见的区别；次数不证明效率或领导能力。",
    en: "Review choices in which the leader sets direction, roles and corrective steps. Examine authority, information and feedback, distinguishing clear decisions from excluding members’ input; the count establishes neither efficiency nor leadership ability.",
  },
  democratic: {
    zh: "理解成员参与比较方案、形成下一步的做法。讨论哪些人应参与、怎样决定、何时结束讨论以及由谁负责，区分共同参与与无限等待一致意见。",
    en: "Explore involving members in comparing proposals and forming a next step. Ask who participates, how a decision is reached, when discussion ends and who remains accountable, distinguishing participation from waiting indefinitely for unanimity.",
  },
  "laissez-faire": {
    zh: "比较少主动介入与成员自主处理的情境。逐项核对权限、资源、求助与回看安排，区分有支持的授权和缺少协调；不把低介入直接当成信任或成熟。",
    en: "Compare limited proactive involvement with members handling work themselves. Check authority, resources, help routes and review arrangements to distinguish supported delegation from missing coordination; low involvement alone establishes neither trust nor maturity.",
  },
  transformational: {
    zh: "回看方向意义、检验假设、成员发展与责任示范的选择。把愿景落实到可验证的小行动，比较启发与具体支持的关系；不由次数推定魅力、创新绩效或MLQ分量表。",
    en: "Review choices involving purpose, testing assumptions, member development and modelling responsibility. Turn direction into a testable small action and connect inspiration with practical support; counts establish neither charisma, innovation outcomes nor MLQ subscales.",
  },
};

export function leadershipLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function leadershipCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("答案在浏览器中计分；主动保存才保留本标签页24小时草稿，完成、清除或重测即删除。", "答案在浏览器中计分。这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("可选保存仅保留本标签页24小时草稿，完成、清除或重测即删除；", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
    : text
      .replace("Answers are scored in the browser; only explicit saving creates a 24-hour draft in this tab, cleared on completion, clearing or retake.", "Answers are scored in the browser. This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Optional saving retains a 24-hour tab draft, cleared on completion, clearing or retake; sharing", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over. Sharing");
}
