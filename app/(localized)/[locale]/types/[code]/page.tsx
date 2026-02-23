import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export default async function LegacyTypeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale: localeParam, code } = await params;
  const locale = resolveLocale(localeParam);
  permanentRedirect(localizedPath(`/professions/${code.toUpperCase()}`, locale));
}
