import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export default async function LegacyTestSlugPage(props: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await props.params;
  const locale = resolveLocale(localeParam);
  permanentRedirect(localizedPath(`/tests/${slug}`, locale));
}
