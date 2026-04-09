import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  LOCALE_COOKIE_NAME,
  resolveCountryCodeFromHeaders,
  resolvePreferredLocale,
} from "@/lib/i18n/localeNegotiation";

export default async function RootLanguageGatewayPage() {
  const [headerStore, cookieStore] = await Promise.all([headers(), cookies()]);
  const preferred = resolvePreferredLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE_NAME)?.value ?? null,
    acceptLanguage: headerStore.get("accept-language"),
    countryCode: resolveCountryCodeFromHeaders(headerStore),
  });

  redirect(preferred === "zh" ? "/zh" : "/en");
}
