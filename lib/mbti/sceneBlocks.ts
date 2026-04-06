import type { Locale } from "@/lib/i18n/locales";

export type MbtiSceneBlock = {
  key: string;
  title: string;
  body: string;
  href: string;
};

export function buildDefaultMbtiSceneBlocks(locale: Locale): MbtiSceneBlock[] {
  const isZh = locale === "zh";
  const withLocale = (pathname: string) => `/${locale}${pathname}`;

  return [
    {
      key: "career_direction",
      title: isZh ? "职业方向" : "Career direction",
      body: isZh
        ? "先看适配岗位与职业路径，再决定下一步行动。"
        : "Use role fit and career paths to choose your next move.",
      href: withLocale("/career/recommendations"),
    },
    {
      key: "major_choice",
      title: isZh ? "专业选择" : "Major selection",
      body: isZh
        ? "从 MBTI 主题页进入，快速建立专业与方向判断框架。"
        : "Start from the MBTI topic hub to frame major and direction decisions.",
      href: withLocale("/topics/mbti"),
    },
    {
      key: "team_collaboration",
      title: isZh ? "团队协作" : "Team collaboration",
      body: isZh
        ? "查看类型画像，理解协作偏好与沟通方式差异。"
        : "Review type profiles to understand collaboration and communication patterns.",
      href: withLocale("/personality"),
    },
    {
      key: "relationship_patterns",
      title: isZh ? "关系相处" : "Relationship patterns",
      body: isZh
        ? "通过人格类型与主题内容，识别关系中的稳定摩擦点。"
        : "Use personality and topic content to identify relationship friction patterns.",
      href: withLocale("/topics/mbti"),
    },
    {
      key: "growth_plan",
      title: isZh ? "成长建议" : "Growth planning",
      body: isZh
        ? "直接开始 MBTI 测试，拿到可执行的个性化成长线索。"
        : "Start the MBTI test to unlock actionable growth guidance.",
      href: withLocale("/tests/mbti-personality-test-16-personality-types"),
    },
  ];
}
