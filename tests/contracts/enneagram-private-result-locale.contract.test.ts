import { describe, expect, it } from "vitest";
import {
  isEnneagramPrivateEnvelopeLocaleCompatible,
  isEnneagramPrivateResultContractInvalid,
  isEnneagramPrivateResultLocaleCompatible,
  isEnneagramPrivateSurfaceLocaleCompatible,
  isSafeEnneagramPrivateText,
  readEnneagramPrivateLocalizedText,
} from "@/lib/enneagram/privateResultLocale";
import type { ReportResponse } from "@/lib/api/v0_3";
import { bindCanonicalEnneagramReport } from "@/tests/contracts/helpers/enneagramCanonicalAuthority";

function createEnvelope(locale: "en" | "zh", slotLocale: "en" | "zh" = locale) {
  return {
    locale,
    enneagram_report_v2: {
      locale,
      schema_version: "enneagram.report.v2",
      scale_code: "ENNEAGRAM",
      registry: {},
      provenance: {},
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

  it("requires every Enneagram response not explicitly generating to carry a valid localized V2", () => {
    const valid = bindCanonicalEnneagramReport({
      ...createEnvelope("en"),
      scale_code: "ENNEAGRAM",
      generating: false,
    } as ReportResponse, "en");

    expect(isEnneagramPrivateResultContractInvalid(valid, "en")).toBe(false);
    expect(isEnneagramPrivateResultContractInvalid(valid, "zh")).toBe(true);
    expect(isEnneagramPrivateResultContractInvalid({ ...valid, generating: true }, "en")).toBe(false);
    expect(isEnneagramPrivateResultContractInvalid({ ...valid, generating: undefined }, "en")).toBe(false);
    expect(isEnneagramPrivateResultContractInvalid({ ...valid, enneagram_report_v2: undefined }, "en")).toBe(true);
    expect(
      isEnneagramPrivateResultContractInvalid(
        { ...valid, generating: undefined, enneagram_report_v2: { locale: "en", pages: [] } },
        "en"
      )
    ).toBe(true);
  });
});
