import { describe, expect, it } from "vitest";
import { resolveTraditionalSwitchHref } from "@/components/i18n/useLocaleSwitchHref";
import { normalizeTraditionalPersonalityLanguageAlternates } from "@/lib/personality/traditionalLanguageAlternates";
import { withTraditionalPersonalityLanguageAlternates } from "@/lib/seo/personalityLanguageAlternates";

const paths = {
  en: "/en/personality/intj",
  "zh-CN": "/zh/personality/intj",
  "zh-TW": "/zh-TW/personality/intj",
} as const;

function metadata(canonical: string, alternates: Record<string, string>): HTMLElement {
  const head = document.createElement("head");
  const canonicalLink = document.createElement("link");
  canonicalLink.rel = "canonical";
  canonicalLink.href = "https://fermatmind.com" + canonical;
  head.append(canonicalLink);
  for (const [locale, href] of Object.entries(alternates)) {
    const alternate = document.createElement("link");
    alternate.rel = "alternate";
    alternate.hreflang = locale;
    alternate.href = href.startsWith("/") ? "https://fermatmind.com" + href : href;
    head.append(alternate);
  }
  return head;
}

describe("Traditional personality language relations", () => {
  it("requires three same-identity paths from native authority", () => {
    expect(normalizeTraditionalPersonalityLanguageAlternates(paths, paths.en)).toEqual(paths);
    expect(normalizeTraditionalPersonalityLanguageAlternates({ ...paths, "zh-TW": "/zh-TW/personality/intp" }, paths.en)).toBeUndefined();
    expect(normalizeTraditionalPersonalityLanguageAlternates(paths, "/en/personality/intj?x=1")).toBeUndefined();
  });

  it("adds reciprocal SEO links and preserves x-default and noindex behavior", () => {
    const input = { alternates: { canonical: paths.en, languages: { "x-default": "/" } } };
    const actual = withTraditionalPersonalityLanguageAlternates(input, paths);
    expect(actual.alternates?.canonical).toBe(paths.en);
    expect(actual.alternates?.languages).toMatchObject({ "x-default": "/", "zh-TW": expect.stringMatching(/\/zh-TW\/personality\/intj$/) });
    const held = { ...input, robots: { index: false } };
    expect(withTraditionalPersonalityLanguageAlternates(held, paths)).toBe(held);
  });

  it("only switches to the currently rendered, owned counterpart", () => {
    expect(resolveTraditionalSwitchHref(paths.en, metadata(paths.en, paths))).toBe(paths["zh-TW"]);
    expect(resolveTraditionalSwitchHref(paths["zh-CN"], metadata(paths["zh-CN"], paths))).toBe(paths["zh-TW"]);
    for (const head of [
      metadata(paths.en, { en: paths.en, "zh-CN": paths["zh-CN"] }),
      metadata("/en/personality/intp", paths),
      metadata(paths.en, { ...paths, "zh-TW": "https://other.example/zh-TW/personality/intj" }),
      metadata(paths.en, { ...paths, "zh-TW": paths["zh-TW"] + "?private=1" }),
    ]) expect(resolveTraditionalSwitchHref(paths.en, head)).toBe("/zh-TW/tests");
  });
});
