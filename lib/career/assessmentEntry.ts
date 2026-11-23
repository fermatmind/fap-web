import type { DisplayLocale } from "@/lib/i18n/locales";

export const CAREER_ASSESSMENT_LANDING_PATH = "/tests/career-planning-and-work-style-test";

export function careerAssessmentEntry(locale: DisplayLocale) {
  const href = `/${locale}${CAREER_ASSESSMENT_LANDING_PATH}`;
  if (locale === "en") {
    return {
      href,
      label: "Take the free FermatMind Career Assessment · 94 questions",
      summary: "What kind of work would you want to keep doing? Explore your interests, working preferences and priorities to narrow down your next direction.",
    };
  }
  if (locale === "zh-TW") {
    return {
      href,
      label: "開始費馬職業測驗（94 題）",
      summary: "選科系、找工作或想轉職？從你願意反覆做的事出發，找出值得探索的職涯方向。",
    };
  }
  return {
    href,
    label: "开始费马职业测试（94 题） · 免费测试",
    summary: "选专业、找工作，还是想转行？从你愿意反复做的事出发，找出值得探索的职业方向。",
  };
}
