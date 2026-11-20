import { resolveScaleRollout, createScaleRolloutEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { isPublicTestEntryVisible } from "@/lib/tests/publicTestEntryVisibility";
import { shouldIncludeInSitemap } from "@/lib/seo/indexingPolicy";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { JungResult } from "@/components/result/jung/JungResult";
import { appendFunSitemapEntries } from "@/lib/entertainment/sitemap";
import { normalizeSupportedScaleCode, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";

describe("Jung formal assessments", () => {
  it("keeps both versioned scale identities and removes old discovery entries", () => {
    expect(normalizeSupportedScaleCode("JUNG_ARCHETYPES")).toBe("JUNG_ARCHETYPES");
    expect(normalizeSupportedScaleCode("JUNG_COGNITIVE_FUNCTIONS")).toBe("JUNG_COGNITIVE_FUNCTIONS");
    expect(resolveCanonicalSlug("jung-archetypes")).toBe("jung-archetypes");
    expect(resolveCanonicalSlug("jung-cognitive-functions")).toBe("jung-cognitive-functions");
    expect(appendFunSitemapEntries([]).some(({ loc }) => /\/explore\/(jungian-archetype|cognitive-functions-test)(?:\/|$)/.test(loc))).toBe(false);
  });

  it("retires cognitive functions even when environment and backend flags enable it", () => {
    const decision = resolveScaleRollout({
      scaleCode: "JUNG_COGNITIVE_FUNCTIONS",
      capabilities: { enabled_in_prod: true, paywall_mode: "full" },
      envSnapshot: createScaleRolloutEnvSnapshot({ ENABLE_JUNG_COGNITIVE_FUNCTIONS: "true", ROLLOUT_PERCENT_JUNG_COGNITIVE_FUNCTIONS: "100" }),
    });
    expect(decision.assessmentEnabled).toBe(false);
    expect(decision.commerceEnabled).toBe(false);
    for (const slug of ["jung-cognitive-functions", "cognitive-functions-test"]) {
      expect(isPublicTestEntryVisible({ slug })).toBe(false);
    }
    for (const locale of ["zh", "en", "zh-TW"]) {
      expect(shouldIncludeInSitemap(`/${locale}/tests/jung-cognitive-functions`)).toBe(false);
    }
    expect(isPublicTestEntryVisible({ slug: "jung-archetypes" })).toBe(true);
    expect(resolveScaleRollout({ scaleCode: "JUNG_ARCHETYPES", envSnapshot: createScaleRolloutEnvSnapshot({}) }).assessmentEnabled).toBe(true);
  });

  it("renders separate axes and avoids a type claim for insufficient scores", () => {
    const scores = Object.fromEntries(["Ni", "Ne", "Ti", "Te", "Fi", "Fe", "Si", "Se"].map(key => [key, 50]));
    const html = renderToStaticMarkup(<JungResult scale="JUNG_COGNITIVE_FUNCTIONS" locale="en" payload={{
      scores, axes: [{ left: "Ni", right: "Se", difference: 0, lean: null }], candidates: [], stability: "insufficient",
    }} />);
    expect(html.match(/<meter /g)).toHaveLength(8);
    expect(html).toContain("Four function axes");
    expect(html).toContain("does not support a candidate list");
    expect(html).toContain("Reflecting on stressful situations");
    expect(html).not.toContain("Candidate dominant and auxiliary");
  });
});
