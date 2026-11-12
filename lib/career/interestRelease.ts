import data from "./interestRelease.json";
import type { Locale } from "@/lib/i18n/locales";

type InterestCareer = {
  onet: string;
  interest: string;
  copy: Record<Locale, { name: string; summary: string }>;
};

const dimensions = {
  R: { en: "Realistic", zh: "现实型" },
  I: { en: "Investigative", zh: "研究型" },
  A: { en: "Artistic", zh: "艺术型" },
  S: { en: "Social", zh: "社会型" },
  E: { en: "Enterprising", zh: "企业型" },
  C: { en: "Conventional", zh: "常规型" },
} as const;

const careers: Record<string, InterestCareer> = data.careers;

export function getReleasedCareerInterestEvidence(slug: string) {
  return Object.hasOwn(careers, slug) ? careers[slug] : null;
}

export const RELEASED_CAREER_INTEREST_CODES = Object.keys(data.topics) as (keyof typeof data.topics)[];

export function getReleasedCareerInterest(code: string, locale: Locale) {
  if (!Object.hasOwn(data.topics, code)) return null;
  const topic = data.topics[code as keyof typeof data.topics];
  const upper = code.toUpperCase();
  const labels = [...upper].map((letter) => dimensions[letter as keyof typeof dimensions][locale]);
  const label = labels.join(locale === "zh" ? "、" : ", ");
  const name = locale === "zh" ? `霍兰德 ${upper}（${label}）职业探索` : `${upper} Holland Code careers (${label})`;
  const summary = locale === "zh"
    ? `查看 O*NET 职业兴趣代码与 ${upper} 对应的工作，了解日常任务，并比较兴趣组成相近的职业。`
    : `Explore occupations with an O*NET interest code corresponding to ${upper}, see what the work involves, and compare related occupations.`;
  const readJobs = (slugs: string[]) => slugs.map((slug) => ({ slug, ...careers[slug] }));
  return {
    code: upper, label, name, summary, path: `/${locale}/career/interests/${code}`,
    exact: readJobs(topic.exact), related: readJobs(topic.related),
  };
}

export function releasedCareerInterestEntries() {
  // ARI and AC use their own editorial readers and search metadata.
  return RELEASED_CAREER_INTEREST_CODES.filter((code) => code !== "ari" && code !== "ac").flatMap((code) =>
    (["en", "zh"] as const).map((locale) => {
      const { path, name: title, summary } = getReleasedCareerInterest(code, locale)!;
      return { locale, path, title, summary };
    }),
  );
}
