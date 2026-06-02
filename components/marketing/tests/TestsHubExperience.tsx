import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { buttonVariants } from "@/components/ui/button";
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
        "group flex min-h-[19rem] flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-6 text-white shadow-[0_22px_80px_rgba(5,10,18,0.18)] transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.075]",
        priority && "border-orange-200/35 bg-white/[0.075] ring-1 ring-orange-200/30",
        !priority && "xl:h-[20.75rem]"
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <h2 className="m-0 text-[1.35rem] font-semibold leading-tight tracking-normal text-white">{item.title}</h2>
      </div>

      <p className="m-0 mt-5 text-base leading-7 text-slate-300">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{item.questionsLabel}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{item.durationLabel}</span>
        <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs text-orange-100">{item.outputLabel}</span>
      </div>

      <CmsMediaAuthorityShell
        media={item.media ?? null}
        locale={locale}
        surface="tests_hub_card"
        visible={item.key === IQ_PUBLIC_SLUG}
      />

      <div className="mt-auto flex flex-wrap gap-3 pt-7">
        {primaryAction ? (
          <Link href={primaryAction.href} prefetch={false} className={buttonVariants({ size: "sm", className: "px-4" })}>
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
    <div className="mx-auto max-w-5xl text-center">
      {hasText(content.hero.eyebrow) ? (
        <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">{content.hero.eyebrow}</p>
      ) : null}
      <h1 className="m-0 mt-3 text-balance text-[clamp(2.4rem,4vw,3.5rem)] font-semibold leading-[0.98] tracking-normal text-white md:whitespace-nowrap">
        {content.hero.title}
      </h1>
      <p className="m-0 mx-auto mt-6 max-w-[46rem] text-[1.05rem] leading-8 text-slate-300">
        {content.hero.body}
      </p>
      {ctas.length > 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {ctas.map((item) => (
            <Link
              key={`${item.variant}-${item.href}`}
              href={item.href}
              prefetch={false}
              className={cn(
                "inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition",
                item.variant === "primary" && "bg-white text-slate-950 hover:bg-orange-100",
                item.variant === "secondary" && "border border-white/20 text-white hover:border-white/45"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
      {(content.hero.previewFlow ?? []).length > 0 || previewFamilies.length > 0 ? (
        <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-2">
          {(content.hero.previewFlow ?? []).length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left">
              {hasText(content.hero.previewLabel) ? <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-orange-100">{content.hero.previewLabel}</p> : null}
              {hasText(content.hero.previewTitle) ? <h2 className="m-0 mt-2 text-lg font-semibold text-white">{content.hero.previewTitle}</h2> : null}
              {hasText(content.hero.previewBody) ? <p className="m-0 mt-2 text-sm leading-6 text-slate-300">{content.hero.previewBody}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {(content.hero.previewFlow ?? []).map((item) => (
                  <span key={item} className="rounded-full bg-white/[0.08] px-3 py-1 text-xs text-slate-200">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          {previewFamilies.length > 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left">
              <div className="flex flex-wrap gap-2">
                {previewFamilies.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
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
    <div className="mx-auto mt-12 grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visibleItems.map((item) => (
        <Link key={item.id} href={item.href} prefetch={false} className="block rounded-2xl border border-white/10 bg-white/[0.05] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075]">
          <h2 className="m-0 text-lg font-semibold text-white">{item.title}</h2>
          <p className="m-0 mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
          {(item.scent ?? []).length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(item.scent ?? []).map((scent) => (
                <span key={`${item.id}-${scent}`} className="rounded-full bg-white/[0.07] px-3 py-1 text-xs text-slate-300">
                  {scent}
                </span>
              ))}
            </div>
          ) : null}
          {hasText(item.ctaLabel) ? <span className="mt-5 inline-flex text-sm font-semibold text-orange-100">{item.ctaLabel}</span> : null}
        </Link>
      ))}
    </div>
  );
}

function PriorityTests({ tests, locale }: { tests: HubTestCardItem[]; locale: Locale }) {
  const priorityTests = listPriorityTests(tests);

  if (priorityTests.length === 0) return null;

  return (
    <div className="mx-auto mt-12 grid max-w-[92rem] gap-5 md:grid-cols-3">
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
    <div className="mx-auto mt-12 grid max-w-[92rem] gap-5 lg:grid-cols-2">
      {visibleFamilies.map((family) => (
        <article key={family.id} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="m-0 text-2xl font-semibold text-white">{family.title}</h2>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-300">{family.description}</p>
            </div>
            {hasText(family.exploreHref) && hasText(family.exploreLabel) ? (
              <Link href={family.exploreHref} prefetch={false} className="shrink-0 text-sm font-semibold text-orange-100 underline underline-offset-4">
                {family.exploreLabel}
              </Link>
            ) : null}
          </div>
          {(family.representativeLabels ?? []).length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {(family.representativeLabels ?? []).map((label) => (
                <span key={`${family.id}-${label}`} className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                  {label}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-6 grid gap-3">
            {family.tests.map((item) => {
              const primaryAction = getPrimaryAction(item);

              return (
                <div key={`${family.id}-${item.key}`} className="rounded-xl bg-white/[0.05] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="m-0 text-base font-semibold text-white">{item.title}</h3>
                      <p className="m-0 mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                    </div>
                    {primaryAction ? (
                      <Link href={primaryAction.href} prefetch={false} className="shrink-0 text-sm font-semibold text-orange-100">
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
    <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="tests-hub-how-title">
      <div className="mx-auto max-w-3xl text-center">
        {hasText(content.howToChoose.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">{content.howToChoose.kicker}</p> : null}
        <h2 id="tests-hub-how-title" className="m-0 mt-3 text-3xl font-semibold text-white">{content.howToChoose.title}</h2>
        {hasText(content.howToChoose.body) ? <p className="m-0 mt-4 text-base leading-7 text-slate-300">{content.howToChoose.body}</p> : null}
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <h3 className="m-0 text-lg font-semibold text-white">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
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
    <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="tests-hub-trust-title">
      <div className="mx-auto max-w-3xl text-center">
        <h2 id="tests-hub-trust-title" className="m-0 text-3xl font-semibold text-white">{content.trust.title}</h2>
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <h3 className="m-0 text-lg font-semibold text-white">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-300">{item.body}</p>
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
    <section className="mt-16 border-t border-white/10 pt-12" aria-labelledby="tests-hub-resources-title">
      <div className="mx-auto max-w-3xl text-center">
        {hasText(content.resources.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">{content.resources.kicker}</p> : null}
        <h2 id="tests-hub-resources-title" className="m-0 mt-3 text-3xl font-semibold text-white">{content.resources.title}</h2>
        {hasText(content.resources.body) ? <p className="m-0 mt-4 text-base leading-7 text-slate-300">{content.resources.body}</p> : null}
      </div>
      <div className="mx-auto mt-8 grid max-w-5xl gap-4 md:grid-cols-3">
        {resources.map((item) => (
          <Link key={item.key} href={item.href} prefetch={false} className="block rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:-translate-y-0.5 hover:border-white/20">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-orange-100">{item.typeLabel}</span>
            <h3 className="m-0 mt-3 text-lg font-semibold text-white">{item.title}</h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
          </Link>
        ))}
      </div>
      {hasText(content.resources.allHref) && hasText(content.resources.allLabel) ? (
        <div className="mt-8 text-center">
          <Link href={content.resources.allHref} prefetch={false} className="inline-flex text-sm font-semibold text-orange-100 underline underline-offset-4">
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
    <section className="min-h-[calc(100svh-4rem)] bg-[#0d141b] py-16 text-white md:py-20">
      <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
        <TestsHubHero content={content} />
        <QuestionSelector items={content.quickStart.items ?? []} />
        <PriorityTests tests={tests} locale={locale} />
        <FamilyBrowser families={content.families.items} />
        <div className="mx-auto mt-12 grid max-w-[92rem] gap-5 md:grid-cols-2 xl:grid-cols-3">
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
