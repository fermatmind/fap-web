import { headers } from "next/headers";
import { permanentRedirect } from "next/navigation";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export default async function LegacyTestsPage() {
  const requestHeaders = await headers();
  const locale = resolveLocale(requestHeaders.get("x-locale"));
  permanentRedirect(localizedPath("/tests", locale));
}
