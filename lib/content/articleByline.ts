import { localizedPath, type Locale } from "@/lib/i18n/locales";

/** The operator-selected brand default is a display policy, not a CMS revision or human-review claim. */
export function articleByline(authorName: string | null | undefined, locale: Locale) {
  const original = authorName?.trim() || "";
  const brand = !original || ["fermat institute", "fermatmind", "费马测试"].includes(original.toLowerCase());
  return { name: brand ? (locale === "zh" ? "费马测试" : "FermatMind") : original,
    href: brand ? localizedPath("/brand", locale) : null, brand };
}
