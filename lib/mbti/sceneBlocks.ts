import type { DisplayLocale } from "@/lib/i18n/locales";

export type MbtiSceneBlock = {
  key: string;
  title: string;
  body: string;
  href: string;
};

export function buildDefaultMbtiSceneBlocks(locale: DisplayLocale): MbtiSceneBlock[] {
  const isZh = locale === "zh";
  const withLocale = (pathname: string) => `/${locale}${pathname}`;

  return [
    {
      key: "career_direction",
      title: locale === "zh-TW" ? "職涯方向" : isZh ? "职业方向" : "Career direction",
      body: locale === "zh-TW" ? "先查看合適的職位與職涯路徑，再決定下一步行動。" : isZh
        ? "先看适配岗位与职业路径，再决定下一步行动。"
        : "Use role fit and career paths to choose your next move.",
      href: withLocale("/career/recommendations"),
    },
    {
      key: "major_choice",
      title: locale === "zh-TW" ? "科系選擇" : isZh ? "专业选择" : "Major selection",
      body: locale === "zh-TW" ? "從 MBTI 專題開始，整理選擇科系與探索方向的考量。" : isZh
        ? "从 MBTI 主题页进入，快速建立专业与方向判断框架。"
        : "Start from the MBTI topic hub to frame major and direction decisions.",
      href: withLocale("/topics/mbti"),
    },
    {
      key: "team_collaboration",
      title: locale === "zh-TW" ? "團隊協作" : isZh ? "团队协作" : "Team collaboration",
      body: locale === "zh-TW" ? "查看類型解讀，了解協作偏好與溝通方式的差異。" : isZh
        ? "查看类型画像，理解协作偏好与沟通方式差异。"
        : "Review type profiles to understand collaboration and communication patterns.",
      href: withLocale("/personality"),
    },
    {
      key: "relationship_patterns",
      title: locale === "zh-TW" ? "人際相處" : isZh ? "关系相处" : "Relationship patterns",
      body: locale === "zh-TW" ? "參考人格類型與專題內容，觀察相處時反覆出現的摩擦。" : isZh
        ? "通过人格类型与主题内容，识别关系中的稳定摩擦点。"
        : "Use personality and topic content to identify relationship friction patterns.",
      href: withLocale("/topics/mbti"),
    },
    {
      key: "growth_plan",
      title: locale === "zh-TW" ? "成長建議" : isZh ? "成长建议" : "Growth planning",
      body: locale === "zh-TW" ? "開始 MBTI 測驗，找出可實際嘗試的個人成長方向。" : isZh
        ? "直接开始 MBTI 测试，拿到可执行的个性化成长线索。"
        : "Start the MBTI test to unlock actionable growth guidance.",
      href: withLocale("/tests/mbti-personality-test-16-personality-types"),
    },
  ];
}
