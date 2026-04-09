import { DEFAULT_LOCALE, normalizeLocale, type Locale } from "@/lib/i18n/locales";

export const LOCALE_COOKIE_NAME = "fm_locale";
const COUNTRY_HEADER_NAMES = [
  "x-vercel-ip-country",
  "cf-ipcountry",
  "cloudfront-viewer-country",
  "x-country-code",
  "x-country",
  "x-geo-country",
  "x-forwarded-country",
] as const;

type HeaderReader = Pick<Headers, "get">;

export function normalizeCountryCode(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(normalized) ? normalized : null;
}

export function resolveCountryCodeFromHeaders(headers: HeaderReader): string | null {
  for (const headerName of COUNTRY_HEADER_NAMES) {
    const value = normalizeCountryCode(headers.get(headerName));
    if (value) {
      return value;
    }
  }

  return null;
}

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguage,
  countryCode,
  defaultLocale = DEFAULT_LOCALE,
}: {
  cookieLocale: string | null | undefined;
  acceptLanguage: string | null | undefined;
  countryCode?: string | null | undefined;
  defaultLocale?: Locale;
}): Locale {
  if (normalizeCountryCode(countryCode) === "CN") {
    return "zh";
  }

  const cookieRaw = String(cookieLocale ?? "").trim();
  if (cookieRaw.length > 0) {
    return normalizeLocale(cookieRaw);
  }

  const accepted = String(acceptLanguage ?? "").trim().toLowerCase();
  if (accepted.includes("zh")) return "zh";
  if (accepted.includes("en")) return "en";

  return defaultLocale;
}
