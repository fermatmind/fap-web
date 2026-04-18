import { defineCollection, defineConfig, s } from "velite";

const tests = defineCollection({
  name: "Test",
  pattern: "tests/**/*.mdx",
  schema: s.object({
    title: s.string(),
    title_i18n: s.record(s.string(), s.string()).optional(),
    slug: s.string(),
    description: s.string(),
    cover_image: s.string(),
    questions_count: s.number(),
    time_minutes: s.number(),
    scale_code: s.string().optional(),
    card_visual: s.string().optional(),
    card_tone: s.string().optional(),
    card_seed: s.string().optional(),
    card_density: s.string().optional(),
    card_tagline_i18n: s.record(s.string(), s.string()).optional(),
    highlight_priority: s.number().optional(),
    highlight_rating: s.number().optional(),
    highlight_excerpt_i18n: s.record(s.string(), s.string()).optional(),
    highlight_seo_copy_i18n: s.record(s.string(), s.string()).optional(),
    last_updated: s.string().optional(),
    updated_at: s.string().optional(),
    body: s.mdx(),
  }),
});

const types = defineCollection({
  name: "Type",
  pattern: "types/**/*.mdx",
  schema: s.object({
    code: s.string(),
    name: s.string(),
    description: s.string(),
    updatedAt: s.string().optional(),
    traits: s.array(s.string()).optional(),
    body: s.mdx(),
  }),
});

const blog = defineCollection({
  name: "BlogPost",
  pattern: "blog/**/*.mdx",
  schema: s.object({
    locale: s.enum(["en", "zh"]).optional(),
    translation_group: s.string().optional(),
    slug: s.string(),
    title: s.string(),
    summary: s.string(),
    seo_title: s.string().optional(),
    meta_description: s.string().optional(),
    excerpt: s.string().optional(),
    publishedAt: s.string().optional(),
    updatedAt: s.string(),
    author: s.string().optional(),
    citations: s.array(s.string()).optional(),
    translation_ready: s.boolean().optional(),
    related_test_slug: s.string().optional(),
    voice: s.enum(["tool", "growth", "narrative", "editorial"]),
    voice_order: s.number().optional(),
    tags: s.array(s.string()).optional(),
    categories: s.array(s.string()).optional(),
    cover_image: s.string().optional(),
    cover_image_alt: s.string().optional(),
    cover_image_prompt: s.string().optional(),
    cover_image_style_tag: s.string().optional(),
    publish_status: s.string().optional(),
    canonical_topic: s.string().optional(),
    article_series: s.string().optional(),
    body: s.mdx(),
  }),
});

const careerJobs = defineCollection({
  name: "CareerJob",
  pattern: "career/jobs/**/*.mdx",
  schema: s.object({
    slug: s.string(),
    locale: s.enum(["en", "zh"]).optional(),
    title: s.string(),
    summary: s.string(),
    industry_slug: s.string(),
    salary_range: s.string(),
    job_outlook: s.string(),
    skills: s.array(s.string()),
    work_contents: s.array(s.string()),
    growth_path: s.array(s.string()),
    fit_personality: s.array(s.string()),
    mbti_primary: s.array(s.string()),
    mbti_secondary: s.array(s.string()),
    riasec_vector: s.record(s.string(), s.number()),
    big5_targets: s.record(s.string(), s.record(s.string(), s.number())),
    iq_range: s.object({
      min: s.number(),
      max: s.number(),
    }),
    eq_range: s.object({
      min: s.number(),
      max: s.number(),
    }),
    market_demand: s.number(),
    updatedAt: s.string().optional(),
    body: s.mdx(),
  }),
});

const careerIndustries = defineCollection({
  name: "CareerIndustry",
  pattern: "career/industries/**/*.mdx",
  schema: s.object({
    slug: s.string(),
    locale: s.enum(["en", "zh"]).optional(),
    title: s.string(),
    summary: s.string(),
    overview: s.string(),
    hot_jobs: s.array(s.string()),
    salary_overview: s.string(),
    growth_outlook: s.string(),
    trends: s.array(s.string()),
    updatedAt: s.string().optional(),
    body: s.mdx(),
  }),
});

const careerGuides = defineCollection({
  name: "CareerGuide",
  pattern: "career/guides/**/*.mdx",
  schema: s.object({
    slug: s.string(),
    locale: s.enum(["en", "zh"]).optional(),
    title: s.string(),
    summary: s.string(),
    category: s.string(),
    related_job_slugs: s.array(s.string()).optional(),
    related_industry_slugs: s.array(s.string()).optional(),
    publishedAt: s.string(),
    updatedAt: s.string(),
    body: s.mdx(),
  }),
});

const careerRecommendationProfiles = defineCollection({
  name: "CareerRecommendationProfile",
  pattern: "career/recommendations/**/*.mdx",
  schema: s.object({
    locale: s.enum(["en", "zh"]).optional(),
    profile_type: s.enum(["mbti", "big5"]),
    key: s.string(),
    band: s.enum(["high", "balanced", "low"]).optional(),
    title: s.string(),
    summary: s.string(),
    recommended_jobs: s.array(s.string()),
    avoid_jobs: s.array(s.string()).optional(),
    work_env: s.string(),
    strengths: s.array(s.string()),
    risks: s.array(s.string()),
    updatedAt: s.string().optional(),
    body: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
  },
  collections: { tests, types, blog, careerJobs, careerIndustries, careerGuides, careerRecommendationProfiles },
});
