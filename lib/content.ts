import {
  blog,
  careerGuides,
  careerIndustries,
  careerJobs,
  careerRecommendationProfiles,
  tests,
  types,
} from "../.velite";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

export type Test = (typeof tests)[number];
export type TestType = (typeof types)[number];
export type BlogPost = (typeof blog)[number];
export type CareerJob = (typeof careerJobs)[number];
export type CareerIndustry = (typeof careerIndustries)[number];
export type CareerGuide = (typeof careerGuides)[number];
export type CareerRecommendationProfile = (typeof careerRecommendationProfiles)[number];
export type LocalizedBlogPost = BlogPost & {
  locale: Locale;
  translation_group: string;
  translation_ready: boolean;
};
export type BlogVoice = "tool" | "growth" | "narrative";
export type BlogPostsGroup = {
  relatedTestSlug: string;
  posts: LocalizedBlogPost[];
};

export type RelatedContentItem = {
  slug: string;
  title: string;
  href: string;
  summary?: string;
};

export type TestListItem = {
  title: string;
  title_i18n?: Record<string, string>;
  slug: string;
  description: string;
  cover_image: string;
  questions_count: number;
  time_minutes: number;
  scale_code?: string;
  card_visual?: string;
  card_tone?: string;
  card_seed?: string;
  card_density?: string;
  card_tagline_i18n?: Record<string, string>;
  highlight_priority?: number;
  highlight_rating?: number;
  highlight_excerpt_i18n?: Record<string, string>;
  highlight_seo_copy_i18n?: Record<string, string>;
};

export function getAllTests(): TestListItem[] {
  return [...tests]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((test) => ({
      title: test.title,
      title_i18n: test.title_i18n,
      slug: test.slug,
      description: test.description,
      cover_image: test.cover_image,
      questions_count: test.questions_count,
      time_minutes: test.time_minutes,
      scale_code: test.scale_code,
      card_visual: test.card_visual,
      card_tone: test.card_tone,
      card_seed: test.card_seed,
      card_density: test.card_density,
      card_tagline_i18n: test.card_tagline_i18n,
      highlight_priority: test.highlight_priority,
      highlight_rating: test.highlight_rating,
      highlight_excerpt_i18n: test.highlight_excerpt_i18n,
      highlight_seo_copy_i18n: test.highlight_seo_copy_i18n,
    }));
}

export function resolveTestTitleByLocale(
  test: Pick<TestListItem, "title" | "title_i18n">,
  locale: Locale
): string {
  const source = test.title_i18n;
  if (!source || typeof source !== "object") return test.title;

  const localized =
    locale === "zh"
      ? source.zh ?? source["zh-CN"] ?? source.en
      : source.en ?? source.zh ?? source["zh-CN"];

  if (typeof localized === "string" && localized.trim().length > 0) {
    return localized.trim();
  }
  return test.title;
}

export function getTestBySlug(slug: string): Test | null {
  const normalizedSlug = resolveCanonicalSlug(slug);
  return tests.find((test) => test.slug === normalizedSlug) ?? null;
}

export function listTypes(): TestType[] {
  return [...types].sort((a, b) => a.code.localeCompare(b.code));
}

export function getTypeByCode(code: string): TestType | null {
  return types.find((type) => type.code === code) ?? null;
}

function normalizeBlogPost(post: BlogPost): LocalizedBlogPost {
  const locale = post.locale === "en" ? "en" : "zh";
  const translationGroup = String(post.translation_group ?? post.slug).trim() || String(post.slug).trim();
  const translationReady =
    locale === "zh" ? true : typeof post.translation_ready === "boolean" ? post.translation_ready : false;
  const publishedAt = String(post.publishedAt ?? post.updatedAt ?? "").trim() || post.updatedAt;
  const author = String(post.author ?? "").trim() || "FermatMind Editorial";
  const citations = Array.isArray(post.citations)
    ? post.citations.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];

  return {
    ...post,
    locale,
    translation_group: translationGroup,
    translation_ready: translationReady,
    publishedAt,
    author,
    citations,
  };
}

function listAllNormalizedBlogPosts(): LocalizedBlogPost[] {
  return blog.map((post) => normalizeBlogPost(post));
}

