import manifest from "@/content/career-comparisons/manifest.json";

const originalPairs = [
  { slugs: ["electrical-engineers", "electricians"], labels: { en: "Electrician vs. Electrical Engineer", zh: "电工 vs 电气工程师" } },
  { slugs: ["audiologists", "physical-therapists"], labels: { en: "Audiologist vs. Physical Therapist", zh: "听力学家 vs 物理治疗师" } },
  {
    slugs: ["carpet-installers", "floor-layers-except-carpet-wood-and-hard-tiles"],
    labels: { en: "Carpet Installer vs. Floor Layer", zh: "地毯安装工 vs 地板铺设工" },
  },
  {
    slugs: ["veterinarians", "veterinary-technologists-and-technicians"],
    labels: { en: "Veterinarian vs. Veterinary Technician", zh: "兽医 vs 兽医技师与技术员" },
  },
] as const;

export type FixedComparisonLocale = "en" | "zh" | "zh-TW";
export type FixedComparisonPair = {
  slugs: readonly string[];
  labels: Partial<Record<FixedComparisonLocale, string>>;
};
export const fixedComparisonPairs: readonly FixedComparisonPair[] = [
  ...originalPairs,
  ...manifest.map(({ slugs, pages }) => ({ slugs, labels: {
    zh: pages.zh.title, en: pages.en.title, "zh-TW": pages["zh-TW"].title,
  } })),
];

export function isFixedComparisonPreviewEnabled() {
  return process.env.FERMATMIND_FIXED_COMPARE_ENABLED !== "0";
}

export function isFixedComparisonLocale(locale: string): locale is FixedComparisonLocale {
  return locale === "en" || locale === "zh" || locale === "zh-TW";
}

export function fixedComparisonPath(locale: FixedComparisonLocale, pair: FixedComparisonPair) {
  return `/${locale}/career-compare/${pair.slugs.join("-vs-")}`;
}

export function resolveFixedComparisonPair(slug: string) {
  return fixedComparisonPairs.find(({ slugs }) => slug === slugs.join("-vs-"));
}

export function resolveReversedFixedComparisonPair(slug: string) {
  return fixedComparisonPairs.find(({ slugs: [first, second] }) => slug === `${second}-vs-${first}`);
}

// Incomplete exercises stay in the source asset, but are not offered to readers.
export function comparisonDisplayMarkdown(markdown: string) {
  const sections = markdown.split(/(?=^## )/m);
  let moduleIndex = 0;
  return sections.filter(section => {
    if (!section.startsWith("## ")) return true;
    moduleIndex++;
    if (moduleIndex !== 7) return true;
    return /样答|樣答|参考答案|參考答案|sample answer|model answer|worked example/i.test(section);
  }).join("");
}
