import { describe, expect, it } from "vitest";
import { listBlogPosts, listBlogPostsGroupedByTest, listRelatedBlogPosts } from "@/lib/content";

const EXPECTED_PLACEMENT: Record<string, [string, string, string]> = {
  "mbti-personality-test-16-personality-types": [
    "mbti-basics",
    "mbti-growth-guide",
    "mbti-narrative-portrait",
  ],
  "big-five-personality-test-ocean-model": [
    "big-five-tool-guide",
    "big-five-growth-guide",
    "big-five-narrative-portrait",
  ],
  "clinical-depression-anxiety-assessment-professional-edition": [
    "clinical-depression-anxiety-pro-tool-guide",
    "clinical-depression-anxiety-pro-growth-guide",
    "clinical-depression-anxiety-pro-narrative-portrait",
  ],
  "depression-screening-test-standard-edition": [
    "depression-screening-standard-tool-guide",
    "depression-screening-standard-growth-guide",
    "depression-screening-standard-narrative-portrait",
  ],
  "iq-test-intelligence-quotient-assessment": [
    "iq-test-tool-guide",
    "iq-test-growth-guide",
    "iq-test-narrative-portrait",
  ],
  "eq-test-emotional-intelligence-assessment": [
    "eq-test-tool-guide",
    "eq-test-growth-guide",
    "eq-test-narrative-portrait",
  ],
};

describe("articles placement contract", () => {
  it("contains exactly 18 unique posts", () => {
    const posts = listBlogPosts();
    expect(posts).toHaveLength(18);

    const slugs = posts.map((post) => post.slug);
    expect(new Set(slugs).size).toBe(18);

    const expectedSlugs = Object.values(EXPECTED_PLACEMENT).flat().sort();
    expect([...slugs].sort()).toEqual(expectedSlugs);
  });

  it("groups posts into six tests with fixed 1-2-3 slot order", () => {
    const groups = listBlogPostsGroupedByTest();
    expect(groups).toHaveLength(6);

    const expectedTestSlugs = Object.keys(EXPECTED_PLACEMENT);
    expect(groups.map((group) => group.relatedTestSlug)).toEqual(expectedTestSlugs);

    for (const group of groups) {
      const expectedSlugs = EXPECTED_PLACEMENT[group.relatedTestSlug];
      expect(group.posts).toHaveLength(3);
      expect(group.posts.map((post) => post.slug)).toEqual(expectedSlugs);
      expect(group.posts.map((post) => post.voice_order)).toEqual([1, 2, 3]);
      expect(new Set(group.posts.map((post) => post.voice_order)).size).toBe(3);
    }
  });

  it("returns same ordered three related posts for each test detail placement", () => {
    for (const [testSlug, expectedSlugs] of Object.entries(EXPECTED_PLACEMENT)) {
      const related = listRelatedBlogPosts(testSlug);
      expect(related).toHaveLength(3);
      expect(related.map((post) => post.slug)).toEqual(expectedSlugs);
      expect(related.map((post) => post.voice_order)).toEqual([1, 2, 3]);
    }
  });
});
