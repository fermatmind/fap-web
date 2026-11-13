import { normalizeDisplayLocale, type DisplayLocale } from "@/lib/i18n/locales";

const BASE_TYPE = /^[ie][ns][tf][jp]$/;

export function personalityCareerHref(locale: DisplayLocale, type: string): string {
  const base = type.toLowerCase().replace(/-[at]$/, "");
  if (!BASE_TYPE.test(base)) return `/${locale}/personality`;
  const anchor = locale === "zh-TW" ? "work_style" : `${base}-career-exploration`;
  return `/${locale}/personality/${base}#${anchor}`;
}

export function migratePersonalityCareerHref(href: string, locale: DisplayLocale): string {
  const match = href.match(/^(?:https:\/\/(?:www\.)?fermatmind\.com)?\/(?:(zh|en|zh-TW)\/)?career\/recommendations\/mbti\/([ie][ns][tf][jp](?:-[at])?)\/?(?:[?#].*)?$/i);
  if (!match) return href;
  return personalityCareerHref(normalizeDisplayLocale(match[1]) ?? locale, match[2]);
}