function sortBlogPostsByUpdatedAt(posts: LocalizedBlogPost[]): LocalizedBlogPost[] {
  return [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listBlogPosts(locale?: Locale): LocalizedBlogPost[] {
  const all = listAllNormalizedBlogPosts();
  if (!locale) return sortBlogPostsByUpdatedAt(all);
  return sortBlogPostsByUpdatedAt(all.filter((post) => post.locale === locale));
}

export function isBlogSlugIndexableInLocale(slug: string, locale: Locale): boolean {
  const all = listAllNormalizedBlogPosts();
  const localized = all.find((post) => post.slug === slug && post.locale === locale);
  if (!localized) return false;
  return locale === "zh" ? true : localized.translation_ready;
}

export function resolveBlogPostBySlug(slug: string, locale: Locale): {
  post: LocalizedBlogPost | null;
  hasLocalizedContent: boolean;
  hasFallbackContent: boolean;
  usedFallback: boolean;
} {
  const all = listAllNormalizedBlogPosts();
  const localized = all.find((post) => post.slug === slug && post.locale === locale) ?? null;
  const fallback = all.find((post) => post.slug === slug && post.locale === "zh") ?? null;

  if (localized) {
    return {
      post: localized,
      hasLocalizedContent: true,
      hasFallbackContent: Boolean(fallback),
      usedFallback: false,
    };
  }

  return {
    post: fallback,
    hasLocalizedContent: false,
    hasFallbackContent: Boolean(fallback),
    usedFallback: Boolean(fallback),
  };
}

export function getBlogPostBySlug(slug: string, locale?: Locale): LocalizedBlogPost | null {
  if (locale) {
    return resolveBlogPostBySlug(slug, locale).post;
  }
  return listAllNormalizedBlogPosts().find((post) => post.slug === slug) ?? null;
}

const BLOG_RELATED_TEST_ORDER = [
  "mbti-personality-test-16-personality-types",
  "big-five-personality-test-ocean-model",
  "clinical-depression-anxiety-assessment-professional-edition",
  "depression-screening-test-standard-edition",
  "iq-test-intelligence-quotient-assessment",
  "eq-test-emotional-intelligence-assessment",
] as const;

const BLOG_VOICE_ORDER: Record<BlogVoice, number> = {
  tool: 1,
  growth: 2,
  narrative: 3,
};

function resolveRelatedTestRank(slug: string): number {
  const index = BLOG_RELATED_TEST_ORDER.indexOf(slug as (typeof BLOG_RELATED_TEST_ORDER)[number]);
  return index >= 0 ? index : Number.MAX_SAFE_INTEGER;
}

function resolveVoiceOrder(post: LocalizedBlogPost): number {
  if (typeof post.voice_order === "number" && Number.isFinite(post.voice_order)) {
    return post.voice_order;
  }
  const fallback = BLOG_VOICE_ORDER[post.voice as BlogVoice];
  return typeof fallback === "number" ? fallback : Number.MAX_SAFE_INTEGER;
}

function sortBlogPostsForPlacement(posts: LocalizedBlogPost[]): LocalizedBlogPost[] {
  return [...posts].sort((a, b) => {
    const testRankDiff = resolveRelatedTestRank(a.related_test_slug) - resolveRelatedTestRank(b.related_test_slug);
    if (testRankDiff !== 0) return testRankDiff;

    const voiceOrderDiff = resolveVoiceOrder(a) - resolveVoiceOrder(b);
    if (voiceOrderDiff !== 0) return voiceOrderDiff;

    const updateDiff = b.updatedAt.localeCompare(a.updatedAt);
    if (updateDiff !== 0) return updateDiff;

    return a.title.localeCompare(b.title);
  });
}

export function listBlogPostsGroupedByTest(locale: Locale = "zh"): BlogPostsGroup[] {
  const grouped = new Map<string, LocalizedBlogPost[]>();
  const localizedPosts = listBlogPosts(locale);
  const sourcePosts =
    locale === "en" && localizedPosts.length === 0 ? listBlogPosts("zh") : localizedPosts;

  for (const post of sortBlogPostsForPlacement(sourcePosts)) {
    const key = String(post.related_test_slug ?? "").trim();
    if (!key) continue;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)?.push(post);
  }

  return [...grouped.entries()]
    .sort(([slugA], [slugB]) => {
      const rankDiff = resolveRelatedTestRank(slugA) - resolveRelatedTestRank(slugB);
      if (rankDiff !== 0) return rankDiff;
      return slugA.localeCompare(slugB);
    })
    .map(([relatedTestSlug, posts]) => ({
      relatedTestSlug,
      posts: sortBlogPostsForPlacement(posts),
    }));
}

export function listRelatedBlogPosts(testSlug: string, locale: Locale = "zh"): LocalizedBlogPost[] {
  const localizedPosts = listBlogPosts(locale).filter((post) => post.related_test_slug === testSlug);
  if (localizedPosts.length > 0) {
    return sortBlogPostsForPlacement(localizedPosts).slice(0, 3);
  }

  if (locale === "en") {
    const zhFallback = listBlogPosts("zh").filter((post) => post.related_test_slug === testSlug);
    return sortBlogPostsForPlacement(zhFallback).slice(0, 3);
  }

  return [];
}

export function listBlogSlugs(): string[] {
  const slugs = new Set(listAllNormalizedBlogPosts().map((post) => post.slug));
  return [...slugs].sort((a, b) => a.localeCompare(b));
}

function resolveContentLocale(value: unknown): Locale {
  return String(value ?? "").toLowerCase() === "en" ? "en" : "zh";
}

export type LocalizedCareerJob = CareerJob & { locale: Locale };
export type LocalizedCareerIndustry = CareerIndustry & { locale: Locale };
export type LocalizedCareerGuide = CareerGuide & { locale: Locale };
export type LocalizedCareerRecommendationProfile = CareerRecommendationProfile & { locale: Locale };

function normalizeCareerJob(item: CareerJob): LocalizedCareerJob {
  return {
    ...item,
    locale: resolveContentLocale(item.locale),
  };
}

function normalizeCareerIndustry(item: CareerIndustry): LocalizedCareerIndustry {
  return {
    ...item,
    locale: resolveContentLocale(item.locale),
  };
}

function normalizeCareerGuide(item: CareerGuide): LocalizedCareerGuide {
  return {
    ...item,
    locale: resolveContentLocale(item.locale),
  };
}

function normalizeCareerRecommendationProfile(
  item: CareerRecommendationProfile
): LocalizedCareerRecommendationProfile {
  return {
    ...item,
    locale: resolveContentLocale(item.locale),
  };
}

function sortByTitle<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.title.localeCompare(b.title));
}

