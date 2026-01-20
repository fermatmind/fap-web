import { defineCollection, defineConfig, s } from "velite";

const tests = defineCollection({
  name: "tests",
  pattern: "tests/*.mdx",
  schema: s.object({
    slug: s.string(),
    title: s.string(),
    description: s.string(),
    category: s.string(),
    estTime: s.string(),
    questionCount: s.number(),
    updatedAt: s.string(),
    faq: s.array(
      s.object({
        question: s.string(),
        answer: s.string(),
      })
    ),
    tags: s.array(s.string()).optional(),
    reviewedBy: s.string().optional(),
    relatedTests: s.array(s.string()).optional(),
    relatedTypes: s.array(s.string()).optional(),
    hero: s
      .object({
        title: s.string().optional(),
        subtitle: s.string().optional(),
        image: s.string().optional(),
      })
      .optional(),
    body: s.mdx(),
  }),
});

const types = defineCollection({
  name: "types",
  pattern: "types/*.mdx",
  schema: s.object({
    code: s.string(),
    name: s.string(),
    description: s.string(),
    updatedAt: s.string().optional(),
    traits: s.array(s.string()).optional(),
    body: s.mdx(),
  }),
});

const blogPosts = defineCollection({
  name: "blogPosts",
  pattern: "blog/*.mdx",
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
  collections: { tests, types, blogPosts },
});
