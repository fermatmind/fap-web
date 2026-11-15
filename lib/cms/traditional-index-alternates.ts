import { cache } from "react";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import { buildContentPagePath, getContentPage } from "./content-pages";
import { listCareerGuidesFromCms } from "./career-guides";
import { listTopics } from "./topics";

const contentPageSlugs = new Set([
  "charter", "brand", "data-privacy", "common-misconceptions", "about", "foundation", "careers",
  "item-design-notes", "method-boundaries", "reliability-validity", "policies", "privacy", "science", "terms",
]);

export const traditionalContentPageAlternates = cache(async (slug: string) => {
  if (isConfiguredStagingSiteUrl() || !contentPageSlugs.has(slug)) return undefined;
  const tw = await getContentPage(slug, "zh-TW");
  if (!tw?.isIndexable || tw.locale !== "zh-TW" || tw.slug !== slug) return undefined;
  const [en, zh] = await Promise.all([getContentPage(slug, "en"), getContentPage(slug, "zh")]);
  if (!en?.isIndexable || !zh?.isIndexable || en.slug !== slug || zh.slug !== slug) return undefined;
  return {
    "zh-TW": canonicalUrl(buildContentPagePath(slug, "zh-TW")),
    "zh-CN": canonicalUrl(buildContentPagePath(slug, "zh")),
    en: canonicalUrl(buildContentPagePath(slug, "en")),
  };
});

export const traditionalCollectionAlternates = cache(async (path: "/career/guides" | "/topics") => {
  if (isConfiguredStagingSiteUrl()) return undefined;
  const entries = path === "/career/guides"
    ? await listCareerGuidesFromCms("zh-TW", { fresh: true })
    : (await listTopics({ locale: "zh-TW", perPage: 20 }).catch(() => ({ items: [] }))).items;
  if (!entries.some(entry => entry.isPublic && entry.isIndexable)) return undefined;
  return {
    "zh-TW": canonicalUrl(`/zh-TW${path}`),
    "zh-CN": canonicalUrl(`/zh${path}`),
    en: canonicalUrl(`/en${path}`),
  };
});
