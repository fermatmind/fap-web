import { buildApiUrl } from "@/lib/api-base";
import {
  SCALE_CANONICAL_SLUG_MAP,
  normalizeSupportedScaleCode,
  resolveCanonicalSlug,
} from "@/lib/assessmentSlugMap";
import { DEFAULT_TEST_COVER_URL } from "@/lib/cms/media";
import type { Locale } from "@/lib/i18n/locales";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";

export type RelatedContentItem = {
  slug: string;
  title: string;
  href: string;
  summary?: string;
};

export type TestListItem = {
  title: string;
  title_i18n?: Record<string, string>;
  slug: string;
  description: string;
  cover_image: string;
  questions_count: number;
  time_minutes: number;
  scale_code?: string;
  card_visual?: string | null;
  card_tone?: string | null;
  card_seed?: string | null;
  card_density?: string | null;
  card_tagline_i18n?: Record<string, string>;
  highlight_priority?: number;
  highlight_rating?: number;
  highlight_excerpt_i18n?: Record<string, string>;
  highlight_seo_copy_i18n?: Record<string, string>;
  is_public?: boolean;
  is_active?: boolean;
  is_indexable?: boolean;
};

export type Test = TestListItem;

type FallbackTestSeed = {
  slug: string;
  scale_code: string;
  title: { zh: string; en: string };
  description: { zh: string; en: string };
  questions_count: number;
  time_minutes: number;
  highlight_priority: number;
};

const FALLBACK_PUBLIC_TEST_SEEDS: FallbackTestSeed[] = [
  {
    slug: SCALE_CANONICAL_SLUG_MAP.MBTI,
    scale_code: "MBTI",
    title: { zh: "MBTI 性格测试", en: "MBTI Personality Test" },
    description: {
      zh: "快速了解你的类型偏好与决策风格。",
      en: "Quickly understand your type preferences and decision style.",
    },
    questions_count: 144,
    time_minutes: 15,
    highlight_priority: 100,
  },
  {
    slug: SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN,
    scale_code: "BIG5_OCEAN",
    title: { zh: "Big Five 大五人格测试", en: "Big Five Personality Test" },
    description: {
      zh: "从五个维度看清你的稳定特质。",
      en: "Read your stable traits across five dimensions.",
    },
    questions_count: 120,
    time_minutes: 20,
    highlight_priority: 90,
  },
  {
    slug: SCALE_CANONICAL_SLUG_MAP.EQ_60,
    scale_code: "EQ_60",
    title: { zh: "EQ 情商测试", en: "EQ Emotional Intelligence Test" },
    description: {
      zh: "了解你在情绪识别与协作沟通中的表现。",
      en: "Understand how you handle emotion recognition and collaborative communication.",
    },
    questions_count: 60,
    time_minutes: 10,
    highlight_priority: 80,
  },
  {
    slug: SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN,
    scale_code: "IQ_RAVEN",
    title: { zh: "IQ 智商测试", en: "IQ Test" },
    description: {
      zh: "快速了解你的认知能力基线。",
      en: "Get a quick baseline for cognitive ability.",
    },
    questions_count: 60,
    time_minutes: 12,
    highlight_priority: 70,
  },
  {
    slug: SCALE_CANONICAL_SLUG_MAP.CLINICAL_COMBO_68,
    scale_code: "CLINICAL_COMBO_68",
    title: { zh: "抑郁焦虑综合检测", en: "Depression & Anxiety Assessment" },
    description: {
      zh: "查看近期抑郁与焦虑状态的结构化参考。",
      en: "Review a structured reference for recent depression and anxiety state.",
    },
    questions_count: 68,
    time_minutes: 12,
    highlight_priority: 20,
  },
  {
    slug: SCALE_CANONICAL_SLUG_MAP.SDS_20,
    scale_code: "SDS_20",
    title: { zh: "抑郁状态自测", en: "Depression Screening Test" },
    description: {
      zh: "快速查看近期情绪低落与兴趣下降信号。",
      en: "Quickly review recent low mood and loss-of-interest signals.",
    },
    questions_count: 20,
    time_minutes: 5,
    highlight_priority: 10,
  },
];

function buildFallbackPublicTests(locale: Locale): TestListItem[] {
  return FALLBACK_PUBLIC_TEST_SEEDS.map((seed) => ({
    title: seed.title[locale],
    title_i18n: seed.title,
    slug: seed.slug,
    description: seed.description[locale],
    cover_image: DEFAULT_TEST_COVER_URL,
    questions_count: seed.questions_count,
    time_minutes: seed.time_minutes,
    scale_code: seed.scale_code,
    highlight_priority: seed.highlight_priority,
    is_public: true,
    is_active: true,
    is_indexable: true,
  }));
}

