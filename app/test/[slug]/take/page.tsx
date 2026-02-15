import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export default async function LegacyTestTakePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  permanentRedirect(localizedPath(`/tests/${slug}/take`, locale));
}
