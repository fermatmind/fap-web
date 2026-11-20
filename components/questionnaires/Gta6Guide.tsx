import type { Metadata } from "next";
import type { DisplayLocale } from "@/lib/i18n/locales";
import editorial from "@/lib/questionnaires/data/gta-6-landing.json";
import { gta6Portrait, gta6Profiles, gta6ResultPath, type Gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";
import { gta6Alternates } from "./Gta6Landing";
import { Gta6Result } from "./Gta6Result";

export function gta6GuideMetadata(locale: DisplayLocale, profile: Gta6Profile): Metadata {
  const title = `${profile.name} · ${profile.title[locale]}`;
  const url = gta6ResultPath(locale, profile.id);
  return {
    title,
    description: profile.summary[locale],
    robots: { index: false, follow: false },
    alternates: { canonical: url, languages: gta6Alternates(lang => gta6ResultPath(lang, profile.id)) },
    openGraph: { title, description: profile.summary[locale], url, images: [gta6Portrait(profile.id)] },
  };
}

export function Gta6Guide({ locale, profile }: { locale: DisplayLocale; profile: Gta6Profile }) {
  const index = gta6Profiles.findIndex(item => item.id === profile.id);
  return <Gta6Result locale={locale} profile={profile} guide={editorial[locale].guide[index]} />;
}
