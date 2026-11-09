import { getCmsLandingSurfaceWithLastKnownGood } from "@/lib/cms/landing-surfaces";
import type { CmsMediaAuthorityMetadata } from "@/lib/cms/media";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";

export type TestsCategorySlug = "personality" | "career";

export type HubQuestionItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  scent: string[];
};

export type HubTestCardItem = {
  key: string;
  title: string;
  description: string;
  questionsLabel: string;
  durationLabel: string;
  outputLabel: string;
  href: string;
  primaryActions?: Array<{
    href: string;
    label: string;
    meta?: string;
  }>;
  detailsHref?: string;
  primaryLabel: string;
  secondaryLabel?: string;
  scientificBasis?: string;
  previewVariant: "summary" | "radar" | "bars" | "matrix";
  media?: CmsMediaAuthorityMetadata;
};

export type TestFamilyItem = {
  id: string;
  title: string;
  description: string;
  exploreHref: string;
  exploreLabel: string;
  representativeLabels: string[];
  tests: HubTestCardItem[];
};

export type HowToChooseItem = {
  title: string;
  description: string;
};

export type TrustItem = {
  title: string;
  body: string;
};

export type ResourceItem = {
  key: string;
  typeLabel: string;
  title: string;
  description: string;
  href: string;
};

export type TestsHubContent = {
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
    previewLabel: string;
    previewTitle: string;
    previewBody: string;
    previewFlow: string[];
    previewFamilies: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HubQuestionItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: TestFamilyItem[];
  };
  howToChoose: {
    kicker: string;
    title: string;
    body: string;
    items: HowToChooseItem[];
  };
  trust: {
    title: string;
    items: TrustItem[];
  };
  resources: {
    kicker: string;
    title: string;
    body: string;
    items: ResourceItem[];
    allHref: string;
    allLabel: string;
  };
  finalCta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel: string;
    secondaryHref: string;
  };
};

export type CategoryContent = {
  slug: TestsCategorySlug;
  seo: {
    title: string;
    description: string;
  };
  breadcrumb: Array<{
    label: string;
    href?: string;
    path?: string;
  }>;
  hero: {
    eyebrow: string;
    title: string;
    body: string;
    points: string[];
  };
  featured: {
    kicker: string;
    title: string;
    body: string;
    items: HubTestCardItem[];
  };
  allTests: {
    kicker: string;
    title: string;
    body: string;
    items: HubTestCardItem[];
  };
  differences: {
    kicker: string;
    title: string;
    body: string;
    items: HowToChooseItem[];
  };
  resources: {
    kicker: string;
    title: string;
    body: string;
    items: ResourceItem[];
  };
  trust: {
    title: string;
    items: TrustItem[];
  };
  finalCta: {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
  };
};

function assertHubContent(value: unknown): TestsHubContent {
  const content = value as TestsHubContent;
  if (!content?.seo?.title || !content?.hero?.title || !Array.isArray(content?.families?.items)) {
    throw new Error("Invalid CMS tests hub payload.");
  }

  return content;
}

function assertCategoryContent(value: unknown, slug: TestsCategorySlug): CategoryContent {
  const content = value as CategoryContent;
  if (!content?.seo?.title || !content?.hero?.title || !Array.isArray(content?.featured?.items)) {
    throw new Error(`Invalid CMS tests category payload: ${slug}.`);
  }

  return {
    ...content,
    slug,
    featured: {
      ...content.featured,
      items: filterVisiblePublicTestEntries(content.featured.items ?? []),
    },
    allTests: {
      ...content.allTests,
      items: filterVisiblePublicTestEntries(content.allTests.items ?? []),
    },
  };
}

function uniqueCards(groups: HubTestCardItem[][]): HubTestCardItem[] {
  const seen = new Set<string>();
  const cards: HubTestCardItem[] = [];

  for (const group of groups) {
    for (const card of group) {
      if (seen.has(card.key)) continue;
      seen.add(card.key);
      cards.push(card);
    }
  }

  return cards;
}

