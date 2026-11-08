import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { ACCOUNT_LANGUAGES, accountLanguageHref } from "@/lib/i18n/accountDisplayRoutes";

export function AccountLanguageLinks({ locale, section, verification }: { locale: DisplayLocale; section: string; verification: string }) {
  return <nav aria-label={locale === "en" ? "Account language" : locale === "zh-TW" ? "帳戶語言" : "账户语言"} className="flex flex-wrap items-center gap-2">
    {ACCOUNT_LANGUAGES.map(language => <Link key={language.locale} prefetch={false} href={accountLanguageHref(language.locale, section, verification)} lang={language.lang} aria-current={locale === language.locale ? "page" : undefined} className="inline-flex min-h-11 items-center text-xs">{language.label}</Link>)}
  </nav>;
}
