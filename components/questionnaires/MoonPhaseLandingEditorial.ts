import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

/** Entry summaries only; source-bound full reports remain unchanged. */
const summaries: Record<string, { zh: string; en: string }> = {
  "new-moon": {
    "zh": "先为一项小活动留出空间，说明此刻想在意什么。通过便条例子与反例，比较留白、尝试和暂停的不同用途。",
    "en": "Allow space to name what matters in a small activity. Note-based examples and counterexamples distinguish clarifying an intention from a trial or a pause."
  },
  "waxing-crescent": {
    "zh": "只试一小段，再决定是否继续。以一张小卡说明怎样让尝试可修改、可停止，并与明确取舍、局部调整相比较。",
    "en": "Try a small part before deciding whether to continue. A card example makes the trial revisable and optional, with comparisons to a tradeoff and a local adjustment."
  },
  "first-quarter": {
    "zh": "把两种可行做法放进当前条件，说清这次愿意接受的取舍。结合小卡场景，比较作出选择与先试一步的区别。",
    "en": "Place two workable approaches in current conditions and state the tradeoff you accept. A card scenario distinguishes choosing from trying a step first."
  },
  "waxing-gibbous": {
    "zh": "为现有草稿改一处具体细节，让它更合用。完整指南提供停止点、相邻主题比较和反例，不必把每处都改到完美。",
    "en": "Adjust one detail in a draft to fit this occasion. The full guide offers a stopping point, comparisons and counterexamples without requiring every part to become perfect."
  },
  "full-moon": {
    "zh": "收好自己愿意呈现的一小版，决定给谁看、展示到哪里。通过自用笔记的例子，比较呈现、分享经验与保留间隔。",
    "en": "Gather a small version and decide who may see it and how much to show. A personal-note example compares presentation with sharing experience and leaving an interval."
  },
  "waning-gibbous": {
    "zh": "把一条可用经验讲给确实想听的人，保留对方不采用的空间。阅读具体说法，区分自愿分享与替别人规定做法。",
    "en": "Offer a useful experience to someone who wants to hear it, leaving room to decline. Concrete wording distinguishes voluntary sharing from prescribing someone else’s approach."
  },
  "last-quarter": {
    "zh": "删去一项可选附加要求，保留更合适的范围。用具体例子区分自选负担与真实约定，再比较缩小范围和暂留空档。",
    "en": "Remove an optional extra to keep a suitable scope. Examples separate self-added burdens from actual agreements and compare reducing scope with leaving an interval."
  },
  "waning-crescent": {
    "zh": "为一次普通活动保留不必立即开始下一件事的空档。指南提供可用表达与反例，区分安静间隔、重新定意图和减少要求。",
    "en": "Leave an interval after an ordinary activity without immediately starting another. Wording and counterexamples distinguish a quiet gap from reframing an intention or removing a requirement."
  }
};

export function moonPhaseLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
