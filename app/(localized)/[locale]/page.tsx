import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import {
  HighlightedTestsSection,
  type HomeHighlightedCard,
} from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

const HIGHLIGHTED_CARD_PRESENTATION = {
  "mbti-personality-test-16-personality-types": {
    title: {
      en: "MBTI Personality Test",
      zh: "MBTI 性格测试",
    },
    description: {
      en: "Identify preference patterns, communication habits, and decision tendencies in a report you can revisit.",
      zh: "识别偏好结构、沟通习惯与决策倾向，输出可回看的结构化解释。",
    },
    category: {
      en: "Personality",
      zh: "人格结构",
    },
    tags: {
      en: ["16 Types", "Communication", "Team Fit"],
      zh: ["16 型人格", "沟通偏好", "协作角色"],
    },
  },
  "big-five-personality-test-ocean-model": {
    title: {
      en: "Big Five Personality Test",
      zh: "大五人格测试",
    },
    description: {
      en: "Review your trait distribution across five dimensions for career, collaboration, and long-term growth decisions.",
      zh: "从五大维度查看稳定特质分布，用于职业选择、协作方式与长期发展判断。",
    },
    category: {
      en: "Trait Profile",
      zh: "特质画像",
    },
    tags: {
      en: ["OCEAN", "Career Fit", "Long-term Tendencies"],
      zh: ["OCEAN", "职业适配", "长期倾向"],
    },
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    title: {
      en: "Depression & Anxiety Assessment",
      zh: "抑郁焦虑综合检测",
    },
    description: {
      en: "Screen depression, anxiety, and stress load together to identify where deeper support may be needed.",
      zh: "围绕抑郁、焦虑与压力负荷做多维筛查，帮助更早识别需要关注的风险信号。",
    },
    category: {
      en: "Mental Health",
      zh: "心理状态",
    },
    tags: {
      en: ["Multidomain", "Stress Load", "Professional Edition"],
      zh: ["多维筛查", "压力负荷", "专业版"],
    },
  },
  "depression-screening-test-standard-edition": {
    title: {
      en: "Depression Screening (Standard)",
      zh: "抑郁测评（标准版）",
    },
    description: {
      en: "Check your recent emotional baseline and fatigue burden through a focused, lightweight screening flow.",
      zh: "快速查看近期情绪基线与疲劳负荷，为是否需要进一步支持提供参考。",
    },
    category: {
      en: "Mood Screening",
      zh: "情绪筛查",
    },
    tags: {
      en: ["Standard", "Recent State", "Self-check"],
      zh: ["标准版", "近期状态", "自我筛查"],
    },
  },
  "iq-test-intelligence-quotient-assessment": {
    title: {
      en: "IQ Test",
      zh: "智商 IQ 测试",
    },
    description: {
      en: "Focus on matrix reasoning, abstract recognition, and problem solving to assess cognitive pattern strength.",
      zh: "聚焦矩阵推理、抽象识别与问题解决能力，形成更稳定的认知能力画像。",
    },
    category: {
      en: "Cognitive Ability",
      zh: "认知能力",
    },
    tags: {
      en: ["Matrix Reasoning", "Pattern Logic", "Problem Solving"],
      zh: ["矩阵推理", "模式逻辑", "问题解决"],
    },
  },
  "eq-test-emotional-intelligence-assessment": {
    title: {
      en: "EQ Test",
      zh: "情商 EQ 测试",
    },
    description: {
      en: "Assess emotional awareness, regulation, and interpersonal response for clearer collaboration decisions.",
      zh: "评估情绪觉察、调节与人际应对方式，帮助改善协作、反馈与关系判断。",
    },
    category: {
      en: "Emotional Intelligence",
      zh: "情绪智能",
    },
    tags: {
      en: ["Self-awareness", "Empathy", "Relationship Management"],
      zh: ["自我觉察", "共情能力", "关系管理"],
    },
  },
} as const satisfies Record<
  string,
  {
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    category: Record<Locale, string>;
    tags: Record<Locale, [string, string, string]>;
  }
>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/zh" : "/en";

  return buildPageMetadata({
    locale,
    pathname,
    title: "FermatMind",
    description: isZh
      ? "费马测试：科学自我测评与人格洞察。"
      : "FermatMind assessments and personality insights.",
    imagePath: "/share/mbti_wide_1200x630.png",
    alternatesByLocale: {
      en: "/en",
      zh: "/zh",
      xDefault: "/",
    },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const allTests = getAllTests();
  const bySlug = new Map<string, (typeof allTests)[number]>();
  for (const item of allTests) {
    bySlug.set(item.slug, item);
  }

  const preferredLiveSlugs = [
    "mbti-personality-test-16-personality-types",
    "big-five-personality-test-ocean-model",
    "clinical-depression-anxiety-assessment-professional-edition",
    "depression-screening-test-standard-edition",
    "iq-test-intelligence-quotient-assessment",
    "eq-test-emotional-intelligence-assessment",
  ] as const;

  const highlightedCards: HomeHighlightedCard[] = preferredLiveSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => {
      const presentation =
        HIGHLIGHTED_CARD_PRESENTATION[item.slug as keyof typeof HIGHLIGHTED_CARD_PRESENTATION];
      const localizedTitle = presentation?.title[locale] ?? resolveTestTitleByLocale(item, locale);
      const localizedDescription = presentation?.description[locale] ?? item.description;
      const localizedCategory = presentation?.category[locale] ?? (locale === "zh" ? "结构化测评" : "Structured Assessment");
      const localizedTags = presentation?.tags[locale] ?? [];

      return {
        kind: "live",
        slug: item.slug,
        title: localizedTitle,
        description: localizedDescription,
        category: localizedCategory,
        tags: [...localizedTags],
        questionsCount: item.questions_count,
        timeMinutes: item.time_minutes,
      };
    });

  return (
    <main className="fm-home">
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection dict={dict} locale={locale} />
      <ValuePropsSection dict={dict} locale={locale} />
      <HighlightedTestsSection dict={dict} locale={locale} cards={highlightedCards} />
      <SocialProofSection dict={dict} locale={locale} />
    </main>
  );
}
