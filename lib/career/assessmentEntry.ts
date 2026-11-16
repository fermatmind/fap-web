import type { DisplayLocale } from "@/lib/i18n/locales";

export function careerAssessmentEntry(locale: DisplayLocale) {
  const href = locale === "en" ? "/en/career/assessment" : "/zh/career/assessment";
  if (locale === "en") {
    return {
      href,
      label: "Take the FermatMind Career Assessment · 94 questions",
      summary: "Explore your interests alongside your preferred ways of working and the conditions you value.",
    };
  }
  if (locale === "zh-TW") {
    return {
      href,
      label: "開始費馬職業測驗（94 題，簡體中文）",
      summary: "一起了解你感興趣的工作活動、偏好的工作方式和重視的工作條件。",
    };
  }
  return {
    href,
    label: "开始费马职业测试（94 题）",
    summary: "一起了解你感兴趣的工作活动、偏好的工作方式和看重的工作条件。",
  };
}
