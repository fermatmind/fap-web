import catalog from "@/lib/questionnaires/catalog.json";
import { gta6IndexablePaths, gta6Name, gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";
import type { Locale } from "@/lib/i18n/locales";

// These code-owned products use this same public catalog for their routes and
// sitemap. They are a separate source, never a fallback for backend/CMS tests.
export function listNativeTestLlmsEntries() {
  const questionnaires = catalog.flatMap((test) => (["en", "zh"] as const).flatMap((locale: Locale) => {
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

  const gta6 = (["en", "zh", "zh-TW"] as const).flatMap((locale) =>
    gta6IndexablePaths.map((path) => {
      const profile = gta6Profile(path.split("/").at(-1));
      return {
        locale,
        path: `/${locale}${path}`,
        title: profile ? `${profile.name} — ${gta6Name[locale]}` : gta6Name[locale],
        type: profile ? "native_test_guide" : "native_test",
        summary: profile?.summary[locale] ?? "",
        updatedAt: null,
      };
    })
  );

  return [...questionnaires, ...gta6];
}
