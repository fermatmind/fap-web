import { notFound } from "next/navigation";
import { Gta6Landing, gta6LandingMetadata } from "@/components/questionnaires/Gta6Landing";
import { isSupportedLocale } from "@/lib/i18n/locales";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

async function getLocale(params: Props["params"]) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return locale;
}

export async function generateMetadata({ params, searchParams }: Props) {
  return gta6LandingMetadata(await getLocale(params), Object.keys(await searchParams).length > 0);
}

export default async function Page({ params }: Props) {
  return <Gta6Landing locale={await getLocale(params)} />;
}
