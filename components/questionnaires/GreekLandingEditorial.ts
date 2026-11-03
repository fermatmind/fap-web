import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "zeus": {
    "zh": "共同安排与责任：比较自愿约定、分工与交接的选择，阅读如何说明范围和调整负担；协调不等于支配，计数不认证领导力或要求别人服从。",
    "en": "Shared arrangements and responsibility: compare choices about voluntary agreements, roles and handovers through scope and workload examples. Coordination is not dominance; counts certify no leadership or right to obedience."
  },
  "athena": {
    "zh": "比较路径与计划：从布置、资料与安排中的条件和取舍理解结果，结合对话与反例观察怎样作出选择；偏好比较不测智力，也不要求排除情绪和休息。",
    "en": "Routes and planning: interpret choices through conditions and tradeoffs in layouts, notes and arrangements, using dialogue and counterexamples. Preferring comparison measures no intelligence and need not exclude feelings or rest."
  },
  "apollo": {
    "zh": "节奏与创作表达：阅读声音、文字与小作品的偏好线索，比较表达与美感体验的区别；私人创作也成立，次数不代表天赋、作品质量或未来成就。",
    "en": "Rhythm and creative expression: explore sound, words and small creations, distinguishing expression from aesthetic experience. Private creation counts as an option; totals establish neither talent, work quality nor future achievement."
  },
  "aphrodite": {
    "zh": "美感与交流：观察色彩、材质、欢迎语与自愿互动的体验，结合具体例子核对；不以外貌、恋爱状态、性别或他人好感界定结果。",
    "en": "Aesthetics and connection: revisit colours, textures, welcoming words and voluntary interaction through concrete examples. Appearance, relationship status, gender and others’ liking do not define this result."
  },
  "ares": {
    "zh": "有边界的挑战：从一段可暂停的小练习理解当前选择，阅读开始、停止与调整的实例；不要求争斗、竞争、体能或忍耐疼痛。",
    "en": "A bounded challenge: read current choices through a small, pausable practice, with examples of starting, stopping and adjusting. No fighting, competition, fitness or endurance of pain is required."
  },
  "artemis": {
    "zh": "自主与自然观察：探索自选角度、节奏与日常细节，可以在室内并接受帮助；自主不等于必须独处，计数也不规定信仰或关系身份。",
    "en": "Autonomy and observation: explore a chosen focus, pace and everyday details, including indoors and with help. Autonomy requires no solitude, and counts prescribe neither religious nor relationship identity."
  }
};

export function greekLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
