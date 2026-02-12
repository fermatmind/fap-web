import { defineCollection, defineConfig, s } from "velite";

const tests = defineCollection({
  name: "Test",
  pattern: "tests/**/*.mdx",
  schema: s.object({
    title: s.string(),
    slug: s.string(),
    description: s.string(),
    cover_image: s.string(),
    questions_count: s.number(),
    time_minutes: s.number(),
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
    slug: s.string(),
    title: s.string(),
    summary: s.string(),
    updatedAt: s.string(),
    tags: s.array(s.string()).optional(),
    body: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
  },
  collections: { tests, types, blog },
});
