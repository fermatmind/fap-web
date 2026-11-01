import type { QuestionnaireProfile } from "../types";

const changes = {
  "pressure-during-disagreements": {
    en: ["Answers stay in page memory, without analytics or personal-result sharing.", "Answers stay in page memory without personal-result sharing. Ordinary page analytics remain disabled; separately opted-in anonymous answering-page counts contain no answers or result content."],
    zh: ["回答只留在页面内存，不接分析事件或个人结果分享。", "回答只留在页面内存，不提供个人结果分享。普通页面分析保持禁用；答题页另有自愿开启的匿名动作统计，不含答案或结果内容。"],
  },
  "responding-to-no-and-pauses": {
    en: ["The page stores no draft or result and offers no personal-result sharing or analytics.", "The page stores no draft or result and offers no personal-result sharing. Ordinary page analytics remain disabled; separately opted-in anonymous answering-page counts contain no answers or result content."],
    zh: ["页面不保存草稿或结果，不提供个人结果分享，也不接分析事件。", "页面不保存草稿或结果，不提供个人结果分享。普通页面分析保持禁用；答题页另有自愿开启的匿名动作统计，不含答案或结果内容。"],
  },
  "following-through-after-repair": {
    en: ["No draft, result, analytics or personal-result sharing is used.", "No draft, persisted result or personal-result sharing is used. Ordinary page analytics remain disabled; separately opted-in anonymous answering-page counts contain no answers or result content."],
    zh: ["页面不使用草稿保存、结果保存、分析事件或个人结果分享。", "页面不使用草稿保存、结果保存或个人结果分享。普通页面分析保持禁用；答题页另有自愿开启的匿名动作统计，不含答案或结果内容。"],
  },
} as const;

/** Current UI privacy facts; the frozen Mini manuscript and scoring input stay untouched. */
export function correctConflictReadingPrivacy(profile: QuestionnaireProfile): QuestionnaireProfile {
  if (!Object.hasOwn(changes, profile.id)) return profile;
  const change = changes[profile.id as keyof typeof changes];
  let changed = false;
  const sections = profile.sections.map(section => section.id !== `${profile.id}-limits` ? section : {
    ...section,
    paragraphs: section.paragraphs.map(paragraph => {
      const en = paragraph.en.replace(change.en[0], change.en[1]);
      const zh = paragraph.zh.replace(change.zh[0], change.zh[1]);
      if (en === paragraph.en && zh === paragraph.zh) return paragraph;
      changed = true;
      return { ...paragraph, en, zh };
    }),
  });
  return changed ? { ...profile, sections } : profile;
}
