import type { Locale } from "@/lib/i18n/locales";

type ReadingLink = { label: string; href: string };
export type SelfUnderstandingResource = {
  id: string;
  title: string;
  paths: [ReadingLink, ReadingLink, ReadingLink];
  testHref: string;
};

// Reading routes reference existing public pages; this directory does not own their content or indexing policy.
export function getSelfUnderstandingResources(locale: Locale): SelfUnderstandingResource[] {
  const zh = locale === "zh";
  return [
    {
      id: "mbti", title: zh ? "MBTI与16型人格" : "MBTI & 16 personality types",
      paths: [
        { label: zh ? "四组偏好与16型总览" : "Four preferences and 16 types", href: "/personality" },
        { label: zh ? "用真实场景读懂四组偏好" : "Explore your type profile", href: "/articles/mbti-narrative-portrait" },
        { label: zh ? "从偏好到四周行为实验" : "Go deeper into MBTI", href: zh ? "/articles/mbti-growth-guide" : "/topics/mbti" },
      ], testHref: "/tests/mbti-personality-test-16-personality-types",
    },
    {
      id: "big-five", title: zh ? "大五人格" : "Big Five",
      paths: [
        { label: zh ? "OCEAN 五大特质是什么" : "What are the OCEAN traits?", href: "/personality/big-five" },
        { label: zh ? "五维组合与个人画像怎么读" : "Read your OCEAN profile", href: "/articles/big-five-narrative-portrait" },
        { label: zh ? "五维行为实验与复盘" : "Openness in everyday life", href: zh ? "/articles/big-five-growth-guide" : "/personality/big-five/openness" },
      ], testHref: "/tests/big-five-personality-test-ocean-model",
    },
    {
      id: "enneagram", title: zh ? "九型人格与成长" : "Enneagram & growth",
      paths: [
        { label: zh ? "九种动机及其差异" : "Nine motivations and their differences", href: "/personality/enneagram" },
        { label: zh ? "105／144题的结果读法" : "Read 105- and 144-item results", href: "/personality/enneagram#forms" },
        { label: zh ? "选候选类型，读该型的小实践" : "Choose a candidate type and its practices", href: "/personality/enneagram#shared_event" },
      ], testHref: "/tests/enneagram-personality-test-nine-types",
    },
    {
      id: "riasec", title: zh ? "职业兴趣" : "Career interests",
      paths: [
        { label: zh ? "RIASEC 六种兴趣是什么" : "Understand the six RIASEC interests", href: zh ? "/articles/riasec-holland-career-interest-test-explained" : "/tests/holland-career-interest-test-riasec#what-it-is" },
        { label: zh ? "前三码、差距与分化程度" : "Read your top interests and score gaps", href: "/tests/holland-career-interest-test-riasec#why-choose" },
        { label: zh ? "从兴趣出发，探索职业路径" : "Explore career paths", href: "/career/guides" },
      ], testHref: "/tests/holland-career-interest-test-riasec",
    },
    {
      id: "iq", title: zh ? "IQ与认知" : "IQ & cognition",
      paths: [
        { label: zh ? "IQ 测试通常在测什么" : "What this reasoning assessment measures", href: "/articles/iq-test-score-and-limits-explained#article-body-markdown-block-21" },
        { label: zh ? "分数、正确率与结果边界" : "Understand scoring and its limits", href: "/articles/iq-test-score-and-limits-explained#article-body-markdown-block-35" },
        { label: zh ? "图形推理练习：旋转与镜像" : "Read the method boundaries", href: zh ? "/articles/matrix-reasoning-rotation-vs-reflection" : "/method-boundaries" },
      ], testHref: "/tests/iq-test-intelligence-quotient-assessment",
    },
    {
      id: "eq", title: zh ? "情绪与人际能力" : "Emotional & interpersonal skills",
      paths: [
        { label: zh ? "EQ-60 四维自评与科学边界" : "Understand EQ self-report", href: "/articles/eq-test-tool-guide" },
        { label: zh ? "标准分、百分位与阶段性参照" : "Read the score and method", href: "/articles/eq60-score-and-results-guide" },
        { label: zh ? "情绪觉察、调节与沟通：三个场景" : "Explore communication in context", href: "/articles/emotional-awareness-regulation-and-relationship-practice" },
      ], testHref: "/tests/eq-test-emotional-intelligence-assessment",
    },
  ];
}

export function getSelfUnderstandingMenu(locale: Locale) {
  return [
    { href: "/topics", label: locale === "zh" ? "认识自己 · 全部资源" : "Understand yourself · All resources" },
    ...getSelfUnderstandingResources(locale).map(({ id, title }) => ({ href: `/topics#${id}`, label: title })),
  ];
}

export function getRelationshipReadingLinks(locale: Locale) {
  return [
    { label: locale === "zh" ? "EQ：情绪觉察、调节与沟通练习" : "EQ: awareness, regulation and communication", href: "/articles/emotional-awareness-regulation-and-relationship-practice" },
    { label: locale === "zh" ? "亲密、激情与承诺：理解关系状态" : "Intimacy, passion and commitment in relationships", href: "/articles/which-love-script-fits-you-best" },
    { label: locale === "zh" ? "以 ENFP 为例：关系中的偏好与沟通" : "An ENFP example: preferences and communication", href: "/personality/enfp#relationships" },
  ];
}
