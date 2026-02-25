import {
  buildRequestScaleCodeCandidates,
  resolveAcceptLegacyScaleCode,
  resolveScaleCodeMode,
  toScaleCodeV1,
  toScaleCodeV2,
} from "@/lib/scaleCodeMode";

describe("scale code mode contract", () => {
  const originalMode = process.env.NEXT_PUBLIC_SCALE_CODE_MODE;
  const originalAcceptLegacy = process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE;

  afterEach(() => {
    if (typeof originalMode === "undefined") {
      delete process.env.NEXT_PUBLIC_SCALE_CODE_MODE;
    } else {
      process.env.NEXT_PUBLIC_SCALE_CODE_MODE = originalMode;
    }

    if (typeof originalAcceptLegacy === "undefined") {
      delete process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE;
    } else {
      process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE = originalAcceptLegacy;
    }
  });

  it("defaults to legacy mode and accepts legacy codes", () => {
    delete process.env.NEXT_PUBLIC_SCALE_CODE_MODE;
    delete process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE;

    expect(resolveScaleCodeMode()).toBe("legacy");
    expect(resolveAcceptLegacyScaleCode()).toBe(true);
    expect(buildRequestScaleCodeCandidates("MBTI")).toEqual(["MBTI"]);
  });

  it("supports dual mode with v2 first and legacy fallback", () => {
    process.env.NEXT_PUBLIC_SCALE_CODE_MODE = "dual";
    process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE = "true";

    expect(buildRequestScaleCodeCandidates("MBTI")).toEqual(["MBTI_PERSONALITY_TEST_16_TYPES", "MBTI"]);
    expect(buildRequestScaleCodeCandidates("mbti_personality_test_16_types")).toEqual([
      "MBTI_PERSONALITY_TEST_16_TYPES",
      "MBTI",
    ]);
  });

  it("supports v2 mode without legacy fallback", () => {
    process.env.NEXT_PUBLIC_SCALE_CODE_MODE = "v2";
    process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE = "false";

    expect(buildRequestScaleCodeCandidates("BIG5_OCEAN")).toEqual(["BIG_FIVE_OCEAN_MODEL"]);
    expect(buildRequestScaleCodeCandidates("BIG_FIVE_OCEAN_MODEL")).toEqual(["BIG_FIVE_OCEAN_MODEL"]);
  });

  it("keeps unknown scale code stable without duplicate candidates", () => {
    process.env.NEXT_PUBLIC_SCALE_CODE_MODE = "dual";
    process.env.NEXT_PUBLIC_ACCEPT_LEGACY_SCALE_CODE = "true";

    expect(buildRequestScaleCodeCandidates("CUSTOM_SCALE_X")).toEqual(["CUSTOM_SCALE_X"]);
  });

  it("converts between v1 and v2 scale codes", () => {
    expect(toScaleCodeV1("MBTI_PERSONALITY_TEST_16_TYPES")).toBe("MBTI");
    expect(toScaleCodeV2("MBTI")).toBe("MBTI_PERSONALITY_TEST_16_TYPES");
    expect(toScaleCodeV1("EQ_EMOTIONAL_INTELLIGENCE")).toBe("EQ_60");
    expect(toScaleCodeV2("EQ_60")).toBe("EQ_EMOTIONAL_INTELLIGENCE");
  });
});
