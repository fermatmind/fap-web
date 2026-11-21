import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { gta6PageAlternates, gta6Portrait, type Gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";
import { gta6ProfileReading, gta6ReadingFaq } from "@/lib/questionnaires/gta6ProfileReadings";
import { gta6PublishedRobots } from "./Gta6Landing";
import { Gta6Result } from "./Gta6Result";

export function gta6GuideMetadata(locale: DisplayLocale, profile: Gta6Profile, hasQuery: boolean): Metadata {
  const qualifier = { en: "GTA 6 Character Guide", zh: "GTA 6 角色指南", "zh-TW": "GTA 6 角色指南" }[locale];
  const title = `${profile.name} · ${profile.title[locale]} | ${qualifier}`;
  const alternates = gta6PageAlternates(locale, profile.id);
  const content = gta6ProfileReading(profile.id, locale);
  const description = content?.reading.scene[content.index] ?? profile.summary[locale];
  return {
    title,
    description,
    robots: gta6PublishedRobots(hasQuery),
    alternates,
    openGraph: { title, description, url: alternates.canonical, images: [gta6Portrait(profile.id)] },
  };
}

export function Gta6Guide({ locale, profile }: { locale: DisplayLocale; profile: Gta6Profile }) {
  const faq = gta6ReadingFaq(locale, profile.name, profile.id);
  return (
    <>
      <JsonLd id="gta6-character-faq" data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map(item => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
      }} />
      <Gta6Result locale={locale} profile={profile} />
    </>
  );
}
