import { notFound } from "next/navigation";
import { Gta6Quiz } from "@/components/questionnaires/Gta6Quiz";
import { questionnaireTakeMetadata } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { isSupportedLocale } from "@/lib/i18n/locales";
import { gta6LandingPath, gta6Name } from "@/lib/questionnaires/gta6CharacterQuiz";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return questionnaireTakeMetadata(gta6Name[locale], gta6LandingPath(locale));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <Gta6Quiz locale={locale} />;
}
