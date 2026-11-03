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
