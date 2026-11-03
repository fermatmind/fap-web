import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "bojack-horseman": {
    "zh": "怎样把一件个人小经历讲出来，并说明玩笑背后实际在意什么？用作品开场与反例，比较反讽、直接表达和文字澄清。",
    "en": "How can a small personal experience be told while naming what matters behind a joke? A project introduction and counterexamples compare irony, direct expression and written clarity."
  },
  "diane-nguyen": {
    "zh": "先问一句话希望传达什么，再把语境写清。通过小刊说明、可用表达和四角色比较，观察澄清是否帮助彼此理解。",
    "en": "Ask what a statement should convey, then make its context clear. Zine notes, wording and four-character comparisons explore whether clarification helps mutual understanding."
  },
  "princess-carolyn": {
    "zh": "把参与者、愿意承担的范围与具体交接约定放到一起。用兴趣项目说明怎样协调，也保留修改安排与停止多承担的空间。",
    "en": "Bring participants, willing responsibilities and handover agreements together. A hobby project explores coordination while leaving room to revise arrangements and limit extra duties."
  },
  "todd-chavez": {
    "zh": "把两个普通想法放在一起，和愿意参与的人试一小段。完整例子区分新组合、确认约定与热情邀请，尝试可以随时修改。",
    "en": "Combine two ordinary ideas and try a little with willing participants. Full examples distinguish new combinations, agreements and invitations, with room to revise the trial."
  },
  "mr-peanutbutter": {
    "zh": "让一件普通小事成为大家愿意共享的体验。通过邀请与共同翻阅的场景，练习表达热情，同时听见不同意愿。",
    "en": "Turn an ordinary small activity into an experience people want to share. Invitations and a shared look at a creation explore enthusiasm alongside differing wishes."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function bojackLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
