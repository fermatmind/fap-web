import { isModeABatchTwo } from "@/lib/entertainment/modeABatchTwo";
import catalog from "@/lib/questionnaires/catalog.json";
import { gta6IndexablePaths, gta6Name, gta6Profile } from "@/lib/questionnaires/gta6CharacterQuiz";
import { PUBLIC_PATH, RESOURCE_PATHS } from "@/lib/friendship/core";
import { pages, type PageKind } from "@/lib/friendship/publicCopy";
import { friendshipCopy } from "@/lib/friendship/traditional";
import { taiwanDirectoryEntry } from "@/lib/i18n/zh-TW/testsDirectory";
import { traditionalSearchEquivalent } from "@/lib/seo/traditionalSearchMetadata";
import type { Locale } from "@/lib/i18n/locales";

// First Mode A cohort. Taiwan routes are admitted from the same public authority as Sitemap.
const traditionalB1NativeTests = new Set([
  "seven-sins-virtues-test", "cyberpunk-edgerunners", "chiikawa", "aura-color",
  "adult-age-preferences", "philosopher-personality-test", "space-marine-chapter",
  "bleach", "moon-phase", "mental-age", "tsundere-dere-type", "what-dog-breed-am-i",
  "introvert-extrovert", "anime-character-archetype-test", "south-park",
  "disc", "8-values-political", "male-archetype-test", "word-skills",
]);

function listTraditionalModeAEntries() {
  const native = catalog.filter((test) => traditionalB1NativeTests.has(test.slug) || isModeABatchTwo(test.slug)).flatMap((test) => {
    const base = `/tests/${test.collection}/${test.slug}`;
    const copy = taiwanDirectoryEntry({ slug: test.slug, title: test.title.zh, description: test.description.zh, href: `/zh${base}` });
    const entry = { locale: "zh-TW" as const, path: copy.href, title: copy.title, type: "native_test",
      summary: copy.description, updatedAt: test.updated };
    return [entry, ...test.resultSlugs.map((id) => ({ ...entry, path: `${copy.href}/results/${id}`,
      title: `${copy.title} — 公開結果指南`, type: "native_test_guide", summary: "" }))];
  });
  const copy = friendshipCopy("zh-TW");
  const friendship = RESOURCE_PATHS.map((suffix) => {
    const kind = (suffix.slice(1) || "home") as PageKind;
    const [title, description] = pages[kind].zh;
    return { locale: "zh-TW" as const, path: `/zh-TW${PUBLIC_PATH}${suffix}`, title: copy(title),
      type: suffix ? "game guide" : "game", summary: copy(description), updatedAt: null };
  });
  return [...native, ...friendship].filter(({ path }) =>
    path.startsWith("/zh-TW/") && traditionalSearchEquivalent(path) === path);
}

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

  return [...questionnaires, ...gta6, ...listTraditionalModeAEntries()];
}
