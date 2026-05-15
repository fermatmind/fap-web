export type I18nSeoPassportLocale = "en" | "zh";

export type I18nSeoPassportLanguages = {
  en?: string;
  "zh-CN"?: string;
  "x-default"?: string;
};

export type I18nSeoPassportInput = {
  canonical: string;
  currentLocale: I18nSeoPassportLocale;
  authorityAlternates?: Record<string, unknown> | null;
  existingLanguages?: Record<string, unknown> | null;
  fallbackXDefault?: string | null;
};

export type I18nSeoPassport = {
  canonical: string;
  languages: I18nSeoPassportLanguages;
};

function normalizeUrl(value: unknown): string | null {
  if (typeof value !== "string" && !(value instanceof URL)) {
    return null;
  }
  const normalized = String(value ?? "").trim();
  return normalized || null;
}

export function buildI18nSeoPassport(input: I18nSeoPassportInput): I18nSeoPassport {
  const canonical = normalizeUrl(input.canonical) ?? "";
  const authorityAlternates = input.authorityAlternates ?? {};
  const existingLanguages = input.existingLanguages ?? {};
  const languages: I18nSeoPassportLanguages = {};
  const englishAuthority = normalizeUrl(authorityAlternates.en);
  const zhAuthority = normalizeUrl(authorityAlternates["zh-CN"]);

  if (englishAuthority) {
    languages.en = englishAuthority;
  }

  if (zhAuthority) {
    languages["zh-CN"] = zhAuthority;
  }

  const currentEnglishCanonical = input.currentLocale === "en" ? canonical : null;
  const xDefault =
    englishAuthority
    ?? currentEnglishCanonical
    ?? normalizeUrl(existingLanguages["x-default"])
    ?? normalizeUrl(input.fallbackXDefault);

  if (xDefault) {
    languages["x-default"] = xDefault;
  }

  return {
    canonical,
    languages,
  };
}
