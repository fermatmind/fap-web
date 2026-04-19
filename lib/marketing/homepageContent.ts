import { getCmsLandingSurface } from "@/lib/cms/landing-surfaces";
import type { Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type HomeLinkItem = {
  title: string;
  description?: string;
  href: string;
  label?: string;
  meta?: string;
};

export type HomeFamily = {
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  links: HomeLinkItem[];
};

export type HomeResultPreview = {
  title: string;
  metrics: string[];
  tone: "traits" | "career" | "state";
};

export type HomeTrustItem = {
  title: string;
  summary: string;
  paragraphs: string[];
  href?: string;
  hrefLabel?: string;
};

export type HomeFooterGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

export type HomeSecondaryLink = {
  title: string;
  description: string;
  href: string;
};

export type HomePageContent = {
  hero: {
    eyebrow: string;
    brand: string;
    title: string;
    subhead: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    tertiaryCta: string;
    tertiaryHref: string;
    trustRail: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HomeLinkItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: HomeFamily[];
  };
  results: {
    kicker: string;
    title: string;
    body: string;
    exampleLabel: string;
    exampleHref: string;
    previews: HomeResultPreview[];
  };
  trust: {
    kicker: string;
    title: string;
    body: string;
    methodHref: string;
    methodLabel: string;
    items: HomeTrustItem[];
  };
  secondaryExplore: {
    kicker: string;
    title: string;
    items: HomeSecondaryLink[];
  };
  header: {
    testsLabel: string;
    testsTitle: string;
    testsBody: string;
    browseAllLabel: string;
    browseAllHref: string;
    groups: Array<{ title: string; links: HomeLinkItem[] }>;
  };
  footer: {
    groups: HomeFooterGroup[];
    supportEmailLabel: string;
    tailnote: string;
  };
  seo: {
    title: string;
    description: string;
    quickStartListTitle: string;
    quickStartListDescription: string;
    familyListTitle: string;
    familyListDescription: string;
    organizationDescription: string;
  };
};

const REQUIRED_QUICK_START_ITEMS: Record<Locale, HomeLinkItem[]> = {
  zh: [
    {
      title: "MBTI 性格测试",
      description: "快速了解你的类型偏好与决策风格",
      href: "/tests/mbti-personality-test-16-personality-types",
      label: "开始测试",
      meta: "人格测试",
    },
    {
      title: "Big Five 大五人格测试",
      description: "从五个维度看清你的稳定特质",
      href: "/tests/big-five-personality-test-ocean-model",
      label: "开始测试",
      meta: "人格测试",
    },
    {
      title: "IQ 智商测试",
      description: "快速了解你的认知能力基线",
      href: "/tests/iq-test-intelligence-quotient-assessment/take",
      label: "开始测试",
      meta: "能力测评",
    },
    {
      title: "EQ 情商测试",
      description: "了解你在情绪识别与协作沟通中的表现",
      href: "/tests/eq-test-emotional-intelligence-assessment/take",
      label: "开始测试",
      meta: "情绪能力",
    },
    {
      title: "九型人格测试",
      description: "从核心动机与压力反应理解你的行为模式",
      href: "/tests",
      label: "开始测试",
      meta: "人格测试",
    },
    {
      title: "情绪状态自测",
      description: "快速了解你近期的情绪状态变化",
      href: "/tests",
      label: "开始测试",
      meta: "状态自测",
    },
  ],
  en: [
    {
      title: "MBTI Personality Test",
      description: "Understand your type preference and decision style quickly.",
      href: "/tests/mbti-personality-test-16-personality-types",
      label: "Start test",
      meta: "Personality test",
    },
    {
      title: "Big Five Personality Test",
      description: "Read your stable traits across five dimensions.",
      href: "/tests/big-five-personality-test-ocean-model",
      label: "Start test",
      meta: "Personality test",
    },
    {
      title: "IQ Test",
      description: "Get a quick baseline for cognitive ability.",
      href: "/tests/iq-test-intelligence-quotient-assessment/take",
      label: "Start test",
      meta: "Ability assessment",
    },
    {
      title: "EQ Test",
      description: "Review emotional recognition and collaboration skills.",
      href: "/tests/eq-test-emotional-intelligence-assessment/take",
      label: "Start test",
      meta: "Emotional ability",
    },
    {
      title: "Enneagram Test",
      description: "Understand behavior patterns through motivation and stress response.",
      href: "/tests",
      label: "Start test",
      meta: "Personality test",
    },
    {
      title: "Emotional State Check",
      description: "Quickly review recent shifts in your emotional state.",
      href: "/tests",
      label: "Start test",
      meta: "State check",
    },
  ],
};

function completeQuickStartItems(items: HomeLinkItem[], locale: Locale): HomeLinkItem[] {
  const byTitle = new Map(items.map((item) => [item.title, item]));
  const required = REQUIRED_QUICK_START_ITEMS[locale];

  return [
    ...required.map((item) => {
      const existing = byTitle.get(item.title);
      return {
        ...item,
        ...existing,
        href: item.href,
        label: existing?.label || item.label,
        meta: existing?.meta || item.meta,
      };
    }),
    ...items.filter((item) => !required.some((requiredItem) => requiredItem.title === item.title)),
  ];
}

function normalizeHomeContent(value: unknown, locale: Locale): HomePageContent {
  const content = value as HomePageContent;
  if (!content?.hero?.title || !content?.seo?.title || !Array.isArray(content?.families?.items)) {
    throw new Error("Invalid CMS homepage payload.");
  }

  return {
    ...content,
    quickStart: {
      ...content.quickStart,
      items: completeQuickStartItems(Array.isArray(content.quickStart.items) ? content.quickStart.items : [], locale),
    },
    families: {
      ...content.families,
      items: content.families.items.map((family) => ({
        ...family,
        links: filterVisiblePublicTestEntries(family.links ?? []),
      })),
    },
    header: {
      ...content.header,
      groups: (content.header.groups ?? []).map((group) => ({
        ...group,
        links: filterVisiblePublicTestEntries(group.links ?? []),
      })),
    },
    footer: {
      ...content.footer,
      groups: content.footer.groups ?? [],
    },
  };
}

export async function getHomePageContent(locale: Locale): Promise<HomePageContent> {
  const surface = await getCmsLandingSurface<HomePageContent>("home", locale);
  return normalizeHomeContent(surface.payloadJson, locale);
}
