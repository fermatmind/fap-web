import { localizedPath, type DisplayLocale } from "./locales";

export const ACCOUNT_DISPLAY_PATHS = ["/account"] as const;
export const ACCOUNT_SECTIONS = ["overview", "assessments", "reports", "career", "settings"] as const;
export const ACCOUNT_LANGUAGES = [
  { locale: "en", lang: "en", label: "English" },
  { locale: "zh", lang: "zh-CN", label: "简体中文" },
  { locale: "zh-TW", lang: "zh-TW", label: "繁體中文" },
] as const;
export function accountDisplayPath(locale: DisplayLocale): string {
  return locale === "zh-TW" ? "/zh-TW/account" : localizedPath("/account", locale);
}
/** Verification proof travels only between fixed private account pages. */
export function accountLanguageHref(locale: DisplayLocale, section: string, verification = ""): string {
  const query = ACCOUNT_SECTIONS.includes(section as typeof ACCOUNT_SECTIONS[number]) && section !== "overview"
    ? `?section=${section}` : "";
  const proof = /^[A-Za-z0-9]{64}$/.test(verification) ? `#verify=${verification}` : "";
  return accountDisplayPath(locale) + query + proof;
}
