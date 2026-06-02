import Link from "next/link";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { Container } from "@/components/layout/Container";
import type { CmsArticle } from "@/lib/cms/articles";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/locales";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
import { extractTestSlugFromEntryHref, filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { cn } from "@/lib/utils";

type HomeLink = HomePageContent["quickStart"]["items"][number];
type TrustItem = HomePageContent["trust"]["items"][number];
type HomeArticle = CmsArticle;

const ARTICLE_AUTHOR_NAME = "Fermat Institute";
const PRIORITY_TEST_SLUG_GROUPS = [
  ["mbti-personality-test-16-personality-types"],
  ["big-five-personality-test-ocean-model"],
  ["holland-career-interest-test-riasec", "career-riasec"],
] as const;
const RIASEC_CANONICAL_TEST_PATH = "/tests/holland-career-interest-test-riasec";
const RIASEC_LEGACY_TEST_PATHS = ["/tests/career-riasec", "/zh/tests/career-riasec", "/en/tests/career-riasec"] as const;
const UNVERIFIED_SOCIAL_PROOF_PATTERNS = [
  /\d+\s*(?:万|百万|千万|亿)/i,
  /(?:百万|千万|上万|数万)\s*(?:用户|人|次)/i,
  /(?:用户|人)\s*(?:进行了|完成了|使用了)\s*(?:多次|测试|测评)/i,
  /(?:媒体|专家|博士|权威|评分|review|rating|stars?)/i,
] as const;

function withLocale(locale: Locale, path: string): string {
  return localizedPath(stripLocalePrefix(path), locale);
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function getPriorityIndex(item: { href?: string | null; key?: string | null }): number {
  const raw = `${item.key ?? ""} ${item.href ?? ""}`.toLowerCase();
  const index = PRIORITY_TEST_SLUG_GROUPS.findIndex((aliases) => aliases.some((slug) => raw.includes(slug)));
  return index === -1 ? Number.POSITIVE_INFINITY : index;
}

function orderPriorityFirst<T extends { href?: string | null; key?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => getPriorityIndex(a) - getPriorityIndex(b));
}

function normalizeCoreTestHref(href: string): string {
  if (RIASEC_LEGACY_TEST_PATHS.includes(href as (typeof RIASEC_LEGACY_TEST_PATHS)[number])) {
    return RIASEC_CANONICAL_TEST_PATH;
  }

  const stripped = stripLocalePrefix(href);
  const takePathMatch = stripped.match(/^\/tests\/([^/?#]+)\/take(?:[/?#].*)?$/);

  if (takePathMatch?.[1]) {
    return `/tests/${takePathMatch[1]}`;
  }

  return stripped;
}

function getCoreTestKey(item: { href?: string | null; key?: string | null; title?: string | null }): string {
  const href = normalizeCoreTestHref(item.href ?? "");
  const slug = extractTestSlugFromEntryHref(href);

  if (slug === "career-riasec") return "holland-career-interest-test-riasec";
  return slug ?? item.key ?? item.title ?? href;
}

function getHubCardAction(item: HubTestCardItem): { href: string; label: string } | null {
  const href = item.detailsHref ?? item.href;
  const label = item.primaryLabel || item.primaryActions?.[0]?.label;

  if (!hasText(href) || !hasText(label)) return null;
  return { href: normalizeCoreTestHref(href), label };
}

function homeLinkFromHubCard(item: HubTestCardItem): HomeLink | null {
  const action = getHubCardAction(item);

  if (!action) return null;

  return {
    key: item.key,
    title: item.title,
    description: item.description,
    href: action.href,
    label: action.label,
    meta: item.outputLabel || item.durationLabel || item.questionsLabel,
    media: item.media,
  };
}

function listCoreHomepageTests(copy: HomePageContent, supplementalTests: HubTestCardItem[]): HomeLink[] {
  const seen = new Set<string>();
  const items: HomeLink[] = [];
  const candidates = [
    ...(copy.quickStart.items ?? []).map((item) => ({ ...item, href: normalizeCoreTestHref(item.href) })),
    ...supplementalTests.map(homeLinkFromHubCard).filter((item): item is HomeLink => Boolean(item)),
  ];

  for (const item of orderPriorityFirst(filterVisiblePublicTestEntries(candidates))) {
    const key = getCoreTestKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
    if (items.length >= 6) break;
  }

  return items;
}

function containsUnverifiedSocialProofText(...values: Array<string | null | undefined>): boolean {
  const text = values.filter(hasText).join(" ");
  return UNVERIFIED_SOCIAL_PROOF_PATTERNS.some((pattern) => pattern.test(text));
}

function HomepageHeroV1({ locale, copy, coreTests = [] }: { locale: Locale; copy: HomePageContent; coreTests?: HomeLink[] }) {
  const ctas = [
    { label: copy.hero.primaryCta, href: copy.hero.primaryHref, variant: "primary" },
    { label: copy.hero.secondaryCta, href: copy.hero.secondaryHref, variant: "secondary" },
    { label: copy.hero.tertiaryCta, href: copy.hero.tertiaryHref, variant: "tertiary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));
  const priorityTests = coreTests.slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f5ef] px-0 py-12 text-slate-950 sm:py-14 lg:py-16">
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-slate-950/10" />
      <Container className="relative z-10 w-full max-w-7xl px-5 md:px-8 xl:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,0.72fr)] lg:items-end">
          <div>
            {hasText(copy.hero.eyebrow) ? (
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.hero.eyebrow}</p>
            ) : null}
            <h1 className="m-0 mt-4 max-w-4xl text-balance break-words text-[2.6rem] font-black leading-[1.03] tracking-normal text-slate-950 sm:text-[3.35rem] lg:text-[4.45rem]">
              {copy.hero.title}
            </h1>
            <p className="m-0 mt-6 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg lg:text-xl">
              {copy.hero.subhead}
            </p>
            {hasText(copy.hero.body) ? (
              <p className="m-0 mt-4 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">{copy.hero.body}</p>
            ) : null}
            {ctas.length > 0 ? (
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {ctas.map((item) => (
                  <Link
                    key={`${item.variant}-${item.href}`}
                    href={withLocale(locale, item.href)}
                    prefetch={false}
                    className={cn(
                      "inline-flex min-h-11 items-center justify-center rounded-md px-5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700",
                      item.variant === "primary" && "bg-teal-800 text-white hover:bg-teal-900",
                      item.variant === "secondary" && "border border-slate-300 bg-white text-slate-900 hover:border-teal-800 hover:text-teal-900",
                      item.variant === "tertiary" && "border border-transparent text-teal-900 underline underline-offset-4 hover:text-orange-700"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
            {(copy.hero.trustRail ?? []).length > 0 ? (
              <div className="mt-5 flex max-w-3xl flex-wrap gap-2">
                {(copy.hero.trustRail ?? []).map((item) => (
                  <span key={item} className="border border-slate-200 bg-white/70 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {item}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {priorityTests.length > 0 ? (
            <div className="border border-slate-300 bg-white/82 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
              <div className="grid border-b border-slate-200 bg-slate-950 text-white sm:grid-cols-[1fr_auto]">
                <div className="px-4 py-3">
                  {hasText(copy.quickStart.kicker) ? (
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-teal-100">{copy.quickStart.kicker}</p>
                  ) : null}
                </div>
                {hasText(copy.header.browseAllLabel) ? (
                  <Link href={withLocale(locale, "/tests")} prefetch={false} className="border-t border-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:border-l sm:border-t-0">
                    {copy.header.browseAllLabel}
                  </Link>
                ) : null}
              </div>
              <div>
                {priorityTests.map((item, index) => (
                  <Link
                    key={`hero-${getCoreTestKey(item)}`}
                    href={withLocale(locale, item.href)}
                    prefetch={false}
                    className="grid grid-cols-[2.75rem_1fr_auto] items-center gap-3 border-b border-slate-200 px-4 py-4 transition last:border-b-0 hover:bg-slate-50"
                  >
                    <span className="font-mono text-xs font-semibold text-slate-500">{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block text-sm font-semibold leading-5 text-slate-950">{item.title}</span>
                      {hasText(item.meta) ? <span className="mt-1 block text-xs text-slate-500">{item.meta}</span> : null}
                    </span>
                    <span aria-hidden className="text-sm font-semibold text-teal-800">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </Container>
      {/* legacy contract marker only, not rendered: min-h-[34rem] overflow-hidden bg-orange-50 / rounded-[100%] bg-white */}
    </section>
  );
}

function TrustIcon({ index }: { index: number }) {
  const iconClassName = "mx-auto h-[58px] w-[58px] text-[#008fb3]";
  const commonProps = {
    viewBox: "0 0 80 80",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: iconClassName,
    "aria-hidden": true,
  };

  if (index === 1) {
    return (
      <svg {...commonProps}>
        <path d="M40 8 64 17v18c0 17.5-10.5 29.5-24 36-13.5-6.5-24-18.5-24-36V17l24-9Z" />
        <path d="M30 37v-6c0-6 4-10 10-10s10 4 10 10v6" />
        <rect x="28" y="36" width="24" height="20" rx="3" />
        <path d="M40 44v6" />
      </svg>
    );
  }

  if (index === 2) {
    return (
      <svg {...commonProps}>
        <circle cx="40" cy="25" r="9" />
        <path d="M25 64v-8c0-9 6-16 15-16s15 7 15 16v8" />
        <circle cx="20" cy="32" r="7" />
        <path d="M8 63v-6c0-7 5-12 12-12 4 0 7 1.5 9 4" />
        <circle cx="60" cy="32" r="7" />
        <path d="M72 63v-6c0-7-5-12-12-12-4 0-7 1.5-9 4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <rect x="15" y="24" width="50" height="36" rx="2.5" />
      <path d="M30 24v-7h20v7" />
      <path d="M15 37h18" />
      <path d="M47 37h18" />
      <path d="M37 37h6" />
      <path d="M40 34c-3 0-5 2.4-5 5.2 0 2.2 1.3 4 3.1 4.8v8h3.8v-8c1.8-.8 3.1-2.6 3.1-4.8 0-2.8-2-5.2-5-5.2Z" />
      <path d="M20 60h40" />
    </svg>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  return (
    <article className="min-h-[260.78px] rounded-lg bg-white px-4 pb-4 pt-10 text-center shadow-[0_5px_20px_rgba(0,0,0,0.1)]">
      <TrustIcon index={index} />
      <h2 className="m-0 mt-3 text-[1.02rem] font-bold leading-snug tracking-normal text-[#20252d]">{item.title}</h2>
      <p className="m-0 mx-auto mt-2 max-w-[17.5rem] text-[0.9rem] font-normal leading-[1.48] tracking-normal text-[#5f6670]">
        {item.summary}
      </p>
    </article>
  );
}

function HomepageTrustStripV1({ copy }: { copy: HomePageContent }) {
  const trustItems = (copy.trust.items ?? []).filter((item) => !containsUnverifiedSocialProofText(item.title, item.summary));

  if (trustItems.length === 0) return null;

  return (
    <section className="relative z-20 bg-white py-12 md:py-16" aria-label={copy.trust.title}>
      <Container className="max-w-[1140px] px-6 min-[1400px]:max-w-[1320px]">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {hasText(copy.trust.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.trust.kicker}</p> : null}
          <h2 className="m-0 mt-3 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">{copy.trust.title}</h2>
          {hasText(copy.trust.body) ? <p className="m-0 mt-4 text-base leading-7 text-slate-600">{copy.trust.body}</p> : null}
          {hasText(copy.trust.methodHref) && hasText(copy.trust.methodLabel) ? (
            <Link href={copy.trust.methodHref} prefetch={false} className="mt-5 inline-flex text-sm font-semibold text-teal-800 underline underline-offset-4">
              {copy.trust.methodLabel}
            </Link>
          ) : null}
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {trustItems.map((item, index) => (
            <TrustCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function TestFeatureCard({ locale, item, priority, index }: { locale: Locale; item: HomeLink; priority: boolean; index: number }) {
  const href = withLocale(locale, item.href);

  return (
    <article className="group">
      <div
        className={cn(
          "relative flex h-full min-h-[11rem] flex-col overflow-hidden rounded-md border border-slate-200 bg-white p-5 text-slate-950 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md",
          priority && "border-teal-700/30 ring-1 ring-teal-700/15"
        )}
      >
        <div aria-hidden className={cn("absolute left-0 top-0 h-full w-1 bg-slate-200", priority && "bg-teal-700")} />
        <div className="flex items-start gap-4">
          <span className="mt-0.5 inline-flex h-7 w-8 shrink-0 items-center justify-center border border-slate-200 bg-slate-50 font-mono text-xs font-semibold text-slate-600">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="m-0 text-lg font-semibold leading-snug tracking-normal text-slate-950">
            {item.title}
          </h3>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hasText(item.meta) ? (
            <span className="border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
              {item.meta}
            </span>
          ) : null}
        </div>
        {hasText(item.description) ? <p className="m-0 mt-4 text-sm leading-6 text-slate-600">{item.description}</p> : null}
        <CmsMediaAuthorityShell
          media={item.media ?? null}
          locale={locale}
          surface="home_quick_start"
          visible={item.href.includes(IQ_PUBLIC_SLUG) || item.key === IQ_PUBLIC_SLUG}
        />
        {hasText(item.label) ? (
          <Link
            href={href}
            prefetch={false}
            className="mt-auto inline-flex min-h-10 items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm font-semibold text-teal-800 transition group-hover:text-orange-700"
          >
            {item.label}
            <span aria-hidden className="ml-1">→</span>
          </Link>
        ) : null}
      </div>
    </article>
  );
}

function HomepageHighlightedTestsBanner({
  locale,
  copy,
  supplementalTests,
}: {
  locale: Locale;
  copy: HomePageContent;
  supplementalTests: HubTestCardItem[];
}) {
  const items = listCoreHomepageTests(copy, supplementalTests);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-slate-50 py-14 text-slate-950 md:py-16" aria-labelledby="homepage-core-tests-title">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:100%_48px]" />
      <Container className="max-w-7xl px-5 md:px-8 xl:px-10">
        <div className="relative grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            {hasText(copy.quickStart.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.quickStart.kicker}</p> : null}
            <h2
              id="homepage-core-tests-title"
              className="m-0 mt-3 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl"
            >
              {copy.quickStart.title}
            </h2>
            {hasText(copy.quickStart.body) ? <p className="m-0 mt-4 max-w-2xl text-base leading-7 text-slate-600">{copy.quickStart.body}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Link
              href={withLocale(locale, "/tests")}
              prefetch={false}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-teal-800 px-5 text-sm font-semibold text-white transition hover:bg-teal-900"
            >
              {copy.header.browseAllLabel}
            </Link>
            {hasText(copy.hero.primaryCta) && hasText(copy.hero.primaryHref) ? (
              <Link
                href={withLocale(locale, copy.hero.primaryHref)}
                prefetch={false}
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
              >
                {copy.hero.primaryCta}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <TestFeatureCard
              key={getCoreTestKey(item)}
              locale={locale}
              item={item}
              index={index}
              priority={getPriorityIndex(item) !== Number.POSITIVE_INFINITY}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}

function HomepageFamilyMatrix({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const families = (copy.families.items ?? [])
    .map((family) => ({
      ...family,
      links: filterVisiblePublicTestEntries(family.links ?? []),
    }))
    .filter((family) => hasText(family.title) && hasText(family.exploreHref));

  if (families.length === 0) return null;

  return (
    <section className="border-b border-slate-200 bg-white py-14 md:py-16" aria-labelledby="homepage-family-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="grid gap-4 md:grid-cols-[0.7fr_1fr] md:items-end">
          {hasText(copy.families.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.families.kicker}</p> : null}
          <div>
            <h2 id="homepage-family-title" className="m-0 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
              {copy.families.title}
            </h2>
            {hasText(copy.families.body) ? <p className="m-0 mt-3 text-base leading-7 text-slate-600">{copy.families.body}</p> : null}
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {families.map((family) => (
            <article key={family.title} className="flex h-full flex-col rounded-md border border-slate-200 bg-slate-50 p-5">
              <h3 className="m-0 text-lg font-semibold text-slate-950">{family.title}</h3>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{family.description}</p>
              {(family.links ?? []).length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {(family.links ?? []).slice(0, 4).map((item) => (
                    <Link key={`${family.title}-${item.title}`} href={withLocale(locale, item.href)} prefetch={false} className="border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-teal-800">
                      {item.title}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link
                href={withLocale(locale, family.exploreHref)}
                prefetch={false}
                className="mt-auto inline-flex pt-6 text-sm font-semibold text-teal-800 underline underline-offset-4 hover:text-orange-700"
              >
                {family.exploreLabel}
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function HomepageResultPreview({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const previews = copy.results.previews ?? [];

  if (previews.length === 0) return null;

  return (
    <section className="border-b border-slate-800 bg-slate-950 py-16 text-white md:py-20" aria-labelledby="homepage-results-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            {hasText(copy.results.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">{copy.results.kicker}</p> : null}
            <h2 id="homepage-results-title" className="m-0 mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              {copy.results.title}
            </h2>
            {hasText(copy.results.body) ? <p className="m-0 mt-5 text-base leading-7 text-slate-300">{copy.results.body}</p> : null}
            {hasText(copy.results.exampleHref) && hasText(copy.results.exampleLabel) ? (
              <Link href={withLocale(locale, copy.results.exampleHref)} prefetch={false} className="mt-6 inline-flex text-sm font-semibold text-orange-100 underline underline-offset-4">
                {copy.results.exampleLabel}
              </Link>
            ) : null}
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            {previews.map((preview) => (
              <article key={preview.title} data-tone={preview.tone} className="rounded-md border border-white/10 bg-white/[0.06] p-5">
                <h3 className="m-0 text-lg font-semibold text-white">{preview.title}</h3>
                {(preview.metrics ?? []).length > 0 ? (
                  <ul className="m-0 mt-4 space-y-2 p-0">
                    {(preview.metrics ?? []).map((metric) => (
                      <li key={metric} className="list-none border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-slate-200">
                        {metric}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HomepageSecondaryExplore({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  const items = copy.secondaryExplore.items ?? [];

  if (items.length === 0) return null;

  return (
    <section className="bg-white py-14 md:py-16" aria-labelledby="homepage-secondary-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          {hasText(copy.secondaryExplore.kicker) ? <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.secondaryExplore.kicker}</p> : null}
          <h2 id="homepage-secondary-title" className="m-0 mt-3 text-3xl font-semibold tracking-normal text-slate-950 md:text-4xl">
            {copy.secondaryExplore.title}
          </h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Link key={item.title} href={withLocale(locale, item.href)} prefetch={false} className="block rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h3 className="m-0 text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ArticleVisual({ index, title }: { index: number; title: string }) {
  const palettes = [
    "from-orange-100 via-slate-100 to-teal-100",
    "from-sky-100 via-orange-50 to-slate-100",
    "from-teal-100 via-sky-50 to-orange-100",
    "from-rose-100 via-orange-50 to-slate-100",
    "from-blue-100 via-teal-50 to-orange-100",
    "from-slate-100 via-orange-50 to-sky-100",
  ];

  return (
    <div className={cn("relative h-40 overflow-hidden bg-gradient-to-br", palettes[index % palettes.length])}>
      <div aria-hidden className="absolute -left-8 top-8 h-28 w-28 rounded-full bg-white/55" />
      <div aria-hidden className="absolute right-6 top-5 h-20 w-20 rounded-full border border-white/70" />
      <div aria-hidden className="absolute bottom-0 right-0 h-20 w-40 rounded-tl-full bg-white/45" />
      <p className="absolute bottom-5 left-5 right-5 m-0 text-sm font-semibold leading-5 text-slate-700">
        {title}
      </p>
    </div>
  );
}

function getArticleVisualTitle(article: HomeArticle, locale: Locale): string {
  return (
    article.tags[0]?.name ||
    article.category?.name ||
    (locale === "zh" ? "文章" : "Article")
  );
}

function ArticleCoverVisual({ article, index, locale }: { article: HomeArticle; index: number; locale: Locale }) {
  if (!article.coverImageUrl) {
    return <ArticleVisual index={index} title={getArticleVisualTitle(article, locale)} />;
  }

  return (
    <ArticleResponsiveImage
      src={article.coverImageUrl}
      alt={article.coverImageAlt ?? article.title}
      width={article.coverImageWidth}
      height={article.coverImageHeight}
      variants={article.coverImageVariants}
      mode="card"
      className="h-40"
    />
  );
}

function getArticleDisplayDate(article: HomeArticle, locale: Locale): string {
  const value = article.publishedAt ?? article.updatedAt ?? article.createdAt;
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  if (locale === "zh") {
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function HomepageArticlesBanner({ locale, articles }: { locale: Locale; articles: HomeArticle[] }) {
  const visibleArticles = articles.slice(0, 6);

  if (visibleArticles.length === 0) {
    return null;
  }

  const labels =
    locale === "zh"
      ? { title: "推荐阅读", all: "查看全部文章", author: "作者：" }
      : { title: "Recommended reading", all: "View all articles", author: "By " };

  return (
    <section className="bg-white py-20 md:py-24" aria-labelledby="homepage-articles-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="text-center">
          <h2
            id="homepage-articles-title"
            className="m-0 text-4xl font-semibold tracking-[-0.055em] text-slate-950 md:text-5xl"
          >
            {labels.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {visibleArticles.map((article, index) => (
            <article key={`${article.slug}-${article.locale}`} className="group">
              <Link href={withLocale(locale, `/articles/${article.slug}`)} prefetch={false} className="block">
                <ArticleCoverVisual article={article} index={index} locale={locale} />
                <h3 className="m-0 mt-5 text-3xl font-normal leading-tight tracking-[-0.055em] text-slate-900 transition group-hover:text-teal-800">
                  {article.title}
                </h3>
              </Link>
              <p className="m-0 mt-5 text-sm leading-6 text-slate-500">
                {labels.author}
                <span className="text-slate-700">{ARTICLE_AUTHOR_NAME}</span>
              </p>
              <p className="m-0 mt-1 text-sm text-slate-400">{getArticleDisplayDate(article, locale)}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={withLocale(locale, "/articles")}
            prefetch={false}
            className="inline-flex rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-teal-700 hover:text-teal-800"
          >
            {labels.all}
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function HomePageExperience({
  locale,
  copy,
  articles = [],
  supplementalTests = [],
}: {
  locale: Locale;
  copy: HomePageContent;
  articles?: HomeArticle[];
  supplementalTests?: HubTestCardItem[];
}) {
  return (
    <div className="bg-[#f7f5ef] text-slate-950">
      <HomepageHeroV1 locale={locale} copy={copy} coreTests={listCoreHomepageTests(copy, supplementalTests)} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests} />
      <HomepageFamilyMatrix locale={locale} copy={copy} />
      <HomepageResultPreview locale={locale} copy={copy} />
      <HomepageTrustStripV1 copy={copy} />
      <HomepageSecondaryExplore locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
