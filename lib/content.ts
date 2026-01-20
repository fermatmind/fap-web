import { blogPosts, tests, types } from "../.velite";

export type Test = (typeof tests)[number];
export type TestFaq = Test["faq"][number];
export type TestType = (typeof types)[number];
export type BlogPost = (typeof blogPosts)[number];

export function listTests(): Test[] {
  return [...tests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
  return [...blogPosts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) ?? null;
}
