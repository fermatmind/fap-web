import content from "./project-management.json";
import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection } from "../types";

export function projectManagementResultProfile(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(content, profile.id)) return profile;
  const additions = (content as Record<string, QuestionnaireSection[]>)[profile.id];
  return { ...profile, sections: [...profile.sections, ...additions] };
}

const explanationCorrections: Record<string, { from: { en: string; zh: string }; to: { en: string; zh: string } }> = {
  "PROJECT_01": {
    "from": {
      "en": "The rule names two deliverables. The first package supplies both; an attractive substitute is not an agreed replacement.",
      "zh": "规则点名两项交付物，首项包同时具备；好看的替代品不自动成为约定替代。"
    },
    "to": {
      "en": "The rule names two deliverables. The matching package supplies both; an attractive substitute is not an agreed replacement.",
      "zh": "规则点名两项交付物，匹配的包同时具备；好看的替代品不自动成为约定替代。"
    }
  },
  "PROJECT_08": {
    "from": {
      "en": "The first note identifies who checks and a concrete threshold. It does not prove the chosen threshold is optimal outside this fictional plan.",
      "zh": "首项有监测人和具体阈值，不证明该阈值在虚构计划之外最优。"
    },
    "to": {
      "en": "The note naming Imani and the threshold identifies who checks and a concrete threshold. It does not prove the chosen threshold is optimal outside this fictional plan.",
      "zh": "指定Imani和阈值的记录有监测人和具体阈值，不证明该阈值在虚构计划之外最优。"
    }
  },
  "PROJECT_09": {
    "from": {
      "en": "The first choice matches all four declared fields. A communication plan should be applied to the case’s actual needs, not used to require unnecessary reports everywhere.",
      "zh": "首项匹配四个题定字段，沟通计划应服务实际需求，不应变成到处强制无用报告。"
    },
    "to": {
      "en": "The weekly email containing the count matches all four declared fields. A communication plan should be applied to the case’s actual needs, not used to require unnecessary reports everywhere.",
      "zh": "每周邮件发送计数匹配四个题定字段，沟通计划应服务实际需求，不应变成到处强制无用报告。"
    }
  },
  "PROJECT_14": {
    "from": {
      "en": "All required fields are present only in the first record. Presence of fields is not proof that the decision was wise or that its owner had unstated authority.",
      "zh": "只有首项具备所有必填字段；字段齐全不证明决策明智，也不凭空赋予权限。"
    },
    "to": {
      "en": "All required fields are present in the record naming Cedar, Esi and 12 May. Presence of fields is not proof that the decision was wise or that its owner had unstated authority.",
      "zh": "方案Cedar、决策人Esi、5月12日的记录具备所有必填字段；字段齐全不证明决策明智，也不凭空赋予权限。"
    }
  },
  "PROJECT_24": {
    "from": {
      "en": "The first clarification connects information to the named decision. The case does not equate less reporting with better communication in every project.",
      "zh": "首项把信息连到指定决策，本题不把少写报告普遍等同于沟通更好。"
    },
    "to": {
      "en": "The question about trial outcomes and constraints connects information to the named decision. The case does not equate less reporting with better communication in every project.",
      "zh": "询问试验结果与限制把信息连到指定决策，本题不把少写报告普遍等同于沟通更好。"
    }
  },
  "PROJECT_26": {
    "from": {
      "en": "The first choice matches the declared inclusion and exclusion. Whether a photo package would be valuable is a separate change decision.",
      "zh": "首项匹配题定包含与排除，照片包有无价值属于另一变更决策。"
    },
    "to": {
      "en": "The agreed text-only directory matches the declared inclusion and exclusion. Whether a photo package would be valuable is a separate change decision.",
      "zh": "约定的纯文字目录匹配题定包含与排除，照片包有无价值属于另一变更决策。"
    }
  },
  "PROJECT_29": {
    "from": {
      "en": "Only the first option respects both the permitted content and exclusions. Use fictional records here; this is a supplied policy exercise, not a statement of legal compliance.",
      "zh": "只有首项同时服从允许内容与排除项。本题用虚构记录，只练给定政策，不判定法律合规。"
    },
    "to": {
      "en": "Only the summary without names or personal contact details respects both the permitted content and exclusions. Use fictional records here; this is a supplied policy exercise, not a statement of legal compliance.",
      "zh": "只有不含姓名及私人联系方式的摘要同时服从允许内容与排除项。本题用虚构记录，只练给定政策，不判定法律合规。"
    }
  }
};

/** Remove stale option-position references from reviewed explanations only. */
export function projectManagementResultQuestions(questions: Questionnaire["questions"]): Questionnaire["questions"] {
  let changed = false;
  const prepared = questions.map(question => {
    if (!Object.hasOwn(explanationCorrections, question.id)) return question;
    const correction = explanationCorrections[question.id];
    if (question.explanation?.en !== correction.from.en || question.explanation?.zh !== correction.from.zh) return question;
    changed = true;
    return { ...question, explanation: { ...correction.to } };
  });
  return changed ? prepared : questions;
}
