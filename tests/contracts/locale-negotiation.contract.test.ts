import { describe, expect, it } from "vitest";
import { resolvePreferredLocale } from "@/lib/i18n/localeNegotiation";

describe("locale negotiation contract", () => {
  it("falls back to accept-language when locale cookie is missing", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: null,
        acceptLanguage: "zh-CN,zh;q=0.9,en;q=0.8",
      })
    ).toBe("zh");
  });

  it("uses cookie locale when present", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: "en",
        acceptLanguage: "zh-CN,zh;q=0.9",
      })
    ).toBe("en");
  });

  it("forces chinese when the request country is mainland china", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: "en",
        acceptLanguage: "en-US,en;q=0.9",
        countryCode: "CN",
      })
    ).toBe("zh");
  });

  it("falls back to default locale when no signals are available", () => {
    expect(
      resolvePreferredLocale({
        cookieLocale: null,
        acceptLanguage: null,
      })
    ).toBe("en");
  });
});
