import {
  getBig5Recommendation,
  getCareerGuideBySlug,
  getMbtiRecommendation,
  getTestBySlug,
  listRelatedBlogPosts,
  resolveTestTitleByLocale,
  type RelatedContentItem,
} from "@/lib/content";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type LocalizedText = Record<Locale, string>;

type TopicDefinition = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  personalitySectionTitle: LocalizedText;
  articleTestSlugs: string[];
  careerGuideSlugs: string[];
  featuredTestSlugs: string[];
  mbtiTypes?: string[];
  big5Traits?: string[];
};

export type TopicCluster = {
  slug: string;
  title: string;
  summary: string;
  description: string;
  personalitySectionTitle: string;
  featuredTests: RelatedContentItem[];
  articles: RelatedContentItem[];
  careers: RelatedContentItem[];
  personalities: RelatedContentItem[];
};

const TOPIC_DEFINITIONS: TopicDefinition[] = [
  {
    slug: "mbti",
    title: {
      en: "MBTI Topic Cluster",
      zh: "MBTI 主题内容聚合",
    },
    summary: {
      en: "Connect MBTI articles, career guides, and recommendation profiles in one internal-linking hub.",
      zh: "把 MBTI 文章、职业发展内容与推荐画像聚合到一个内部链接中心。",
    },
    description: {
      en: "Use this cluster when you want one page that connects MBTI interpretation, career-fit guidance, and personality-led next steps.",
      zh: "当你希望把 MBTI 解读、职业匹配和后续行动放到同一个内容路径里时，从这个主题页开始。",
    },
    personalitySectionTitle: {
      en: "Related personality profiles",
      zh: "相关人格画像",
    },
    articleTestSlugs: ["mbti-personality-test-16-personality-types"],
    careerGuideSlugs: ["from-mbti-to-job-fit", "how-to-find-right-career-direction"],
    featuredTestSlugs: ["mbti-personality-test-16-personality-types"],
    mbtiTypes: ["ENFJ", "INFP", "INTJ", "ENTP"],
  },
  {
    slug: "big-five",
    title: {
      en: "Big Five Topic Cluster",
      zh: "大五人格主题内容聚合",
    },
    summary: {
      en: "Group Big Five explainers, career-decision guides, and trait-based recommendation pages for stronger SEO clusters.",
      zh: "聚合大五人格文章、职业决策指南和特质推荐页面，形成更完整的 SEO 主题簇。",
    },
    description: {
      en: "Start here if you want to connect the OCEAN model with practical career decisions and trait-by-trait recommendation content.",
      zh: "如果你想把 OCEAN 模型与职业决策、分特质职业建议联系起来，可以从这里展开阅读。",
    },
    personalitySectionTitle: {
      en: "Related personality dimensions",
      zh: "相关人格维度",
    },
    articleTestSlugs: ["big-five-personality-test-ocean-model"],
    careerGuideSlugs: ["big5-for-career-decisions", "how-to-find-right-career-direction"],
    featuredTestSlugs: ["big-five-personality-test-ocean-model"],
    big5Traits: ["openness", "conscientiousness", "extraversion"],
  },
  {
    slug: "iq-eq",
    title: {
      en: "IQ & EQ Topic Cluster",
      zh: "IQ 与 EQ 主题内容聚合",
    },
    summary: {
      en: "Bring together cognitive, emotional, and career-execution content around decision quality at work.",
      zh: "把认知能力、情绪能力与职业执行相关内容放到同一个内容簇里。",
    },
    description: {
      en: "This cluster helps readers move from IQ and EQ test output into better communication, judgment, and career execution habits.",
      zh: "这个主题页帮助读者把 IQ 与 EQ 的测评结果转成更好的沟通、判断和职业执行方式。",
    },
    personalitySectionTitle: {
      en: "Related personality profiles",
      zh: "相关人格画像",
    },
    articleTestSlugs: [
      "iq-test-intelligence-quotient-assessment",
      "eq-test-emotional-intelligence-assessment",
    ],
    careerGuideSlugs: ["iq-eq-balance-at-work"],
    featuredTestSlugs: [
      "iq-test-intelligence-quotient-assessment",
      "eq-test-emotional-intelligence-assessment",
    ],
  },
];

