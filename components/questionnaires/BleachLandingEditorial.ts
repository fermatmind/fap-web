import type { QuestionnaireProfile } from "@/lib/questionnaires/types";

const summaries: Record<string, { en: string; zh: string }> = {
  "ichigo-kurosaki": { zh: "这一角色方向关注帮助的范围：愿意帮到哪里、需要什么帮助，以及何时结束。", en: "This character reading focuses on the limits of help: what to offer or ask for, and where it ends." },
  "rukia-kuchiki": { zh: "这一角色方向关注把做法说明白：用普通词语讲清步骤与做法。", en: "This character reading focuses on explaining a procedure in clear, plain steps." },
  "sosuke-aizen": { zh: "这一角色方向关注重看框架：检查最初的问题、分类依据和前提。", en: "This character reading focuses on revisiting the original question, grouping and assumptions." },
  "byakuya-kuchiki": { zh: "这一角色方向关注自选约定：说清接受的承诺、期限，以及可以重新商量的部分。", en: "This character reading focuses on chosen commitments, endpoints and room to renegotiate." },
  "orihime-inoue": { zh: "这一角色方向关注对方的意愿：先问需要怎样的回应，给选择和暂停留空间。", en: "This character reading focuses on asking what response someone wants and leaving room to choose or pause." },
  "kisuke-urahara": { zh: "这一角色方向关注小样试做：先想象或试做一个可以修改的小样。", en: "This character reading focuses on imagining or trying a small version that can be revised." },
  "kenpachi-zaraki": { zh: "这一角色方向关注有界小挑战：自定难度和目标，保留调整或停止的空间。", en: "This character reading focuses on a small chosen challenge, with room to adjust the difficulty or stop." },
};
/** Public previews describe each direction without assigning the reader a result. */
export function bleachLandingSummary(profile: QuestionnaireProfile, locale: "zh" | "en"): string {
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

/** Edition mappings, not inferences about a respondent's abilities or motives. */
const mappings: Record<string, { zh: string; en: string }> = {
  "ichigo-kurosaki": { zh: "说明帮助的范围，包括提供、请求或结束协助", en: "clarifying the scope of help, whether offering it, asking for it or ending an agreed part" },
  "rukia-kuchiki": { zh: "用清楚的顺序说明普通步骤与用法", en: "explaining ordinary steps and uses in a clear sequence" },
  "sosuke-aizen": { zh: "重新检查最初的问题、分类与前提", en: "reconsidering the starting question, categories or assumptions" },
  "byakuya-kuchiki": { zh: "澄清自愿接受或保留的约定及其范围", en: "clarifying the scope of commitments you choose to accept or keep" },
  "orihime-inoue": { zh: "给对方的意愿、参与和暂停留空间", en: "leaving room for another person’s wishes, participation or decision to pause" },
  "kisuke-urahara": { zh: "先想象或试做一个可以修改的小样", en: "imagining or trying a small version that can be revised" },
  "kenpachi-zaraki": { zh: "自选一个有边界的小点，保留停止空间", en: "choosing one bounded point to work on, with room to stop" },
};
export function bleachDirectionNote(id: string, locale: "zh" | "en"): string | undefined {
  return Object.hasOwn(mappings, id) ? mappings[id][locale] : undefined;
}

export const bleachExperienceFaq = [{
  question: { zh: "怎样查看这次结果的依据，并比较其他角色？", en: "How can I check this result and compare the other characters?" },
  answer: { zh: "先看每位最高角色下的题号、题目和你选中的原选项，再查看七位角色的全部选择次数。结果后的七角色对照可直接打开同语完整指南，无需重测；公开指南不包含你的答卷。", en: "Read the question number, scenario and original option you chose under each highest-count character, then compare all seven choice counts. The seven-character directory after the reveal links to full guides in this language, without retaking the quiz. Public guides do not contain your answers." },
}];

/** Current standalone entry behavior; accepted source FAQ bytes are preserved. */
export function bleachVisiblePrivacyAnswer(locale: "zh" | "en"): string {
  return locale === "zh"
    ? "浏览器内计数，答案不进入计分上传、网址或分析事件。当前答题页不提供进度保存，刷新页面或切换语言会从头开始。保存PNG只保存图片，不保存答卷。公开指南不含私人答案或次数，其他使用事件依隐私设置。"
    : "Counts are calculated in your browser; answers are not included in scoring uploads, URLs or analytics events. This question page does not save progress: refreshing it or changing language starts over. Saving a PNG saves the image, not your answers. Public guides contain no private answers or counts; other usage events follow your privacy settings.";
}

export function bleachCurrentEntryCopy(text: string, locale: "zh" | "en"): string {
  return locale === "zh"
    ? text.replace("默认不保存；主动保存后本标签页进度24小时失效，完成、重测或退出清除后删除。", "当前答题页不提供进度保存；刷新页面或切换语言会从头开始。保存PNG只保存图片，不保存答卷。")
    : text.replace("Progress is unsaved by default; opt-in tab progress expires after 24 hours and clears on completion, retake or explicit exit-and-clear.", "This question page does not save progress: refreshing it or changing language starts over. Saving a PNG saves the image, not your answers.");
}
