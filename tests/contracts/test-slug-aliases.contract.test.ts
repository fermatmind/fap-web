import { SCALE_CANONICAL_SLUG_MAP, normalizeSupportedScaleCode, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { getTestBySlug } from "@/lib/content";
import { isLegacyAliasSlug, isLegacyPath, resolveLegacyPathMode } from "@/lib/legacyCompatibility";

describe("test slug alias contracts", () => {
  it("resolves all legacy slugs to canonical slugs", () => {
    const cases: Array<[string, string]> = [
      ["mbti-test", SCALE_CANONICAL_SLUG_MAP.MBTI],
      ["personality-mbti-test", SCALE_CANONICAL_SLUG_MAP.MBTI],
      ["big5-ocean", SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN],
      ["big-five-personality-test", SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN],
      ["clinical-combo-68", SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68],
      ["depression-anxiety-combo", SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68],
      ["sds-20", SCALE_CANONICAL_SLUG_MAP.SDS_20],
      ["zung-self-rating-depression-scale", SCALE_CANONICAL_SLUG_MAP.SDS_20],
      ["iq-test", SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN],
      ["iq_raven", SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN],
      ["eq-test", SCALE_CANONICAL_SLUG_MAP.EQ_60],
      ["emotional-intelligence-test", SCALE_CANONICAL_SLUG_MAP.EQ_60],
    ];

    for (const [legacy, canonical] of cases) {
      expect(resolveCanonicalSlug(legacy)).toBe(canonical);
    }
  });

  it("maps canonical slugs to content entries through getTestBySlug", () => {
    const aliases = [
      "mbti-test",
      "big5-ocean",
      "clinical-combo-68",
      "sds-20",
      "iq-test",
      "eq-test",
    ];

    for (const alias of aliases) {
      const test = getTestBySlug(alias);
      expect(test).toBeTruthy();
      expect(test?.slug).toBe(resolveCanonicalSlug(alias));
    }
  });

  it("normalizes supported scale codes for six-model rollout", () => {
    expect(normalizeSupportedScaleCode("mbti")).toBe("MBTI");
    expect(normalizeSupportedScaleCode("BIG5_OCEAN")).toBe("BIG5_OCEAN");
    expect(normalizeSupportedScaleCode("clinical_combo_68")).toBe("CLINICAL_COMBO_68");
    expect(normalizeSupportedScaleCode("sds_20")).toBe("SDS_20");
    expect(normalizeSupportedScaleCode("IQ_RAVEN")).toBe("IQ_RAVEN");
    expect(normalizeSupportedScaleCode("eq_60")).toBe("EQ_60");
    expect(normalizeSupportedScaleCode("DISC")).toBeNull();
  });

  it("detects legacy path and alias boundaries", () => {
    expect(isLegacyPath("/test")).toBe(true);
    expect(isLegacyPath("/test/mbti-test")).toBe(true);
    expect(isLegacyPath("/quiz")).toBe(false);
    expect(isLegacyPath("/quiz/mbti-test")).toBe(true);
    expect(isLegacyPath("/tests/mbti-personality-test-16-personality-types")).toBe(false);

    expect(isLegacyAliasSlug("mbti-test")).toBe(true);
    expect(isLegacyAliasSlug("big5-ocean")).toBe(true);
    expect(isLegacyAliasSlug("mbti-personality-test-16-personality-types")).toBe(false);
  });

  it("parses legacy path mode safely", () => {
    expect(resolveLegacyPathMode({ FAP_LEGACY_PATH_MODE: "redirect" })).toBe("redirect");
    expect(resolveLegacyPathMode({ FAP_LEGACY_PATH_MODE: "gone" })).toBe("gone");
    expect(resolveLegacyPathMode({ FAP_LEGACY_PATH_MODE: "unknown" })).toBe("redirect");
    expect(resolveLegacyPathMode({})).toBe("redirect");
  });
});