function localizedText(text: LocalizedText, locale: Locale): string {
  return locale === "zh" ? text.zh : text.en;
}

function toRelatedItem(slug: string, title: string, href: string, summary?: string): RelatedContentItem {
  return {
    slug,
    title,
    href,
    summary,
  };
}

function dedupeItems(items: RelatedContentItem[]): RelatedContentItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.href)) {
      return false;
    }

    seen.add(item.href);
    return true;
  });
}

function buildFeaturedTests(testSlugs: string[], locale: Locale): RelatedContentItem[] {
  return dedupeItems(
    testSlugs
      .map((slug) => getTestBySlug(slug))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((test) =>
        toRelatedItem(
          test.slug,
          resolveTestTitleByLocale(test, locale),
          localizedPath(`/tests/${test.slug}`, locale),
          test.description
        )
      )
  );
}

function buildArticles(testSlugs: string[], locale: Locale): RelatedContentItem[] {
  return dedupeItems(
    testSlugs.flatMap((testSlug) =>
      listRelatedBlogPosts(testSlug, locale).map((post) =>
        toRelatedItem(
          post.slug,
          post.title,
          localizedPath(`/articles/${post.slug}`, locale),
          post.summary
        )
      )
    )
  ).slice(0, 6);
}

function buildCareers(guideSlugs: string[], locale: Locale): RelatedContentItem[] {
  return dedupeItems(
    guideSlugs
      .map((slug) => getCareerGuideBySlug(slug, locale))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((guide) =>
        toRelatedItem(
          guide.slug,
          guide.title,
          localizedPath(`/career/guides/${guide.slug}`, locale),
          guide.summary
        )
      )
  ).slice(0, 4);
}

function buildMbtiProfiles(types: string[], locale: Locale): RelatedContentItem[] {
  return dedupeItems(
    types
      .map((type) => getMbtiRecommendation(type, locale))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((profile) =>
        toRelatedItem(
          profile.key.toUpperCase(),
          profile.title,
          localizedPath(`/career/recommendations/mbti/${profile.key.toUpperCase()}`, locale),
          profile.summary
        )
      )
  ).slice(0, 4);
}

function buildBig5Profiles(traits: string[], locale: Locale): RelatedContentItem[] {
  return dedupeItems(
    traits
      .map((trait) => getBig5Recommendation(trait, "balanced", locale))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((profile) =>
        toRelatedItem(
          profile.key.toLowerCase(),
          profile.title,
          localizedPath(`/career/recommendations/big5/${profile.key.toLowerCase()}`, locale),
          profile.summary
        )
      )
  ).slice(0, 4);
}

function toTopicCluster(definition: TopicDefinition, locale: Locale): TopicCluster {
  const personalities = dedupeItems([
    ...buildMbtiProfiles(definition.mbtiTypes ?? [], locale),
    ...buildBig5Profiles(definition.big5Traits ?? [], locale),
  ]).slice(0, 4);

  return {
    slug: definition.slug,
    title: localizedText(definition.title, locale),
    summary: localizedText(definition.summary, locale),
    description: localizedText(definition.description, locale),
    personalitySectionTitle: localizedText(definition.personalitySectionTitle, locale),
    featuredTests: buildFeaturedTests(definition.featuredTestSlugs, locale),
    articles: buildArticles(definition.articleTestSlugs, locale),
    careers: buildCareers(definition.careerGuideSlugs, locale),
    personalities,
  };
}

export function listTopicSlugs(): string[] {
  return TOPIC_DEFINITIONS.map((topic) => topic.slug);
}

export function listTopicClusters(locale: Locale): TopicCluster[] {
  return TOPIC_DEFINITIONS.map((topic) => toTopicCluster(topic, locale));
}

export function getTopicCluster(slug: string, locale: Locale): TopicCluster | null {
  const normalizedSlug = String(slug ?? "").trim().toLowerCase();
  const definition = TOPIC_DEFINITIONS.find((topic) => topic.slug === normalizedSlug);

  return definition ? toTopicCluster(definition, locale) : null;
}
