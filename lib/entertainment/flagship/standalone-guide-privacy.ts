import type { DisplayLocale } from "@/lib/i18n/locales";

const phrase = {
  en: /Optional drafts (?:live|stay) in this tab for up to (?:24|twenty-four) hours and clear on completion or retake[.;]\s*/u,
  zh: /主动保存的草稿在本标签页最多24小时，完成或重测(?:即)?清除[；。，]/u,
  "zh-TW": /主動儲存的草稿在本標籤頁最多(?:24|二十四)小時，完成或重測(?:即)?清除[；。，]/u,
};

// The current take page keeps answers only in memory. Preserve the remaining scoring and sharing text.
export function currentStandaloneGuidePrivacy(paragraph: string, locale: DisplayLocale) {
  const updated = paragraph.replace(phrase[locale], locale === "en" ? "Answers stay on this page. " : locale === "zh" ? "答案仅保留在当前页面。" : "答案只留在目前頁面。");
  return locale === "en" ? updated.replace("Answers stay on this page. sharing", "Answers stay on this page. Sharing") : updated;
}
