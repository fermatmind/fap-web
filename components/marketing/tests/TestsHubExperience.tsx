import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import type { Locale } from "@/lib/i18n/locales";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import type { HubQuestionItem, HubTestCardItem, TestFamilyItem, TestsHubContent } from "@/lib/marketing/testsHubContent";
import { filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { cn } from "@/lib/utils";

const PRIORITY_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
] as const;
const HIDDEN_CLINICAL_TEXT_PATTERNS = [
  "clinical-depression-anxiety-assessment-professional-edition",
  "depression-screening-test-standard-edition",
  "depression",
  "anxiety",
  "抑郁",
  "焦虑",
] as const;

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getPriorityIndex(item: { href?: string | null; detailsHref?: string | null; key?: string | null }): number {
  const raw = `${item.key ?? ""} ${item.href ?? ""} ${item.detailsHref ?? ""}`.toLowerCase();
  const index = PRIORITY_TEST_SLUG_GROUPS.findIndex((aliases) => aliases.some((slug) => raw.includes(slug)));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function containsHiddenClinicalText(...values: Array<string | string[] | null | undefined>): boolean {
  const text = values.flatMap((value) => (Array.isArray(value) ? value : [value])).join(" ").toLowerCase();
  return HIDDEN_CLINICAL_TEXT_PATTERNS.some((pattern) => text.includes(pattern));
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

function listPriorityTests(items: HubTestCardItem[]): HubTestCardItem[] {
  const seenPriorityIndexes = new Set<number>();

  return items
    .filter((item) => {
      const index = getPriorityIndex(item);
      if (index === Number.POSITIVE_INFINITY || seenPriorityIndexes.has(index)) return false;
      seenPriorityIndexes.add(index);
      return true;
    })
    .sort((a, b) => getPriorityIndex(a) - getPriorityIndex(b));
}

function getPrimaryAction(item: HubTestCardItem): { href: string; label: string } | null {
  const primaryHref = item.detailsHref ?? item.href;
  const primaryLabel = item.primaryLabel || item.primaryActions?.[0]?.label;

  if (!hasText(primaryHref) || !hasText(primaryLabel)) {
    return null;
  }

  return { href: primaryHref, label: primaryLabel };
}

function TestListCard({ item, locale, priority = false }: { item: HubTestCardItem; locale: Locale; priority?: boolean }) {
  const primaryAction = getPrimaryAction(item);

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
        <h2 className="m-0 text-[1.15rem] font-semibold leading-tight tracking-normal text-slate-950">{item.title}</h2>
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

function TestsHubHero({ content }: { content: TestsHubContent }) {
  const ctas = [
    { label: content.hero.primaryLabel, href: content.hero.primaryHref, variant: "primary" },
    { label: content.hero.secondaryLabel, href: content.hero.secondaryHref, variant: "secondary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));
  const previewFamilies = (content.hero.previewFamilies ?? []).filter((item) => !containsHiddenClinicalText(item));

  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
      <div>
      {hasText(content.hero.eyebrow) ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{content.hero.eyebrow}</p>
      ) : null}
      <h1 className="m-0 mt-3 max-w-4xl text-balance text-[clamp(2.2rem,4vw,3.9rem)] font-semibold leading-[1.02] tracking-normal text-slate-950">
        {content.hero.title}
      </h1>
      <p className="m-0 mt-5 max-w-3xl text-[1rem] leading-7 text-slate-600">
        {content.hero.body}
      </p>
      {ctas.length > 0 ? (
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          {ctas.map((item) => (
            <Link
              key={`${item.variant}-${item.href}`}
              href={item.href}
              prefetch={false}
              className={cn(
                "inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition",
                item.variant === "primary" && "bg-teal-800 text-white hover:bg-teal-900",
                item.variant === "secondary" && "border border-slate-300 bg-white text-slate-900 hover:border-teal-800 hover:text-teal-900"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
      </div>
      {(content.hero.previewFlow ?? []).length > 0 || previewFamilies.length > 0 ? (
        <div className="grid gap-3">
          {(content.hero.previewFlow ?? []).length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm">
              {hasText(content.hero.previewLabel) ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">{content.hero.previewLabel}</p> : null}
              {hasText(content.hero.previewTitle) ? <h2 className="m-0 mt-2 text-lg font-semibold text-slate-950">{content.hero.previewTitle}</h2> : null}
              {hasText(content.hero.previewBody) ? <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{content.hero.previewBody}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {(content.hero.previewFlow ?? []).map((item) => (
                  <span key={item} className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {previewFamilies.length > 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-4 text-left shadow-sm">
              <div className="flex flex-wrap gap-2">
                {previewFamilies.map((item) => (
                  <span key={item} className="border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function QuestionSelector({ items }: { items: HubQuestionItem[] }) {
  const visibleItems = filterVisiblePublicTestEntries(items ?? []).filter(
    (item) => hasText(item.title) && hasText(item.href) && !containsHiddenClinicalText(item.title, item.description, item.href, item.scent)
  );

  if (visibleItems.length === 0) return null;

  return (
    <div className="mt-10 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {visibleItems.map((item) => (
        <Link key={item.id} href={item.href} prefetch={false} className="block rounded-md border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md">
          <h2 className="m-0 text-base font-semibold text-slate-950">{item.title}</h2>
          <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
          {(item.scent ?? []).length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(item.scent ?? []).map((scent) => (
                <span key={`${item.id}-${scent}`} className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  {scent}
                </span>
              ))}
            </div>
          ) : null}
          {hasText(item.ctaLabel) ? <span className="mt-5 inline-flex text-sm font-semibold text-teal-800">{item.ctaLabel}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function PriorityTests({ tests, locale }: { tests: HubTestCardItem[]; locale: Locale }) {
  const priorityTests = listPriorityTests(tests);

  if (priorityTests.length === 0) return null;

  return (
    <div className="mt-10 grid gap-4 md:grid-cols-3">
      {priorityTests.map((item) => (
        <TestListCard key={item.key} item={item} locale={locale} priority />
      ))}
    </div>
  );
}

function FamilyBrowser({ families }: { families: TestFamilyItem[] }) {
  const visibleFamilies = (families ?? [])
    .map((family) => ({
      ...family,
      tests: filterVisiblePublicTestEntries(family.tests ?? []).filter(
        (item) =>
          !containsHiddenClinicalText(
            item.key,
            item.title,
            item.description,
            item.href,
            item.detailsHref,
            item.outputLabel,
            item.scientificBasis
          )
      ),
    }))
    .filter(
      (family) =>
        hasText(family.title) &&
        family.tests.length > 0 &&
        !containsHiddenClinicalText(family.id, family.title, family.description, family.exploreHref, family.representativeLabels)
    );

  if (visibleFamilies.length === 0) return null;

  return (
    <div className="mt-12 grid gap-5 lg:grid-cols-2">
      {visibleFamilies.map((family) => (
        <article key={family.id} className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 text-xl font-semibold text-slate-950">{family.title}</h2>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{family.description}</p>
            </div>
            {hasText(family.exploreHref) && hasText(family.exploreLabel) ? (
              <Link href={family.exploreHref} prefetch={false} className="shrink-0 text-sm font-semibold text-teal-800 underline underline-offset-4">
                {family.exploreLabel}
              </Link>
            ) : null}
          </div>
          {(family.representativeLabels ?? []).length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {(family.representativeLabels ?? []).map((label) => (
                <span key={`${family.id}-${label}`} className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-5 grid gap-2">
            {family.tests.map((item) => {
              const primaryAction = getPrimaryAction(item);

              return (
                <div key={`${family.id}-${item.key}`} className="border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="m-0 text-base font-semibold text-slate-950">{item.title}</h3>
                      <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                    </div>
                    {primaryAction ? (
                      <Link href={primaryAction.href} prefetch={false} className="shrink-0 text-sm font-semibold text-teal-800">
                        {primaryAction.label}
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}

function HowToChoose({ content }: { content: TestsHubContent }) {
  const items = content.howToChoose.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="tests-hub-how-title">
      <div className="mx-auto max-w-3xl text-center">
        {hasText(content.howToChoose.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{content.howToChoose.kicker}</p> : null}
        <h2 id="tests-hub-how-title" className="m-0 mt-3 text-3xl font-semibold text-slate-950">{content.howToChoose.title}</h2>
        {hasText(content.howToChoose.body) ? <p className="m-0 mt-4 text-base leading-7 text-slate-600">{content.howToChoose.body}</p> : null}
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-md border border-slate-200 bg-white p-5">
            <h3 className="m-0 text-lg font-semibold text-slate-950">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustBoundary({ content }: { content: TestsHubContent }) {
  const items = content.trust.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="tests-hub-trust-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="tests-hub-trust-title" className="m-0 text-3xl font-semibold text-slate-950">{content.trust.title}</h2>
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-md border border-slate-200 bg-white p-5">
            <h3 className="m-0 text-lg font-semibold text-slate-950">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResourceLinks({ content }: { content: TestsHubContent }) {
  const resources = filterVisiblePublicTestEntries(content.resources.items ?? []).filter(
    (item) => hasText(item.title) && hasText(item.href) && !containsHiddenClinicalText(item.key, item.title, item.description, item.href)
  );

  if (resources.length === 0) return null;

  return (
    <section className="mt-14 border-t border-slate-200 pt-10" aria-labelledby="tests-hub-resources-title">
      <div className="mx-auto max-w-3xl text-center">
        {hasText(content.resources.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{content.resources.kicker}</p> : null}
        <h2 id="tests-hub-resources-title" className="m-0 mt-3 text-3xl font-semibold text-slate-950">{content.resources.title}</h2>
        {hasText(content.resources.body) ? <p className="m-0 mt-4 text-base leading-7 text-slate-600">{content.resources.body}</p> : null}
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {resources.map((item) => (
          <Link key={item.key} href={item.href} prefetch={false} className="block rounded-md border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-teal-300">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal-800">{item.typeLabel}</span>
            <h3 className="m-0 mt-3 text-lg font-semibold text-slate-950">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
          </Link>
        ))}
      </div>
      {hasText(content.resources.allHref) && hasText(content.resources.allLabel) ? (
        <div className="mt-8 text-center">
          <Link href={content.resources.allHref} prefetch={false} className="inline-flex text-sm font-semibold text-teal-800 underline underline-offset-4">
            {content.resources.allLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

export function TestsHubExperience({ content, locale }: { content: TestsHubContent; locale: Locale }) {
  const tests = listTests((content.families.items ?? []).map((family) => family.tests));
  const secondaryTests = tests.filter((item) => getPriorityIndex(item) === Number.POSITIVE_INFINITY);
  const orderedTests = [...listPriorityTests(tests), ...secondaryTests];

  return (
    <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-slate-200 bg-[#f7f5ef] py-12 text-slate-950 md:py-16">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <Container className="relative max-w-[110rem] px-5 md:px-8 xl:px-12">
        <TestsHubHero content={content} />
        <QuestionSelector items={content.quickStart.items ?? []} />
        <PriorityTests tests={tests} locale={locale} />
        <FamilyBrowser families={content.families.items} />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedTests.map((item) => (
            <TestListCard key={item.key} item={item} locale={locale} />
          ))}
        </div>
        <HowToChoose content={content} />
        <TrustBoundary content={content} />
        <ResourceLinks content={content} />
      </Container>
    </section>
  );
}
