import type { Locale } from "@/lib/i18n/locales";
import { LOCALE_COOKIE_NAME } from "@/lib/i18n/localeNegotiation";

export function persistLocalePreferenceCookie(locale: Locale) {
  if (typeof document === "undefined") return;

  const oneYear = 60 * 60 * 24 * 365;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=${oneYear}; SameSite=Lax`;
}
