import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire, QuestionnaireAnswers } from "./types";

/** Editorial craft motifs, not official Chapter insignia or additional results. */
export const chapterHobbyLenses = {
  ultramarines: { color: "#2563eb", zh: "共同计划", en: "Shared plan", mark: "plan" },
  "imperial-fists": { color: "#a16207", zh: "稳固底座", en: "Steady base", mark: "base" },
  "iron-hands": { color: "#475569", zh: "接合试验", en: "Connection trial", mark: "joint" },
  salamanders: { color: "#15803d", zh: "手作纹理", en: "Handmade texture", mark: "texture" },
  "raven-guard": { color: "#6d28d9", zh: "可见细节", en: "Visible detail", mark: "detail" },
  "white-scars": { color: "#be123c", zh: "另一条路线", en: "Another route", mark: "route" },
} as const;

export type ChapterId = keyof typeof chapterHobbyLenses;
export function chapterHobbyLens(id: string) {
  return Object.hasOwn(chapterHobbyLenses, id) ? chapterHobbyLenses[id as ChapterId] : undefined;
}
export function chapterShareCardPath(locale: Locale, id: string, version: string) {
  return `/og/fun/space-marine-chapter?locale=${locale}&portrait=${encodeURIComponent(id)}&v=${encodeURIComponent(version)}-studio`;
}

export function chapterPortraitPath(id: string) {
  return chapterHobbyLens(id) ? `/images/quiz-portraits/space-marine-chapter/${id}-studio.webp` : undefined;
}

/** References to this attempt's selected source items, never inferred personality reasons. */
export function chapterChoiceReasons(quiz: Questionnaire, id: string, answers?: QuestionnaireAnswers) {
  if (!answers || !chapterHobbyLens(id)) return [];
  return quiz.questions.flatMap((question, index) => {
    const option = question.options.find(item => item.id === answers[question.id] && item.directionId === id);
    return option ? [{ number: index + 1, question, option }] : [];
  }).slice(0, 2);
}

export const chapterScope = {
  zh: "这18题比较纸模型展示中的参与偏好：计划、支撑、接合、细作、观察与路线。六个战团名称为这些原创爱好视角提供同人背景；结果不判断你最像哪支战团的人格、官方归属或配军选择。人物插画是原创创作情境，不是官方角色或徽章。",
  en: "These eighteen items compare preferences within a paper-model display: planning, support, connections, craft, observation and routes. Six Chapter names frame these original fan hobby lenses. The result does not determine your closest Chapter personality, official membership or army choice. The original illustrations depict imagined creative scenes, not official characters or insignia.",
};
