import { InteractiveStoryLibrary } from "@/components/entertainment/InteractiveStoryLibrary";
import { MoreTests } from "@/components/entertainment/MoreTests";
import type { DisplayLocale } from "@/lib/i18n/locales";
import type {
  HubTestCardItem,
  TestsHubContent,
} from "@/lib/marketing/testsHubContent";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { isCoreAssessmentSlug } from "@/lib/tests/coreAssessmentSlugs";

const CORE_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
  ["enneagram-personality-test-nine-types"],
  ["iq-test-intelligence-quotient-assessment"],
  ["eq-test-emotional-intelligence-assessment"],
] as const;

function getCoreIndex(item: {
  href?: string | null;
  detailsHref?: string | null;
  key?: string | null;
}): number {
  const raw =
    `${item.key ?? ""} ${item.href ?? ""} ${item.detailsHref ?? ""}`.toLowerCase();
  const index = CORE_TEST_SLUG_GROUPS.findIndex((aliases) =>
    aliases.some((slug) => raw.includes(slug)),
  );
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function listTests(items: HubTestCardItem[][]): HubTestCardItem[] {
  const seen = new Set<string>();
  const ordered: HubTestCardItem[] = [];

  for (const group of items) {
    for (const item of group) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      ordered.push(item);
    }
  }

  return filterVisiblePublicTestEntries(ordered);
}

function listCoreTests(items: HubTestCardItem[]): HubTestCardItem[] {
  const seenCoreIndexes = new Set<number>();

  return items
    .filter((item) => {
      const index = getCoreIndex(item);
      if (index === Number.POSITIVE_INFINITY || seenCoreIndexes.has(index))
        return false;
      seenCoreIndexes.add(index);
      return true;
    })
    .sort((a, b) => getCoreIndex(a) - getCoreIndex(b));
}

export function TestsHubExperience({
  content,
  locale,
}: {
  content: TestsHubContent;
  locale: DisplayLocale;
}) {
  const tests = listTests(
    (content.families.items ?? []).map((family) => family.tests),
  );
  const coreTests = listCoreTests(tests);
  const traditionalHref = (href: string) => {
    const match = /^\/(?:en|zh|zh-TW)\/tests\/([a-z0-9_-]+)(?:\/take)?(?=[?#]|$)/u.exec(href);
    return match && isCoreAssessmentSlug(match[1])
      ? href.replace(/^\/(?:en|zh|zh-TW)(?=\/)/u, "/zh-TW")
      : href;
  };
  const displayCoreTests = locale === "zh-TW"
    ? coreTests.map((test) => ({ ...test, href: traditionalHref(test.href), detailsHref: test.detailsHref ? traditionalHref(test.detailsHref) : test.detailsHref }))
    : coreTests;
  return (
    <>
    <MoreTests
      locale={locale}
      coreTests={displayCoreTests}
      heroTitle={content.hero.title}
    />
    <InteractiveStoryLibrary locale={locale} />
    </>
  );
}
