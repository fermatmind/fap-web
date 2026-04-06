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
  it("wires personality detail with one primary mbti CTA and entry tracking", () => {
    const source = read("app/(localized)/[locale]/personality/[type]/page.tsx");

    expect(source).toContain('<AnalyticsPageViewTracker eventName="landing_view"');
    expect(source).toContain('buildMbtiEntryTrackingPayload({');
    expect(source).toContain('entrySurface: "mbti_personality_detail"');
    expect(source).toContain('data-testid="mbti-personality-entry-cta-group"');
    expect(source).toContain('data-testid="mbti-personality-primary-cta"');
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
    expect(source).toContain('targetAction: "start_mbti_test_primary"');
    expect(source).toContain('TrackedEntryCtaLink');
    expect(source).toContain('buildMbtiEntryHref({');
    expect(count(source, 'data-testid="mbti-career-primary-cta"')).toBe(1);
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
