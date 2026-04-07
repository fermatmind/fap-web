import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildMbtiEntryHref } from "@/lib/mbti/entryTracking";

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function count(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

describe("mbti entry surface contract", () => {
  it("wires topic detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain("const isMbtiTopic =");
    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain("{isMbtiTopic ? <AnalyticsPageViewTracker");
    expect(source).toContain('entrySurface: "mbti_topic_detail"');
    expect(source).toContain('sourcePageType: "topic_detail"');
    expect(source).toContain('data-testid="mbti-topic-detail-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-topic-detail-primary-cta"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-topic-detail-primary-cta"')).toBe(1);
  });

  it("wires topic index with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/topics/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('entrySurface: "mbti_topic_index"');
    expect(source).toContain('sourcePageType: "topic_index"');
    expect(source).toContain('data-testid="mbti-topics-index-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-topics-index-primary-cta"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-topics-index-primary-cta"')).toBe(1);
  });

  it("wires personality index with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/personality/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('entrySurface: "mbti_personality_index"');
    expect(source).toContain('sourcePageType: "personality_index"');
    expect(source).toContain('data-testid="mbti-personality-index-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-personality-index-primary-cta"');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-personality-index-primary-cta"')).toBe(1);
  });

  it("wires personality detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('entrySurface: "mbti_personality_detail"');
    expect(source).toContain('data-testid="mbti-personality-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-personality-primary-cta"');
    expect(source).toContain('data-testid="mbti-personality-content-pack"');
    expect(source).toContain('mbti-personality-scene-career');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-personality-primary-cta"')).toBe(1);
  });

  it("wires career recommendation detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('entrySurface: "mbti_career_recommendation_detail"');
    expect(source).toContain('data-testid="mbti-career-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-career-primary-cta"');
    expect(source).toContain('career-recommendation-type-interpretation');
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-career-primary-cta"')).toBe(1);
  });

  it("keeps scene entry skeleton on mbti detail and landing surfaces", () => {
    const topicDetail = read("app/(localized)/[locale]/topics/[slug]/page.tsx");
    const personalityDetail = read("app/(localized)/[locale]/personality/[type]/page.tsx");
    const recommendationDetail = read("app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx");
    const testLanding = read("app/(localized)/[locale]/tests/[slug]/page.tsx");

    expect(topicDetail).toContain("topic-detail-scene-entry");
    expect(personalityDetail).toContain("personality-detail-scene-entry");
    expect(recommendationDetail).toContain("career-recommendation-scene-entry");
    expect(testLanding).toContain("mbti-test-landing-scene-entry");
    expect(testLanding).toContain("showsMbtiActions ? (");
  });

  it("keeps the mbti topic hub as a lightweight type continuation grid", () => {
    const source = read("app/(localized)/[locale]/topics/[slug]/page.tsx");

    expect(source).toContain('data-testid="mbti-topic-type-grid"');
    expect(source).toContain("MBTI_TYPE_GROUPS");
    expect(source).toContain("typeCode.toLowerCase()}-a");
    expect(source).toContain("MBTI type continue grid");
  });

  it("expands mbti entry tracking surfaces for topic/index/scene attribution", () => {
    const source = read("lib/mbti/entryTracking.ts");

    expect(source).toContain('"mbti_topic_detail"');
    expect(source).toContain('"mbti_topic_index"');
    expect(source).toContain('"mbti_personality_index"');
    expect(source).toContain('"mbti_scene_block"');
    expect(source).toContain('"topic_detail"');
    expect(source).toContain('"topic_index"');
    expect(source).toContain('"personality_index"');
    expect(source).toContain('"scene_block"');
  });

  it("builds executable mbti take hrefs with entry attribution query", () => {
    const href = buildMbtiEntryHref({
      locale: "zh",
      testSlug: "mbti-personality-test-16-personality-types",
      formCode: "mbti_144",
      entrySurface: "mbti_personality_detail",
      sourcePageType: "personality_detail",
      targetAction: "start_mbti_test_primary",
      sourcePath: "/zh/personality/intj-a",
    });

    expect(href.startsWith("/zh/tests/mbti-personality-test-16-personality-types/take?")).toBe(true);
    expect(href).toContain("form=mbti_144");
    expect(href).toContain("entry_surface=mbti_personality_detail");
    expect(href).toContain("source_page_type=personality_detail");
    expect(href).toContain("target_action=start_mbti_test_primary");
    expect(href).toContain("landing_path=%2Fzh%2Fpersonality%2Fintj-a");
  });
});
