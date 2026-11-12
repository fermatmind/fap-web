import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";

/** The operator-selected brand default is a display policy, not a CMS revision or human-review claim. */
export function articleByline(authorName: string | null | undefined, locale: DisplayLocale) {
  const original = authorName?.trim() || "";
  const editorial = ["fermatmind editorial", "费马测试编辑部", "費馬測試編輯部"].includes(original.toLowerCase());
  const brand = editorial || !original || ["fermat institute", "fermatmind", "费马测试", "費馬測試"].includes(original.toLowerCase());
  return { name: editorial ? (locale === "zh-TW" ? "費馬測試編輯部" : locale === "zh" ? "费马测试编辑部" : "FermatMind Editorial") : brand ? (locale === "zh-TW" ? "費馬測試" : locale === "zh" ? "费马测试" : "FermatMind") : original,
    href: brand ? (locale === "zh-TW" ? "/zh-TW/brand" : localizedPath("/brand", locale)) : null, brand };
}
