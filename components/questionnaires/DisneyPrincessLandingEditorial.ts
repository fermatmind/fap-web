import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "snow-white": {
    "zh": "通过共同布置小角落，看怎样给愿意的人留位置。比较欢迎、个人选择与具体约定，让加入保持轻松和自愿。",
    "en": "Explore room for willing participation through arranging a small corner. Compare welcome, personal choice and agreements that keep joining voluntary."
  },
  "cinderella": {
    "zh": "从个人小收藏的一页空白，理解希望保留什么。用例子区分珍惜愿望、安排步骤与等待外部条件。",
    "en": "Explore a hope you want to keep through a blank collection page. Examples distinguish cherishing a wish, planning a step and waiting for conditions."
  },
  "aurora": {
    "zh": "从一件私人摆设展开安静想象。完整例子比较心中画面、实际表达和行动安排，保留构思自己的节奏。",
    "en": "Explore quiet imagery through a personal arrangement. Compare imagined scenes, expression and planned action while keeping your own pace."
  },
  "ariel": {
    "zh": "用一份普通小册子里的陌生题目，看看好奇从哪里开始。比较接触新对象、追问意思与选择尝试的条件。",
    "en": "Find where curiosity begins through an unfamiliar booklet topic. Compare encountering something new, asking about meaning and choosing conditions for a trial."
  },
  "belle": {
    "zh": "从一段普通说明看怎样读懂具体意思和依据。通过提问与反例，比较阅读、探索和自己的解释。",
    "en": "Explore meaning and support in an ordinary passage. Questions and counterexamples compare reading, exploration and your interpretation."
  },
  "jasmine": {
    "zh": "从共同安排的一项选择，说清自己的意愿并听见不同意见。用完整情境比较表达偏好、自选方法和合作约定。",
    "en": "State a preference and hear differing views in a shared arrangement. Compare expressing a choice, keeping a method and making agreements."
  },
  "pocahontas": {
    "zh": "从一次允许停留的普通景物，留意细节怎样相连。对照动画读法与真实历史资料，比较环境观察和路径选择。",
    "en": "Notice connected details at an ordinary permitted stop. Distinguish an animated reading from actual historical sources while comparing surroundings and routes."
  },
  "mulan": {
    "zh": "当一件小合作的条件变化，看看可以怎样调整做法。通过具体例子比较灵活回应、既定步骤和重新约定。",
    "en": "Explore adapting when conditions change in a small collaboration. Examples compare flexible responses, planned steps and revised agreements."
  },
  "tiana": {
    "zh": "用一张自用小卡，把一个有限的自选目标拆成下一步。比较愿望、可行步骤与调整条件，保留暂停的空间。",
    "en": "Use a personal card to choose one step for a limited aim. Compare hope, feasible action and changing conditions, with room to pause."
  },
  "rapunzel": {
    "zh": "在私人笔记的一页试试线条、文字或排列。完整例子比较表达形式、安静构思和接触新事物。",
    "en": "Try lines, words or arrangement on a notes page. Full examples compare forms of expression, quiet imagining and encountering something new."
  },
  "merida": {
    "zh": "从一张自用小海报，看怎样保留自己选的方法。比较个人表达、常见做法和现实限制，给修改留空间。",
    "en": "Explore a chosen method through a personal poster. Compare expression, conventions and actual limits while leaving room for revision."
  },
  "moana": {
    "zh": "从一次自选短途出门，把路径和在意之处放到一起。通过例子比较探索、方向与共同事项。",
    "en": "Connect a route with what matters in a chosen short outing. Examples compare exploration, direction and shared concerns."
  },
  "raya": {
    "zh": "从一件小合作的范围、信息与交接，看怎样建立明确约定。比较欢迎参与、调整做法和逐步合作。",
    "en": "Explore clear agreements through a small collaboration’s scope, information and handover. Compare welcome, adaptation and gradual cooperation."
  }
};

/** Entry summaries only; source-bound full reports remain unchanged. */
export function disneyPrincessLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
