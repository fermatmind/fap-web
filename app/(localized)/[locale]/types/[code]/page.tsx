import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

const MBTI_TYPE_RE = /^[ie][ns][ft][jp]$/i;

export default async function LegacyTypeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { locale: localeParam, code } = await params;
  const locale = resolveLocale(localeParam);
  const normalizedCode = String(code ?? "").trim();

  permanentRedirect(
    MBTI_TYPE_RE.test(normalizedCode)
      ? localizedPath(`/personality/${normalizedCode.toLowerCase()}`, locale)
      : localizedPath("/personality", locale)
  );
}
