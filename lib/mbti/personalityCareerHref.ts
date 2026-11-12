import { localizedPath, type Locale } from "@/lib/i18n/locales";

const BASE_TYPE = /^[ie][ns][tf][jp]$/;

export function personalityCareerHref(locale: Locale, type: string): string {
  const base = type.toLowerCase().replace(/-[at]$/, "");
  return BASE_TYPE.test(base)
    ? localizedPath(`/personality/${base}#${base}-career-exploration`, locale)
    : localizedPath("/personality", locale);
}

export function migratePersonalityCareerHref(href: string, locale: Locale): string {
  const match = href.match(/^(?:https:\/\/fermatmind\.com)?\/(?:(zh|en)\/)?career\/recommendations\/mbti\/([ie][ns][tf][jp](?:-[at])?)\/?(#design-mbti-exploration)?$/);
  if (!match || (match[1] && match[1] !== locale) || (match[3] && match[2] !== "intj")) return href;
  return personalityCareerHref(locale, match[2]);
}
