import { afterEach, describe, expect, it } from "vitest";
import { gta6GuideMetadata } from "@/components/questionnaires/Gta6Guide";
import { gta6LandingMetadata } from "@/components/questionnaires/Gta6Landing";
import { isMissingFunRoute } from "@/lib/entertainment/routing";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";
import { gta6LandingPath, gta6Profiles, gta6ResultPath, gta6TakePath, isGta6PublicPath } from "@/lib/questionnaires/gta6CharacterQuiz";
import { vi } from "vitest";

describe("GTA 6 published URL contract", () => {
  afterEach(() => vi.unstubAllEnvs());

  it.each(["en", "zh", "zh-TW"] as const)("admits the full %s product and keeps query canonicals clean in production", (locale) => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    const landing = gta6LandingPath(locale);
    expect(isGta6PublicPath(landing)).toBe(true);
    expect(traditionalPath(landing)).toBe(gta6LandingPath("zh-TW"));
    expect(traditionalPath(gta6TakePath(locale))).toBe(gta6TakePath("zh-TW"));
    expect(isMissingFunRoute(landing)).toBe(false);
    expect(isGta6PublicPath(gta6TakePath(locale))).toBe(true);
    expect(isMissingFunRoute(gta6TakePath(locale))).toBe(false);
    expect(gta6LandingMetadata(locale, false).robots).toEqual({ index: true, follow: true });
    expect(gta6LandingMetadata(locale, true)).toMatchObject({
      robots: { index: false, follow: true },
      alternates: { canonical: landing },
    });
    for (const profile of gta6Profiles) {
      const path = gta6ResultPath(locale, profile.id);
      expect(isGta6PublicPath(path)).toBe(true);
      expect(traditionalPath(path)).toBe(gta6ResultPath("zh-TW", profile.id));
      expect(isMissingFunRoute(path)).toBe(false);
      expect(gta6GuideMetadata(locale, profile, false).robots).toEqual({ index: true, follow: true });
      expect(gta6GuideMetadata(locale, profile, true)).toMatchObject({
        robots: { index: false, follow: true },
        alternates: { canonical: path },
      });
    }
    const unknownProfile = gta6ResultPath(locale, "unknown-profile");
    expect(isGta6PublicPath(unknownProfile)).toBe(false);
    expect(traditionalPath(unknownProfile)).toBeNull();
  });

  it("keeps a staging build out of the search index", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://staging.fermatmind.com");
    expect(gta6LandingMetadata("zh", false).robots).toEqual({ index: false, follow: false });
    expect(gta6GuideMetadata("zh-TW", gta6Profiles[0], false).robots).toEqual({ index: false, follow: false });
  });
});