function mergeWithFallbackTests(items: TestListItem[], locale: Locale): TestListItem[] {
  const bySlug = new Map<string, TestListItem>();
  for (const fallback of buildFallbackPublicTests(locale)) {
    bySlug.set(fallback.slug, fallback);
  }
  for (const item of items) {
    bySlug.set(item.slug, item);
  }
  return [...bySlug.values()].sort(
    (a, b) => (b.highlight_priority ?? 0) - (a.highlight_priority ?? 0) || a.title.localeCompare(b.title)
  );
}

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function toString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? numberValue : 0;
}

function toStringRecord(value: unknown): Record<string, string> | undefined {
  const record = toRecord(value);
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(record)) {
    const normalized = toString(item);
    if (normalized) {
      out[key] = normalized;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

function normalizeCatalogItem(item: unknown): TestListItem | null {
  const row = toRecord(item);
  const scaleCode = normalizeSupportedScaleCode(toString(row.scale_code));
  const slug = scaleCode ? SCALE_CANONICAL_SLUG_MAP[scaleCode] : resolveCanonicalSlug(toString(row.slug));
  const title = toString(row.title);
  if (!slug || !title) return null;

  return {
    title,
    title_i18n: toStringRecord(row.title_i18n),
    slug,
    description: toString(row.description),
    cover_image: toString(row.cover_image) || DEFAULT_TEST_COVER_URL,
    questions_count: toNumber(row.questions_count),
    time_minutes: toNumber(row.time_minutes),
    scale_code: scaleCode ?? (toString(row.scale_code) || undefined),
    card_visual: toString(row.card_visual) || null,
    card_tone: toString(row.card_tone) || null,
    card_seed: toString(row.card_seed) || null,
    card_density: toString(row.card_density) || null,
    card_tagline_i18n: toStringRecord(row.card_tagline_i18n),
    highlight_priority: toNumber(row.highlight_priority),
    highlight_rating: toNumber(row.highlight_rating),
    highlight_excerpt_i18n: toStringRecord(row.highlight_excerpt_i18n),
    highlight_seo_copy_i18n: toStringRecord(row.highlight_seo_copy_i18n),
    is_public: typeof row.is_public === "boolean" ? row.is_public : undefined,
    is_active: typeof row.is_active === "boolean" ? row.is_active : undefined,
    is_indexable: typeof row.is_indexable === "boolean" ? row.is_indexable : undefined,
  };
}

export async function getAllTests(locale: Locale = "en"): Promise<TestListItem[]> {
  const apiLocale = locale === "zh" ? "zh-CN" : "en";
  let response: Response;
  try {
    response = await fetch(buildApiUrl(`/v0.3/scales/catalog?locale=${encodeURIComponent(apiLocale)}`), {
      headers: {
        Accept: "application/json",
        "X-FAP-Locale": apiLocale,
      },
      ...PUBLIC_API_CACHE_OPTIONS,
    });
  } catch {
    return mergeWithFallbackTests([], locale);
  }

  if (!response.ok) {
    return mergeWithFallbackTests([], locale);
  }

  let payload: Record<string, unknown>;
  try {
    payload = (await response.json()) as Record<string, unknown>;
  } catch {
    return mergeWithFallbackTests([], locale);
  }
  const items = Array.isArray(payload.items) ? payload.items : [];

  const normalizedItems = items
    .map(normalizeCatalogItem)
    .filter((item): item is TestListItem => item !== null);

  return mergeWithFallbackTests(normalizedItems, locale);
}

export function resolveTestTitleByLocale(
  test: Pick<TestListItem, "title" | "title_i18n">,
  locale: Locale
): string {
  const source = test.title_i18n;
  if (!source || typeof source !== "object") return test.title;

  const localized =
    locale === "zh"
      ? source.zh ?? source["zh-CN"] ?? source.en
      : source.en ?? source.zh ?? source["zh-CN"];

  if (typeof localized === "string" && localized.trim().length > 0) {
    return localized.trim();
  }
  return test.title;
}

export async function getTestBySlug(slug: string, locale: Locale = "en"): Promise<Test | null> {
  const normalizedSlug = resolveCanonicalSlug(slug);
  const tests = await getAllTests(locale);
  return tests.find((test) => test.slug === normalizedSlug) ?? null;
}
