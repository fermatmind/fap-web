import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

export const peoplePleaserSummaries: Record<string, { zh: string; en: string }> = {
  "needs": {
    "zh": "搁置自身需要：阅读四条关于忘记、难以表达或帮助别人时忽视需要的回答。结合具体经历区分一次有意让步与长期没有表达空间；附对话、反例和可选观察，不由均分判断善良或自私。",
    "en": "Setting aside own needs: read four items about forgetting, struggling to voice or neglecting needs while helping. Distinguish an intentional compromise from limited room for expression through actual examples, dialogue and optional observations, without judging kindness or selfishness."
  },
  "responsibility": {
    "zh": "照顾他人的责任感：分别看关心愿望、已有职责、可用资源与共同分工。较高认同并不自动表示照顾过度；指南用具体安排区分负责行动和承担全部结果，也保留合理照顾的反例。",
    "en": "Felt responsibility for others: consider a wish to care, existing duties, resources and shared roles. High endorsement does not automatically mean excessive care. The guide distinguishes responsible actions from control over outcomes and includes counterexamples of workable care."
  },
  "expectations": {
    "zh": "迎合他人的期望：回看满足期待、取悦冲动与拒绝请求的困难。通过澄清任务、核对余量和约定回复时间的例子，观察是否有真实选择；不要求一律拒绝或给关系贴标签。",
    "en": "Orientation to others’ expectations: revisit meeting expectations, the urge to please and difficulty refusing. Examples of clarifying a task, checking capacity and agreeing on reply times help explore available choices without prescribing refusal or labelling a relationship."
  }
};

export function peoplePleaserLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return peoplePleaserSummaries[profile.id]?.[locale] ?? profile.summary[locale];
}

export function peoplePleaserCurrentEntryCopy(text: string, locale: "zh" | "en") {
  return locale === "zh"
    ? text
      .replace("免费完整结果与自愿保存", "免费完整结果与隐私")
      .replace("点击开始直接进入题目，保存草稿不是条件。", "点击开始直接进入题目。")
      .replace("点击开始直接进入题目，保存草稿另行自愿选择，不必先勾选同意保存。", "点击开始直接进入题目。")
      .replace("主动保存才留本标签页24小时草稿，完成、重测或清除即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("主动保存的草稿在本标签页24小时内可恢复，完成、重测或清除即删除。", "这份测试不保存答题进度。刷新、切换语言或离开测试后，需要重新开始。")
      .replace("答案会上传吗？保存和分享包含什么？", "答案会上传或保存吗？分享包含什么？")
    : text
      .replace("Full free results and optional saving", "Full free results and privacy")
      .replace("Start opens the questions directly; saving a draft is not a condition.", "Start opens the questions directly.")
      .replace("Start opens questions directly; saving a draft is a separate optional choice, without an agreement-to-save prerequisite.", "Start opens the questions directly.")
      .replace("Opting in keeps a 24-hour draft in this tab, deleted on completion, retake or clearing.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("An optional tab draft can be restored within 24 hours and is deleted on completion, retake or clearing.", "This quiz does not save your progress. If you refresh, switch languages or leave the quiz, you will need to start over.")
      .replace("Are answers uploaded, and what do saving and sharing contain?", "Are answers uploaded or saved, and what does sharing include?");
}
