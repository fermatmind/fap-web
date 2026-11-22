import type { Profile, TrioKind } from "../trioLanding";

export type LocalizedLandingLocale = "en" | "zh-TW";
export type LocalizedLandingKind = TrioKind | "mbti" | "holland" | "career";

export type LocalizedLandingProfile = Profile & {
  h1: string;
  seoTitle: string;
  seoDescription: string;
  headline?: string;
  sampleLabels: readonly string[];
  sampleNotes: readonly string[];
};