export function listTestsCategorySlugs(): TestsCategorySlug[] {
  return ["personality", "career"];
}

function getFreeTestName(item: Pick<HubTestCardItem, "key" | "title" | "href" | "detailsHref">): string | null {
  const raw = `${item.key ?? ""} ${item.title ?? ""} ${item.href ?? ""} ${item.detailsHref ?? ""}`.toLowerCase();

  if (raw.includes("mbti")) return "MBTI";
  if (raw.includes("big-five") || raw.includes("big five") || raw.includes("大五")) return "大五人格";
  if (raw.includes("holland") || raw.includes("riasec") || raw.includes("霍兰德")) return "霍兰德职业兴趣";
  if (raw.includes("enneagram") || raw.includes("九型")) return "九型人格";
  if (raw.includes("iq") || raw.includes("智商")) return "智商";
  if (raw.includes("eq") || raw.includes("情商")) return "情商";

  return null;
}

export function getFreeTestPrimaryLabel(
  item: Pick<HubTestCardItem, "key" | "title" | "href" | "detailsHref" | "primaryLabel">,
  locale: DisplayLocale,
): string {
  const name = getFreeTestName(item);
  if (!name) return item.primaryLabel;

  if (locale === "zh-TW") {
    const taiwanNames: Record<string, string> = {
      MBTI: "MBTI", 大五人格: "大五人格", 霍兰德职业兴趣: "霍蘭德職業興趣",
      九型人格: "九型人格", 智商: "智商", 情商: "情緒智力",
    };
    return `開始免費 ${taiwanNames[name]} 測驗`;
  }

  if (locale === "en") {
    const englishNames: Record<string, string> = {
      MBTI: "MBTI", 大五人格: "Big Five", 霍兰德职业兴趣: "Holland career interest",
      九型人格: "Enneagram", 智商: "IQ", 情商: "EQ",
    };
    return `Start a free ${englishNames[name]} test`;
  }

  return name === "MBTI" ? "开始 MBTI 免费测试" : `开始${name}免费测试`;
}

export async function getTestsHubContent(locale: DisplayLocale): Promise<TestsHubContent> {
  const surface = await getCmsLandingSurfaceWithLastKnownGood<TestsHubContent>("tests", locale);
  const content = assertHubContent(surface.value.payloadJson);

  return {
    ...content,
    quickStart: {
      ...content.quickStart,
      items: filterVisiblePublicTestEntries(content.quickStart.items ?? []),
    },
    families: {
      ...content.families,
      items: content.families.items.map((family) => ({
        ...family,
        tests: filterVisiblePublicTestEntries(family.tests ?? []),
      })),
    },
  };
}

export async function getTestsCategoryContent(locale: DisplayLocale, slug: TestsCategorySlug): Promise<CategoryContent> {
  const surface = await getCmsLandingSurfaceWithLastKnownGood<CategoryContent>(`tests_category_${slug}`, locale);
  if (locale === "zh-TW" && (surface.value.schemaVersion !== "tests-category.v1" || surface.value.payloadJson?.slug !== slug)) {
    throw new Error(`Invalid CMS Taiwan tests category identity: ${slug}.`);
  }
  return assertCategoryContent(surface.value.payloadJson, slug);
}

export async function listVisibleTestsHubCards(locale: DisplayLocale): Promise<HubTestCardItem[]> {
  const content = await getTestsHubContent(locale);
  return filterVisiblePublicTestEntries(uniqueCards(content.families.items.map((family) => family.tests)));
}

export async function listAllContentTestsHubCards(locale: Locale): Promise<HubTestCardItem[]> {
  const content = await getTestsHubContent(locale);
  return filterVisiblePublicTestEntries(uniqueCards(content.families.items.map((family) => family.tests)));
}
