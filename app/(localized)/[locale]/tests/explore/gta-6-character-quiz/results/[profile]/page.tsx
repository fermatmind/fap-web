import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Gta6Result } from "@/components/questionnaires/Gta6Result";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { gta6Cover, gta6Profile, gta6ResultPath } from "@/lib/questionnaires/gta6CharacterQuiz";

type Props = { params: Promise<{ locale: string; profile: string }> };

async function resolvePage(params: Props["params"]) {
  const { locale, profile: id } = await params;
  const profile = gta6Profile(id);
  if (!isSupportedLocale(locale) || !profile) notFound();
  return { locale, profile };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, profile } = await resolvePage(params);
  const title = `${profile.name} · ${profile.title[locale]}`;
  const url = gta6ResultPath(locale, profile.id);
  return {
    title,
    description: profile.summary[locale],
    robots: { index: false, follow: false },
    alternates: { canonical: url },
    openGraph: { title, description: profile.summary[locale], url, images: [gta6Cover] },
  };
}

export default async function Page({ params }: Props) {
  const { locale, profile } = await resolvePage(params);
  return <Gta6Result locale={locale} profile={profile} />;
}
