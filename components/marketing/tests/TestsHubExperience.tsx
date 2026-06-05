import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import type { Locale } from "@/lib/i18n/locales";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import type { HubTestCardItem, TestsHubContent } from "@/lib/marketing/testsHubContent";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { cn } from "@/lib/utils";

const CORE_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
  ["enneagram-personality-test-nine-types"],
  ["iq-test-intelligence-quotient-assessment"],
  ["eq-test-emotional-intelligence-assessment"],
] as const;

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getCoreIndex(item: { href?: string | null; detailsHref?: string | null; key?: string | null }): number {
  const raw = `${item.key ?? ""} ${item.href ?? ""} ${item.detailsHref ?? ""}`.toLowerCase();
  const index = CORE_TEST_SLUG_GROUPS.findIndex((aliases) => aliases.some((slug) => raw.includes(slug)));
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
      if (index === Number.POSITIVE_INFINITY || seenCoreIndexes.has(index)) return false;
      seenCoreIndexes.add(index);
      return true;
    })
    .sort((a, b) => getCoreIndex(a) - getCoreIndex(b));
}

function getPrimaryAction(item: HubTestCardItem): { href: string; label: string } | null {
  const primaryHref = item.detailsHref ?? item.href;
  const primaryLabel = item.primaryLabel || item.primaryActions?.[0]?.label;

  if (!hasText(primaryHref) || !hasText(primaryLabel)) {
    return null;
  }

  return { href: primaryHref, label: primaryLabel };
}

function getTestDisplayTitle(item: HubTestCardItem, locale: Locale): string {
  if (locale !== "zh") return item.title;
  return getCoreIndex(item) === 4 ? "智商测试" : item.title;
}

function TestListCard({ item, locale, priority = false }: { item: HubTestCardItem; locale: Locale; priority?: boolean }) {
  const primaryAction = getPrimaryAction(item);
  const title = getTestDisplayTitle(item, locale);
  const shouldPreserveIqAccessiblePrefix = locale === "zh" && getCoreIndex(item) === 4;

  return (
    <article
      className={cn(
        "group relative flex min-h-[15rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-white p-5 text-slate-950 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md",
        priority && "border-teal-700/30 ring-1 ring-teal-700/15",
        !priority && "xl:h-[16.5rem]"
      )}
    >
      <div aria-hidden className={cn("absolute left-0 top-0 h-full w-1 bg-slate-200", priority && "bg-teal-700")} />
      <div className="flex items-start justify-between gap-5">
        <h2 className="m-0 text-[1.15rem] font-semibold leading-tight tracking-normal text-slate-950">
          {shouldPreserveIqAccessiblePrefix ? <span className="sr-only">IQ </span> : null}
          {title}
        </h2>
      </div>

      <p className="m-0 mt-4 text-sm leading-6 text-slate-600">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{item.questionsLabel}</span>
        <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">{item.durationLabel}</span>
        <span className="border border-teal-100 bg-teal-50 px-2.5 py-1 text-xs text-teal-800">{item.outputLabel}</span>
      </div>

      <CmsMediaAuthorityShell
        media={item.media ?? null}
        locale={locale}
        surface="tests_hub_card"
        visible={item.key === IQ_PUBLIC_SLUG}
      />

      <div className="mt-auto flex flex-wrap gap-3 pt-7">
        {primaryAction ? (
          <Link href={primaryAction.href} prefetch={false} className="inline-flex min-h-10 items-center justify-center rounded-md bg-teal-800 px-4 text-sm font-semibold text-white transition hover:bg-teal-900">
            {primaryAction.label}
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function TestsHubExperience({ content, locale }: { content: TestsHubContent; locale: Locale }) {
  const tests = listTests((content.families.items ?? []).map((family) => family.tests));
  const coreTests = listCoreTests(tests);

  return (
    <section className="bg-white py-16 text-slate-950 md:py-20" aria-labelledby="tests-hub-title">
      <Container className="max-w-[82rem] px-6 md:px-8">
        <div className="bg-[#008aa3] px-6 py-14 text-white shadow-[0_24px_70px_rgba(15,23,42,0.10)] md:px-12 lg:px-16">
          <h1 id="tests-hub-title" className="m-0 text-center text-4xl font-semibold tracking-normal text-white md:text-5xl">
            {locale === "zh" ? "热门测评" : "Highlighted tests"}
          </h1>
          <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {coreTests.map((item) => (
            <TestListCard key={item.key} item={item} locale={locale} />
          ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
