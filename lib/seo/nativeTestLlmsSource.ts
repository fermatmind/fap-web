import catalog from "@/lib/questionnaires/catalog.json";
import type { Locale } from "@/lib/i18n/locales";

// These code-owned products use this same public catalog for their routes and
// sitemap. They are a separate source, never a fallback for backend/CMS tests.
export function listNativeTestLlmsEntries() {
  return catalog.flatMap((test) => (["en", "zh"] as const).flatMap((locale: Locale) => {
    const path = `/${locale}/tests/${test.collection}/${test.slug}`;
    const entry = {
      locale,
      path,
      title: test.title[locale],
      type: "native_test",
      summary: test.description[locale],
      updatedAt: test.updated,
    };
    return [entry, ...test.resultSlugs.map((slug) => ({
      locale,
      path: `${path}/results/${slug}`,
      title: `${test.title[locale]} — ${locale === "zh" ? "公开结果说明" : "Public result guide"}`,
      type: "native_test_guide",
      summary: "",
      updatedAt: test.updated,
    }))];
  }));
}
