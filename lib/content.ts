import { blog, tests, types } from "../.velite";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";

export type Test = (typeof tests)[number];
export type TestType = (typeof types)[number];
export type BlogPost = (typeof blog)[number];
export type BlogVoice = "tool" | "growth" | "narrative";
export type BlogPostsGroup = {
  relatedTestSlug: string;
  posts: BlogPost[];
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

export function listBlogPosts(): BlogPost[] {
  return [...blog].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blog.find((post) => post.slug === slug) ?? null;
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

function resolveVoiceOrder(post: BlogPost): number {
  if (typeof post.voice_order === "number" && Number.isFinite(post.voice_order)) {
    return post.voice_order;
  }
  const fallback = BLOG_VOICE_ORDER[post.voice as BlogVoice];
  return typeof fallback === "number" ? fallback : Number.MAX_SAFE_INTEGER;
}

function sortBlogPostsForPlacement(posts: BlogPost[]): BlogPost[] {
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

export function listBlogPostsGroupedByTest(): BlogPostsGroup[] {
  const grouped = new Map<string, BlogPost[]>();
  for (const post of sortBlogPostsForPlacement(blog)) {
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

export function listRelatedBlogPosts(testSlug: string): BlogPost[] {
  return sortBlogPostsForPlacement(
    blog.filter((post) => post.related_test_slug === testSlug)
  ).slice(0, 3);
}
