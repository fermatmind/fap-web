import { describe, expect, it } from "vitest";
import {
  isEnneagramPrivateEnvelopeLocaleCompatible,
  isEnneagramPrivateResultLocaleCompatible,
  isEnneagramPrivateSurfaceLocaleCompatible,
  isSafeEnneagramPrivateText,
  readEnneagramPrivateLocalizedText,
} from "@/lib/enneagram/privateResultLocale";

function createEnvelope(locale: "en" | "zh", slotLocale: "en" | "zh" = locale) {
  return {
    locale,
    enneagram_report_v2: {
      locale,
      modules: [{ content: { locale: slotLocale, body_en: "A bounded working interpretation." } }],
    },
  };
}

describe("W5 Enneagram private-result locale boundary", () => {
  it("accepts only matching API envelope and slot locales", () => {
    expect(isEnneagramPrivateResultLocaleCompatible(createEnvelope("en"), "en")).toBe(true);
    expect(isEnneagramPrivateResultLocaleCompatible(createEnvelope("en", "zh"), "en")).toBe(false);
    expect(isEnneagramPrivateResultLocaleCompatible(createEnvelope("zh"), "en")).toBe(false);
  });

  it("rejects CJK text and zh-CN slots on English private surfaces", () => {
    expect(isSafeEnneagramPrivateText("当前更接近 Type 1", "en")).toBe(false);
    expect(isEnneagramPrivateEnvelopeLocaleCompatible({ locale: "zh-CN" }, "en")).toBe(false);
    expect(isEnneagramPrivateSurfaceLocaleCompatible({ locale: "en", text: "中文残留" }, "en")).toBe(false);
    expect(readEnneagramPrivateLocalizedText({ locale: "zh-CN", body_zh: "中文 slot" }, "body", "en")).toBeNull();
    expect(
      isEnneagramPrivateResultLocaleCompatible(
        {
          locale: "en",
          enneagram_report_v2: {
            locale: "en",
            modules: [{ content: { locale: "en", body_en: "English copy", legacy_note: "中文残留" } }],
          },
        },
        "en"
      )
    ).toBe(false);
  });

  it("never translates a missing English slot on the frontend", () => {
    expect(readEnneagramPrivateLocalizedText({ locale: "en", body_zh: "中文 slot" }, "body", "en")).toBeNull();
  });
});
