import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { zh: string; en: string }> = {
  sanguine: { zh: "活跃参与方向的读法：从新活动、交流与共同体验的选择，观察自己怎样进入一个场景。比较参与带来的新机会与后续投入，结合需要安静准备的反例阅读。", en: "Explore open engagement through choices about activities, conversation and shared experiences. Compare the opportunities participation creates with the follow-through it needs, including occasions when quiet preparation works better." },
  choleric: { zh: "目标推进方向的读法：回看确定下一步、作出决定与推动行动的选择。区分及时启动与过早定案，用共同目标、现实条件和对方反馈核对推进方式。", en: "Examine directed action through decisions, next steps and getting started. Distinguish timely initiative from deciding too soon, checking your approach against shared goals, circumstances and others’ feedback." },
  melancholic: { zh: "细致思量方向的读法：从观察、准备和比较中整理自己的偏好。区分有帮助的核对与迟迟难以行动，借具体例子理解这个古典名称，而非把它当成情绪诊断。", en: "Read considered reflection through observing, preparing and comparing. Distinguish useful checking from difficulty moving forward, using concrete examples to interpret the classical name rather than treating it as an emotional diagnosis." },
  phlegmatic: { zh: "稳定节奏方向的读法：观察熟悉安排、渐进投入与缓冲空间的选择。比较平稳节奏怎样支持持续参与，以及何时需要明确表达或调整计划，不把缓慢等同于消极。", en: "Explore steady pace through familiar arrangements, gradual involvement and room to adjust. Consider how an even rhythm supports participation and when clear expression or a changed plan is needed, without equating slowness with passivity." },
};

export function temperamentLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en") {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
