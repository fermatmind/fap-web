import { blog, tests, types } from "../.velite";

export type Test = (typeof tests)[number];
export type TestType = (typeof types)[number];
export type BlogPost = (typeof blog)[number];

export type TestListItem = {
  title: string;
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
};

export function getAllTests(): TestListItem[] {
  return [...tests]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((test) => ({
      title: test.title,
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
    }));
}

export function getTestBySlug(slug: string): Test | null {
  return tests.find((test) => test.slug === slug) ?? null;
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
