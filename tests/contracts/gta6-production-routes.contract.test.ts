import { existsSync } from "node:fs";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { gta6GuideMetadata } from "@/components/questionnaires/Gta6Guide";
import { Gta6Landing, gta6LandingMetadata } from "@/components/questionnaires/Gta6Landing";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import editorial from "@/lib/questionnaires/gta-6-landing.json";
import { buildCompletePublicSitemapEntries } from "@/lib/seo/publicSitemap";
import { gta6LandingPath, gta6Portrait, gta6Profiles, gta6ResultPath, gta6TakePath, isGta6PublicPath } from "@/lib/questionnaires/gta6CharacterQuiz";
import { vi } from "vitest";

const locales = ["en", "zh", "zh-TW"] as const;

describe("GTA 6 published URL contract", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(locales)("admits the full %s product and keeps query canonicals clean in production", (locale) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const landing = gta6LandingPath(locale);
    expect(isGta6PublicPath(landing)).toBe(true);
    expect(traditionalPath(landing)).toBe(gta6LandingPath("zh-TW"));
    expect(traditionalPath(gta6TakePath(locale))).toBe(gta6TakePath("zh-TW"));
    expect(isMissingFunRoute(landing)).toBe(false);
    expect(isGta6PublicPath(gta6TakePath(locale))).toBe(true);
    expect(isMissingFunRoute(gta6TakePath(locale))).toBe(false);
    expect(gta6LandingMetadata(locale, false)).toMatchObject({
      robots: { index: true, follow: true },
      alternates: {
        canonical: landing,
        languages: { en: gta6LandingPath("en"), "zh-CN": gta6LandingPath("zh"), "zh-TW": gta6LandingPath("zh-TW"), "x-default": gta6LandingPath("en") },
      },
    });
    expect(gta6LandingMetadata(locale, false).alternates?.languages).not.toHaveProperty("zh-Hans");
    expect(gta6LandingMetadata(locale, true)).toMatchObject({
      robots: { index: false, follow: true },
      alternates: { canonical: landing },
    });
    for (const profile of gta6Profiles) {
      const path = gta6ResultPath(locale, profile.id);
      expect(isGta6PublicPath(path)).toBe(true);
      expect(traditionalPath(path)).toBe(gta6ResultPath("zh-TW", profile.id));
      expect(isMissingFunRoute(path)).toBe(false);
      expect(gta6GuideMetadata(locale, profile, false)).toMatchObject({
        robots: { index: true, follow: true },
        alternates: {
          canonical: path,
          languages: {
            en: gta6ResultPath("en", profile.id),
            "zh-CN": gta6ResultPath("zh", profile.id),
            "zh-TW": gta6ResultPath("zh-TW", profile.id),
            "x-default": gta6ResultPath("en", profile.id),
          },
        },
      });
      expect(gta6GuideMetadata(locale, profile, false).alternates?.languages).not.toHaveProperty("zh-Hans");
      expect(gta6GuideMetadata(locale, profile, true)).toMatchObject({
        robots: { index: false, follow: true },
        alternates: { canonical: path },
      });
    }
    const unknownProfile = gta6ResultPath(locale, "unknown-profile");
    expect(isGta6PublicPath(unknownProfile)).toBe(false);
    expect(traditionalPath(unknownProfile)).toBeNull();
  });

  it("adds exactly the 27 clean canonical pages to the complete public sitemap", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const actual = buildCompletePublicSitemapEntries([])
      .map(entry => entry.loc)
      .filter(url => url.includes("/gta-6-character-quiz"))
      .sort();
    const expected = locales.flatMap(locale => [
      gta6LandingMetadata(locale, false).alternates?.canonical,
      ...gta6Profiles.map(profile => gta6GuideMetadata(locale, profile, false).alternates?.canonical),
    ]).map(path => `https://fermatmind.com${path}`).sort();
    expect(actual).toHaveLength(27);
    expect(actual).toEqual(expected);
  });

  it.each(locales)("renders matching %s summaries and portraits on each crawlable guide card", (locale) => {
    const page = new DOMParser().parseFromString(renderToStaticMarkup(createElement(Gta6Landing, { locale })), "text/html");
    const cards = page.querySelectorAll<HTMLAnchorElement>("#characters a");
    expect(cards).toHaveLength(8);
    expect(Object.keys(editorial[locale].guide).sort()).toEqual(gta6Profiles.map(profile => profile.id).sort());
    for (const profile of gta6Profiles) {
      const card = [...cards].find(link => link.getAttribute("href") === gta6ResultPath(locale, profile.id));
      const guide = editorial[locale].guide;
      const portrait = gta6Portrait(profile.id);
      expect(card?.querySelector("p")?.textContent).toBe(guide[profile.id as keyof typeof guide]);
      expect(card?.querySelector("img")?.getAttribute("src")).toBe(portrait);
      expect(existsSync(`public${portrait}`)).toBe(true);
    }
    expect(page.querySelectorAll("#examples img")).toHaveLength(7);
  });

  it("keeps a staging build out of the search index", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    expect(gta6LandingMetadata("zh", false).robots).toEqual({ index: false, follow: false });
    expect(gta6GuideMetadata("zh-TW", gta6Profiles[0], false).robots).toEqual({ index: false, follow: false });
  });
});
