import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "callousness": {
    "zh": "忽略他人感受：核对已经表达的不适、困难和实际需要怎样进入你的行动。区分合理拒绝与未予考虑，阅读具体对话、反例和小尝试；不把均分解释为共情能力。",
    "en": "Disregarding feelings: check how expressed discomfort, difficulty and needs entered your actions. Distinguish a reasonable refusal from a failure to consider others, with dialogue, counterexamples and small experiments, without interpreting the mean as empathy ability."
  },
  "grandiosity": {
    "zh": "自我抬高与特殊待遇：回看贡献评价、共同规则和额外便利。用同一标准核对自己与他人，区分一般自信、合理需要和未经约定的特殊待遇；不据此诊断自恋。",
    "en": "Self-importance and special treatment: revisit contribution judgments, shared rules and extra privileges. Apply the same standard to yourself and others, distinguishing confidence and reasonable needs from unagreed privileges, without diagnosing narcissism."
  },
  "domineering": {
    "zh": "强行主导他人：关注共同安排或他人自身事务中是否保留表达和选择空间。通过分工、时间安排与不同意见的例子，区分授权职责和压过他人意愿。",
    "en": "Overriding others’ say: examine room for expression and choice in shared arrangements or another person’s affairs. Examples involving roles, scheduling and disagreement distinguish authorised responsibility from overriding someone’s wishes."
  },
  "manipulation": {
    "zh": "隐瞒与间接施压：核对决定所需条件、拒绝空间和前后说明。区分保留隐私、诚实说服与扣留重要信息或内疚施压；指南提供透明说明的具体表达。",
    "en": "Concealment and indirect pressure: check decision-relevant conditions, room to decline and consistent accounts. Distinguish privacy and honest persuasion from withheld information or guilt pressure, with practical wording for transparent explanations."
  },
  "suspiciousness": {
    "zh": "缺少依据的猜疑：分开记录已知事实、动机推测与其他解释。保留基于真实经历的谨慎，避免把尚未核实的想法当成定论；不以低分证明信任或安全。",
    "en": "Unsupported suspicion: separate known facts, inferred motives and alternative explanations. Retain caution grounded in real experience while checking unverified conclusions. A low score is not proof of trust or safety."
  },
  "aggression": {
    "zh": "攻击式回应：回看分歧中是否使用侮辱、威吓或故意伤人的话。区分愤怒、坚定拒绝和攻击表达，并用暂停、承认影响与重新讨论的例子核对后续行动。",
    "en": "Aggressive responses: revisit insults, intimidation or deliberately hurtful words in disagreements. Distinguish anger and firm refusal from verbal attacks, using examples of pauses, acknowledging effects and returning to a discussion."
  },
  "risk-taking": {
    "zh": "忽略行动风险：观察是否考虑可预见后果、已经约定的风险和代价承担者。区分有准备的尝试与将损失留给他人；不评定勇气、投资能力或一般冒险水平。",
    "en": "Disregarding action risks: examine foreseeable consequences, agreed risks and who bears costs. Distinguish a prepared experiment from leaving losses to others, without rating courage, investment skill or general risk appetite."
  }
};

export function frictionLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
