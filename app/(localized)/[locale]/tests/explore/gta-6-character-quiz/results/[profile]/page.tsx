import { notFound } from "next/navigation";
import { Gta6Guide, gta6GuideMetadata } from "@/components/questionnaires/Gta6Guide";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";

type Props = { params: Promise<{ locale: string; profile: string }> };

async function resolvePage(params: Props["params"]) {
  const { locale, profile: id } = await params;
  const profile = gta6Profile(id);
  if (!isSupportedLocale(locale) || !profile) notFound();
  return { locale, profile };
}

export async function generateMetadata({ params }: Props) {
  const { locale, profile } = await resolvePage(params);
  return gta6GuideMetadata(locale, profile);
}

export default async function Page({ params }: Props) {
  const { locale, profile } = await resolvePage(params);
  return <Gta6Guide locale={locale} profile={profile} />;
}
