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
import { resolveLocale } from "@/lib/i18n/getDict";
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
      en: "Personality & Leadership Decisions",
      zh: "人格与领导决策",
    },
    tags: {
      en: ["Dominant style", "Communication", "Role fit"],
      zh: ["主导风格", "沟通模式", "协作角色"],
    },
    footnote: {
      en: "144 items / 15 min / role-fit",
      zh: "144 items / 15 min / role-fit",
    },
  },
  "big-five-personality-test-ocean-model": {
    title: {
      en: "Big Five Personality Test",
      zh: "大五人格测试",
    },
    description: {
      en: "Used to review stable trait distribution and long-term tendencies across work, collaboration, and growth decisions.",
      zh: "用于查看稳定人格分布与长期职业、协作、发展倾向。",
    },
    category: {
      en: "Long-term Trait Coordinates",
      zh: "长期特质坐标",
    },
    tags: {
      en: ["Trait distribution", "Career fit", "Growth"],
      zh: ["稳定特质", "职业倾向", "发展方向"],
    },
    footnote: {
      en: "120 items / 20 min / OCEAN",
      zh: "120 items / 20 min / OCEAN",
    },
  },
  "clinical-depression-anxiety-assessment-professional-edition": {
    title: {
      en: "Depression & Anxiety Assessment",
      zh: "抑郁焦虑综合检测",
    },
    description: {
      en: "Used to identify pressure load, emotional risk, and where support should take priority.",
      zh: "用于识别压力负荷、情绪风险与支持优先级。",
    },
    category: {
      en: "Pressure & Risk Scan",
      zh: "压力与风险扫描",
    },
    tags: {
      en: ["Pressure load", "Risk scan", "Support priority"],
      zh: ["压力负荷", "风险扫描", "支持优先级"],
    },
    footnote: {
      en: "68 items / 12 min / clinical",
      zh: "68 items / 12 min / clinical",
    },
  },
  "depression-screening-test-standard-edition": {
    title: {
      en: "Depression Screening (Standard)",
      zh: "抑郁测评（标准版）",
    },
    description: {
      en: "Used to quickly calibrate recent emotional baseline and whether additional support should be considered.",
      zh: "用于快速查看近期情绪基线与支持需求。",
    },
    category: {
      en: "Recent State Calibration",
      zh: "近期状态校准",
    },
    tags: {
      en: ["Recent baseline", "Support need", "Quick check"],
      zh: ["近期基线", "支持需求", "快速校准"],
    },
    footnote: {
      en: "20 items / 5 min / baseline",
      zh: "20 items / 5 min / baseline",
    },
  },
  "iq-test-intelligence-quotient-assessment": {
    title: {
      en: "IQ Test",
      zh: "智商 IQ 测试",
    },
    description: {
      en: "Used to evaluate pattern recognition, abstract reasoning, and problem-solving strength.",
      zh: "用于评估模式识别、抽象推理与问题解决能力。",
    },
    category: {
      en: "Cognitive Ability Profile",
      zh: "认知能力画像",
    },
    tags: {
      en: ["Pattern recognition", "Abstract reasoning", "Problem solving"],
      zh: ["模式识别", "抽象推理", "问题解决"],
    },
    footnote: {
      en: "60 items / 12 min / reasoning",
      zh: "60 items / 12 min / reasoning",
    },
  },
  "eq-test-emotional-intelligence-assessment": {
    title: {
      en: "EQ Test",
      zh: "情商 EQ 测试",
    },
    description: {
      en: "Used to evaluate self-awareness, empathy, and relationship management for clearer collaboration judgment.",
      zh: "用于评估自我觉察、共情能力与关系管理能力。",
    },
    category: {
      en: "Emotion & Relationship Regulation",
      zh: "情绪与关系调度",
    },
    tags: {
      en: ["Self-awareness", "Empathy", "Relationship management"],
      zh: ["自我觉察", "共情能力", "关系管理"],
    },
    footnote: {
      en: "50 items / 10 min / regulation",
      zh: "50 items / 10 min / regulation",
    },
  },
} as const satisfies Record<
  string,
  {
    title: Record<Locale, string>;
    description: Record<Locale, string>;
    category: Record<Locale, string>;
    tags: Record<Locale, [string, string, string]>;
    footnote: Record<Locale, string>;
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
      const localizedFootnote = presentation?.footnote[locale] ?? `${item.questions_count} items / ${item.time_minutes} min`;

      return {
        kind: "live",
        slug: item.slug,
        title: localizedTitle,
        description: localizedDescription,
        category: localizedCategory,
        tags: [...localizedTags],
        questionsCount: item.questions_count,
        timeMinutes: item.time_minutes,
        footnote: localizedFootnote,
      };
    });

  return (
    <main className="fm-home">
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection locale={locale} />
      <ValuePropsSection locale={locale} />
      <HighlightedTestsSection locale={locale} cards={highlightedCards} />
      <SocialProofSection locale={locale} />
    </main>
  );
}
