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
