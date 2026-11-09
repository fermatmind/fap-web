import copy from "./tests-directory-copy.json";
import { traditionalQuiz } from "./chiikawa";
import { traditionalSevenSins } from "./sevenSins";
import { traditionalPath } from "@/lib/i18n/traditionalRoutes";

const directory = copy.bySlug as Record<string, { title: { target: string }; description: { target: string } }>;

export function taiwanDirectoryEntry(item: { slug: string; title: string; description: string; href: string }) {
  const href = traditionalPath(item.href);
  if (href && item.slug === "chiikawa") {
    return { title: traditionalQuiz.title["zh-TW"], description: traditionalQuiz.description["zh-TW"], href, hrefLang: "zh-TW" };
  }
  if (href && item.slug === "seven-sins-virtues-test") {
    return { title: traditionalSevenSins.title["zh-TW"], description: traditionalSevenSins.description["zh-TW"], href, hrefLang: "zh-TW" };
  }

  const localized = directory[item.slug];
  return {
    title: localized?.title.target ?? item.title,
    description: localized?.description.target ?? item.description,
    href: href ?? item.href,
    hrefLang: href ? "zh-TW" : "zh-CN",
  };
}
