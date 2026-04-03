export const BIG5_DOMAIN_ORDER = ["O", "C", "E", "A", "N"] as const;

export type Big5DomainCode = (typeof BIG5_DOMAIN_ORDER)[number];

export type Big5DomainTaxonomyItem = {
  id: Big5DomainCode;
  order: number;
  display_name: {
    en: string;
    zh: string;
  };
  short_label: {
    en: string;
    zh: string;
  };
};

export const BIG5_DOMAINS: readonly Big5DomainTaxonomyItem[] = [
  {
    id: "O",
    order: 1,
    display_name: { en: "Openness", zh: "开放性" },
    short_label: { en: "O", zh: "O" },
  },
  {
    id: "C",
    order: 2,
    display_name: { en: "Conscientiousness", zh: "尽责性" },
    short_label: { en: "C", zh: "C" },
  },
  {
    id: "E",
    order: 3,
    display_name: { en: "Extraversion", zh: "外向性" },
    short_label: { en: "E", zh: "E" },
  },
  {
    id: "A",
    order: 4,
    display_name: { en: "Agreeableness", zh: "宜人性" },
    short_label: { en: "A", zh: "A" },
  },
  {
    id: "N",
    order: 5,
    display_name: { en: "Neuroticism", zh: "情绪性" },
    short_label: { en: "N", zh: "N" },
  },
] as const;

export type Big5FacetTaxonomyItem = {
  facet_code: string;
  domain: Big5DomainCode;
  order: number;
  display_label: {
    en: string;
    zh: string;
  };
};

export const BIG5_FACETS: readonly Big5FacetTaxonomyItem[] = [
  { facet_code: "O1", domain: "O", order: 1, display_label: { en: "O1 Imagination", zh: "O1 想象力" } },
  { facet_code: "O2", domain: "O", order: 2, display_label: { en: "O2 Artistic Interests", zh: "O2 审美兴趣" } },
  { facet_code: "O3", domain: "O", order: 3, display_label: { en: "O3 Emotionality", zh: "O3 情感丰富度" } },
  { facet_code: "O4", domain: "O", order: 4, display_label: { en: "O4 Adventurousness", zh: "O4 冒险性" } },
  { facet_code: "O5", domain: "O", order: 5, display_label: { en: "O5 Intellect", zh: "O5 智性" } },
  { facet_code: "O6", domain: "O", order: 6, display_label: { en: "O6 Liberalism", zh: "O6 开放价值观" } },
  { facet_code: "C1", domain: "C", order: 7, display_label: { en: "C1 Self Efficacy", zh: "C1 自我效能" } },
  { facet_code: "C2", domain: "C", order: 8, display_label: { en: "C2 Orderliness", zh: "C2 条理性" } },
  { facet_code: "C3", domain: "C", order: 9, display_label: { en: "C3 Dutifulness", zh: "C3 责任感" } },
  { facet_code: "C4", domain: "C", order: 10, display_label: { en: "C4 Achievement Striving", zh: "C4 成就追求" } },
  { facet_code: "C5", domain: "C", order: 11, display_label: { en: "C5 Self Discipline", zh: "C5 自律" } },
  { facet_code: "C6", domain: "C", order: 12, display_label: { en: "C6 Cautiousness", zh: "C6 审慎" } },
  { facet_code: "E1", domain: "E", order: 13, display_label: { en: "E1 Friendliness", zh: "E1 友善" } },
  { facet_code: "E2", domain: "E", order: 14, display_label: { en: "E2 Gregariousness", zh: "E2 合群" } },
  { facet_code: "E3", domain: "E", order: 15, display_label: { en: "E3 Assertiveness", zh: "E3 自信主张" } },
  { facet_code: "E4", domain: "E", order: 16, display_label: { en: "E4 Activity Level", zh: "E4 活跃度" } },
  { facet_code: "E5", domain: "E", order: 17, display_label: { en: "E5 Excitement Seeking", zh: "E5 刺激追求" } },
  { facet_code: "E6", domain: "E", order: 18, display_label: { en: "E6 Cheerfulness", zh: "E6 愉悦感" } },
  { facet_code: "A1", domain: "A", order: 19, display_label: { en: "A1 Trust", zh: "A1 信任" } },
  { facet_code: "A2", domain: "A", order: 20, display_label: { en: "A2 Morality", zh: "A2 诚实" } },
  { facet_code: "A3", domain: "A", order: 21, display_label: { en: "A3 Altruism", zh: "A3 利他" } },
  { facet_code: "A4", domain: "A", order: 22, display_label: { en: "A4 Cooperation", zh: "A4 合作" } },
  { facet_code: "A5", domain: "A", order: 23, display_label: { en: "A5 Modesty", zh: "A5 谦逊" } },
  { facet_code: "A6", domain: "A", order: 24, display_label: { en: "A6 Sympathy", zh: "A6 同情心" } },
  { facet_code: "N1", domain: "N", order: 25, display_label: { en: "N1 Anxiety", zh: "N1 焦虑" } },
  { facet_code: "N2", domain: "N", order: 26, display_label: { en: "N2 Anger", zh: "N2 愤怒" } },
  { facet_code: "N3", domain: "N", order: 27, display_label: { en: "N3 Depression", zh: "N3 抑郁" } },
  { facet_code: "N4", domain: "N", order: 28, display_label: { en: "N4 Self Consciousness", zh: "N4 自我意识" } },
  { facet_code: "N5", domain: "N", order: 29, display_label: { en: "N5 Immoderation", zh: "N5 冲动" } },
  { facet_code: "N6", domain: "N", order: 30, display_label: { en: "N6 Vulnerability", zh: "N6 脆弱性" } },
] as const;

export const BIG5_DOMAIN_LABELS: Record<Big5DomainCode, { en: string; zh: string }> = BIG5_DOMAINS.reduce(
  (acc, domain) => {
    acc[domain.id] = domain.display_name;
    return acc;
  },
  {} as Record<Big5DomainCode, { en: string; zh: string }>
);

export const BIG5_FACET_LABELS: Record<string, { en: string; zh: string; domain: Big5DomainCode }> = BIG5_FACETS.reduce(
  (acc, facet) => {
    acc[facet.facet_code] = {
      en: facet.display_label.en,
      zh: facet.display_label.zh,
      domain: facet.domain,
    };
    return acc;
  },
  {} as Record<string, { en: string; zh: string; domain: Big5DomainCode }>
);

export function isBig5DomainCode(value: string): value is Big5DomainCode {
  return BIG5_DOMAIN_ORDER.includes(value as Big5DomainCode);
}