export function listCareerJobs(locale?: Locale): LocalizedCareerJob[] {
  const all = careerJobs.map((item) => normalizeCareerJob(item));
  if (!locale) return sortByTitle(all);
  return sortByTitle(all.filter((item) => item.locale === locale));
}

export function listCareerJobSlugs(): string[] {
  return [...new Set(careerJobs.map((item) => String(item.slug).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getCareerJobBySlug(slug: string, locale: Locale): LocalizedCareerJob | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  const all = listCareerJobs();
  return all.find((item) => item.slug === key && item.locale === locale) ?? all.find((item) => item.slug === key && item.locale === "zh") ?? null;
}

export function listCareerIndustries(locale?: Locale): LocalizedCareerIndustry[] {
  const all = careerIndustries.map((item) => normalizeCareerIndustry(item));
  if (!locale) return sortByTitle(all);
  return sortByTitle(all.filter((item) => item.locale === locale));
}

export function listCareerIndustrySlugs(): string[] {
  return [...new Set(careerIndustries.map((item) => String(item.slug).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getCareerIndustryBySlug(slug: string, locale: Locale): LocalizedCareerIndustry | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  const all = listCareerIndustries();
  return (
    all.find((item) => item.slug === key && item.locale === locale) ??
    all.find((item) => item.slug === key && item.locale === "zh") ??
    null
  );
}

export function listCareerGuides(locale?: Locale): LocalizedCareerGuide[] {
  const all = careerGuides.map((item) => normalizeCareerGuide(item));
  if (!locale) return [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return [...all].filter((item) => item.locale === locale).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listCareerGuideSlugs(): string[] {
  return [...new Set(careerGuides.map((item) => String(item.slug).trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

export function getCareerGuideBySlug(slug: string, locale: Locale): LocalizedCareerGuide | null {
  const key = String(slug ?? "").trim();
  if (!key) return null;
  const all = listCareerGuides();
  return (
    all.find((item) => item.slug === key && item.locale === locale) ??
    all.find((item) => item.slug === key && item.locale === "zh") ??
    null
  );
}

export function listCareerRecommendationProfiles(
  locale?: Locale
): LocalizedCareerRecommendationProfile[] {
  const all = careerRecommendationProfiles.map((item) => normalizeCareerRecommendationProfile(item));
  if (!locale) return sortByTitle(all);
  return sortByTitle(all.filter((item) => item.locale === locale));
}

export function getBig5Recommendation(
  trait: string,
  band: "high" | "balanced" | "low" = "balanced",
  locale: Locale
): LocalizedCareerRecommendationProfile | null {
  const key = String(trait ?? "").trim().toLowerCase();
  if (!key) return null;
  const all = listCareerRecommendationProfiles();
  return (
    all.find(
      (item) =>
        item.profile_type === "big5" &&
        item.key.toLowerCase() === key &&
        item.band === band &&
        item.locale === locale
    ) ??
    all.find(
      (item) =>
        item.profile_type === "big5" &&
        item.key.toLowerCase() === key &&
        item.band === band &&
        item.locale === "zh"
    ) ??
    null
  );
}

export function listBig5RecommendationTraits(): string[] {
  return [
    ...new Set(
      careerRecommendationProfiles
        .filter((item) => item.profile_type === "big5")
        .map((item) => String(item.key).trim().toLowerCase())
        .filter(Boolean)
    ),
  ].sort((a, b) => a.localeCompare(b));
}

const TEST_TO_CAREER_GUIDE_SLUGS: Record<string, string[]> = {
  "mbti-personality-test-16-personality-types": [
    "from-mbti-to-job-fit",
    "how-to-find-right-career-direction",
  ],
  "big-five-personality-test-ocean-model": [
    "big5-for-career-decisions",
    "how-to-find-right-career-direction",
  ],
  "eq-test-emotional-intelligence-assessment": ["iq-eq-balance-at-work"],
  "iq-test-intelligence-quotient-assessment": ["iq-eq-balance-at-work"],
};

const GUIDE_TO_TEST_SLUGS: Record<string, string[]> = {
  "from-mbti-to-job-fit": ["mbti-personality-test-16-personality-types"],
  "big5-for-career-decisions": ["big-five-personality-test-ocean-model"],
  "iq-eq-balance-at-work": [
    "iq-test-intelligence-quotient-assessment",
    "eq-test-emotional-intelligence-assessment",
  ],
};

function dedupeRelatedItems(items: RelatedContentItem[]): RelatedContentItem[] {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = item.href;
    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function toRelatedItem(
  slug: string,
  title: string,
  href: string,
  summary?: string
): RelatedContentItem {
  return {
    slug,
    title,
    href,
    summary,
  };
}

function relatedArticlesForTestSlugs(testSlugs: string[], locale: Locale, excludeSlug?: string): RelatedContentItem[] {
  const items = testSlugs.flatMap((testSlug) =>
    listRelatedBlogPosts(testSlug, locale)
      .filter((post) => post.slug !== excludeSlug)
      .map((post) =>
        toRelatedItem(
          post.slug,
          post.title,
          localizedPath(`/articles/${post.slug}`, locale),
          post.summary
        )
      )
  );

  return dedupeRelatedItems(items).slice(0, 4);
}

function relatedGuidesBySlugs(guideSlugs: string[], locale: Locale, excludeSlug?: string): RelatedContentItem[] {
  const items = guideSlugs
    .filter((slug) => slug !== excludeSlug)
    .map((slug) => getCareerGuideBySlug(slug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((guide) =>
      toRelatedItem(
        guide.slug,
        guide.title,
        localizedPath(`/career/guides/${guide.slug}`, locale),
        guide.summary
      )
    );

  return dedupeRelatedItems(items).slice(0, 4);
}

export function listRelatedArticlesForPost(post: LocalizedBlogPost, locale: Locale): RelatedContentItem[] {
  return relatedArticlesForTestSlugs([post.related_test_slug], locale, post.slug);
}

export function listRelatedCareerGuidesForPost(post: LocalizedBlogPost, locale: Locale): RelatedContentItem[] {
  const guideSlugs = TEST_TO_CAREER_GUIDE_SLUGS[post.related_test_slug] ?? [];
  return relatedGuidesBySlugs(guideSlugs, locale);
}

export function listRelatedArticlesForGuide(guide: LocalizedCareerGuide, locale: Locale): RelatedContentItem[] {
  const testSlugs = GUIDE_TO_TEST_SLUGS[guide.slug] ?? [];
  return relatedArticlesForTestSlugs(testSlugs, locale);
}
