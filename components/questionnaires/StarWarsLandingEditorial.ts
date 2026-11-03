import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "han-solo": {
    "zh": "做一张普通小卡时，看看手边材料能组合出什么办法。比较现有资源、自选步骤与持续安排，允许够用的方案再修改。",
    "en": "Explore what available materials can do for an ordinary card. Compare resources, chosen steps and continued arrangements, with room to revise an adequate solution."
  },
  "palpatine": {
    "zh": "从一本私人记录本，说明安排如果继续准备怎样运行。比较持续条件、共同意见与眼前步骤，保留重新评估和停止空间。",
    "en": "Describe how a personal notebook arrangement would continue. Compare ongoing conditions, shared views and present steps, with room to reassess or stop."
  },
  "darth-vader": {
    "zh": "为普通兴趣选一个明确步骤，暂时只关注这一部分。比较专注对象、学习起步与现有办法，步骤和目标均可调整。",
    "en": "Choose one defined step in an ordinary interest and attend to that part. Compare focus, learning and available means, with room to adjust the step and aim."
  },
  "leia-organa": {
    "zh": "和愿意参加的朋友安排活动时，表达自己的意见并听取他人意愿。比较共同讨论、持续安排与自选步骤，分歧可以再谈。",
    "en": "Express your view and hear others’ wishes in a voluntary activity. Compare shared discussion, ongoing arrangements and chosen steps, with room to revisit disagreement."
  },
  "obi-wan-kenobi": {
    "zh": "对方需要时，分享一次具体做法和当时的条件。比较经验例子、学习起步与假设检查，让建议保留不被采用的空间。",
    "en": "Offer a concrete experience and its conditions when wanted. Compare examples, learning steps and assumptions, leaving the other person free not to use the advice."
  },
  "luke-skywalker": {
    "zh": "为一个普通新兴趣迈出自己愿意学的一小步。比较学习目标、先用现有办法与停下提问，再看实际练习反馈。",
    "en": "Take a chosen learning step in an ordinary new interest. Compare learning aims, available means and pausing to question, then check practice feedback."
  },
  "yoda": {
    "zh": "开始普通小活动前，问问最初假设是否仍适用。比较重新提问、具体经验与学习起步，也保留直接试一次的可能。",
    "en": "Before an ordinary activity, ask whether an initial assumption still applies. Compare questioning, experience and learning, with room to try a step directly."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function starWarsLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
