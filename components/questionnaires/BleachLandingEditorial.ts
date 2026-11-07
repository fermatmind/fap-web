import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { en: string; zh: string }> = {
  "ichigo-kurosaki": { zh: "这一角色方向关注帮助的范围：愿意帮到哪里、需要什么帮助，以及何时结束。", en: "This character reading focuses on the limits of help: what to offer or ask for, and where it ends." },
  "rukia-kuchiki": { zh: "这一角色方向关注把做法说明白：用普通词语讲清步骤，再根据反馈调整。", en: "This character reading focuses on explaining a procedure in plain steps and adjusting to feedback." },
  "sosuke-aizen": { zh: "这一角色方向关注重看框架：检查最初的问题、分类依据和前提。", en: "This character reading focuses on revisiting the original question, grouping and assumptions." },
  "byakuya-kuchiki": { zh: "这一角色方向关注自选约定：说清接受的承诺、期限，以及可以重新商量的部分。", en: "This character reading focuses on chosen commitments, endpoints and room to renegotiate." },
  "orihime-inoue": { zh: "这一角色方向关注对方的意愿：先问需要怎样的回应，给选择和暂停留空间。", en: "This character reading focuses on asking what response someone wants and leaving room to choose or pause." },
  "kisuke-urahara": { zh: "这一角色方向关注小样试做：先做一个能修改的版本，再用反馈决定下一步。", en: "This character reading focuses on a small revisable prototype and feedback for the next step." },
  "kenpachi-zaraki": { zh: "这一角色方向关注有界小挑战：自定难度和目标，保留调整或停止的空间。", en: "This character reading focuses on a small chosen challenge, with room to adjust the difficulty or stop." },
};
/** Public previews describe each direction without assigning the reader a result. */
export function bleachLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}
