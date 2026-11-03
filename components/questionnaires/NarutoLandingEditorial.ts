import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "naruto": {
    "zh": "从重新开始一个小兴趣，看怎样邀请愿意的人一起试一段。比较共同起步、个人重点与合作安排，让参与者保留选择。",
    "en": "Explore inviting willing people to restart a small hobby. Compare a shared start, personal focus and arrangements while leaving participation a choice."
  },
  "sasuke": {
    "zh": "用一页收藏笔记，看看怎样为自选问题保留专注时间。完整例子比较重点、练习与参与安排，目标可以修改。",
    "en": "Explore focused time for a chosen question through a collection-note page. Compare focus, practice and participation while keeping aims revisable."
  },
  "sakura": {
    "zh": "从一个普通新词的例句，看练习怎样对应具体依据。通过核对与反例，比较修改样例、专注问题和调整步骤。",
    "en": "Explore practice against a reference through an ordinary new word’s sentence. Checks and counterexamples compare revising examples, focused questions and steps."
  },
  "kakashi": {
    "zh": "通过共享小册子的传递，说明谁愿意负责哪部分和怎样交接。比较角色衔接、共同邀请与责任范围，分工可以重新商量。",
    "en": "Clarify willing roles and handovers through a shared booklet. Compare coordination, invitations and responsibility limits, with room to renegotiate."
  },
  "shikamaru": {
    "zh": "当普通活动的时间缩短，先看实际条件和必要环节。用例子区分省去多余步骤、练习核对和直接起步。",
    "en": "When an ordinary activity becomes shorter, examine conditions and necessary parts. Compare removing extra steps, checking practice and starting immediately."
  },
  "hinata": {
    "zh": "从一次小分享，看怎样准备后清楚说明想参加哪一段。比较安静参与、自选专注和合作分工，也保留暂停的空间。",
    "en": "Explore preparing and stating your part in a small sharing session. Compare quiet participation, chosen focus and roles, with room to pause."
  },
  "gaara": {
    "zh": "从借用共享资料，看怎样说清同意、承担范围与归还条件。完整例子比较责任约定、角色衔接和愿意参加。",
    "en": "Explore agreement, responsibility limits and returning shared materials. Full examples compare bounded responsibility, handovers and willingness to join."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function narutoLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
