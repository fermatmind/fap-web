import Link from "next/link";
import { emailDisplayPath, type EmailDisplayPath } from "@/lib/i18n/emailDisplayRoutes";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function EmailLanguageLinks({ path, token, locale }: { path: EmailDisplayPath; token: string; locale: DisplayLocale }) {
  const languages = [{locale:"zh",label:"简体中文",lang:"zh-CN"},{locale:"en",label:"English",lang:"en"},{locale:"zh-TW",label:"繁體中文",lang:"zh-TW"}] as const;
  return <nav aria-label={locale === "en" ? "Email language" : locale === "zh-TW" ? "電子郵件語言" : "邮件语言"} className="mt-6 flex flex-wrap gap-5 text-sm">
    {languages.map(language => <Link key={language.locale} prefetch={false} href={emailDisplayPath(path,language.locale)+(token ? `?token=${encodeURIComponent(token)}` : "")} lang={language.lang} aria-current={locale===language.locale ? "page" : undefined} className="inline-flex min-h-11 items-center underline">{language.label}</Link>)}
  </nav>;
}
