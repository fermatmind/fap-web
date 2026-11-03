import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  "perfectionist": {
    "zh": "额外标准：核对必要要求已经满足后，新增标准、细节润色与等待理想准备是否伴随推迟。区分必要检查和可以稍后修改的内容，用初版、反例与小步骤阅读结果；不要求降低安全或合规标准。",
    "en": "Extra standards: check delays alongside added requirements, polishing or ideal preparation after essential requirements are met. Distinguish necessary checks from later revisions through first drafts, counterexamples and small steps, without reducing safety or compliance standards."
  },
  "dreamer": {
    "zh": "想法停留：回看已有可做步骤，却继续扩展构想或想象完成结果的经历。把必要规划与迟迟没有开始分开，试着明确一次可见操作；不由分数判断创造力、智力或执行能力。",
    "en": "Staying with ideas: revisit expanding or imagining after a workable action exists. Separate necessary planning from an unstarted step and define one observable action, without judging creativity, intelligence or execution ability from a score."
  },
  "worrier": {
    "zh": "担忧推迟：观察安全、条件已齐的普通任务中，担心结果与错过原定开始的情境。区分现实风险、还缺的信息和可以先做的部分；不评勇气，也不诊断焦虑或要求无视危险。",
    "en": "Worry before starting: examine worry alongside missing an intended start on an ordinary safe task with conditions available. Separate actual risk, missing information and a feasible step, without rating courage, diagnosing anxiety or disregarding danger."
  },
  "defier": {
    "zh": "抗拒要求：回看已接受任务中的不满、被催促感与推迟如何同时出现。通过直接说明、调整范围和拒绝的例子核对选择空间，不把合理边界解释成叛逆，也不要求服从不合理安排。",
    "en": "Resistance to requests: revisit dissatisfaction, prompts and delay around accepted tasks. Examples of clarification, revised scope and refusal examine choice, without treating reasonable boundaries as rebelliousness or requiring unreasonable compliance."
  },
  "crisis-maker": {
    "zh": "临期启动：核对本有准备时间却等到期限接近才动手的经历。查看提前检查点、返工与意外余量的取舍；它不证明压力下效率更高，也不要求制造危机来开工。",
    "en": "Waiting for urgency: examine unused preparation time before starting near a deadline. Consider earlier checkpoints, revision and interruption capacity, without claiming better pressure performance or manufacturing a crisis to begin."
  },
  "over-doer": {
    "zh": "承诺拥挤：观察可拒绝的额外请求、安排超过余量和来回切换与推迟的关系。区分可协商承诺和无法控制的负担，先核对时间与范围；不把照护、勤奋或忙碌本身当作缺点。",
    "en": "Crowded commitments: examine optional requests, plans beyond capacity and switching alongside delay. Distinguish negotiable commitments from uncontrollable burdens and check time and scope, without treating care, diligence or busyness itself as a flaw."
  }
};

export function procrastinationLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
