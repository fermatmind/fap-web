import { appliedProfiles } from "./applied";
import { coreProfiles } from "./core";
import { traitProfiles } from "./traits";
import type { LocalizedLandingKind, LocalizedLandingLocale, LocalizedLandingProfile } from "./types";
import { findTrioKind } from "../trioLanding";
import { SCALE_CANONICAL_SLUG_MAP as slugs } from "@/lib/assessmentSlugMap";

export function assessmentLandingKind(slug: string): LocalizedLandingKind | null {
  if (slug === slugs.MBTI) return "mbti";
  if (slug === slugs.RIASEC) return "holland";
  return findTrioKind(slug);
}

export function getLocalizedLanding(locale: LocalizedLandingLocale, kind: LocalizedLandingKind): LocalizedLandingProfile {
  if (kind === "mbti" || kind === "holland" || kind === "career") return coreProfiles[locale][kind];
  if (kind === "big5" || kind === "iq" || kind === "enneagram") return traitProfiles[locale][kind];
  return appliedProfiles[locale][kind];
}

export const assessmentLandingPaths: Record<LocalizedLandingKind, string> = {
  mbti: `/tests/${slugs.MBTI}`, holland: `/tests/${slugs.RIASEC}`, career: "/career/assessment",
  big5: `/tests/${slugs.BIG5_OCEAN}`, iq: `/tests/${slugs.IQ_RAVEN}`, enneagram: `/tests/${slugs.ENNEAGRAM}`,
  jung: "/tests/jung-test", disc: "/tests/explore/disc", eq: `/tests/${slugs.EQ_60}`,
};
