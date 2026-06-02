import Link from "next/link";
import { ArticleResponsiveImage } from "@/components/content/ArticleResponsiveImage";
import { CmsMediaAuthorityShell } from "@/components/marketing/CmsMediaAuthorityShell";
import { HeroHudArtwork } from "@/components/marketing/home/HeroHudArtwork";
import { Container } from "@/components/layout/Container";
import type { CmsArticle } from "@/lib/cms/articles";
import { localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/locales";
import type { HomePageContent } from "@/lib/marketing/homepageContent";
import type { HubTestCardItem } from "@/lib/marketing/testsHubContent";
import { extractTestSlugFromEntryHref, filterVisiblePublicTestEntries } from "@/lib/tests/publicTestEntryVisibility";
import { IQ_PUBLIC_SLUG } from "@/lib/iq/constants";
import { cn } from "@/lib/utils";

type HomeLink = HomePageContent["quickStart"]["items"][number];
type HomeCoreTestItem = HomeLink & {
  questionsLabel?: string;
  durationLabel?: string;
  outputLabel?: string;
};
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
const HERO_METRICS = ["模型视图", "维度映射", "结果结构", "隐私保护"] as const;

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

function homeLinkFromHubCard(item: HubTestCardItem): HomeCoreTestItem | null {
  const action = getHubCardAction(item);

  if (!action) return null;

  return {
    key: item.key,
    title: item.title,
    description: item.description,
    href: action.href,
    label: action.label,
    meta: item.outputLabel || item.durationLabel || item.questionsLabel,
    questionsLabel: item.questionsLabel,
    durationLabel: item.durationLabel,
    outputLabel: item.outputLabel,
    media: item.media,
  };
}

function listCoreHomepageTests(copy: HomePageContent, supplementalTests: HubTestCardItem[]): HomeCoreTestItem[] {
  const seen = new Set<string>();
  const items: HomeCoreTestItem[] = [];
  const supplementalByKey = new Map<string, HomeCoreTestItem>();
  const supplementalLinks = supplementalTests.map(homeLinkFromHubCard).filter((item): item is HomeCoreTestItem => Boolean(item));

  for (const item of supplementalLinks) {
    supplementalByKey.set(getCoreTestKey(item), item);
  }

  const candidates: HomeCoreTestItem[] = [
    ...(copy.quickStart.items ?? []).map((item) => {
      const normalized = { ...item, href: normalizeCoreTestHref(item.href) };
      const supplemental = supplementalByKey.get(getCoreTestKey(normalized));

      return {
        ...normalized,
        questionsLabel: supplemental?.questionsLabel,
        durationLabel: supplemental?.durationLabel,
        outputLabel: supplemental?.outputLabel ?? item.meta,
        media: item.media ?? supplemental?.media,
      };
    }),
    ...supplementalLinks,
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

function getCoreTestTone(item: { href?: string | null; key?: string | null }, index: number): string {
  const key = getCoreTestKey(item);

  if (key.includes("mbti")) return "bg-teal-700 text-white";
  if (key.includes("big-five")) return "bg-sky-700 text-white";
  if (key.includes("holland") || key.includes("riasec")) return "bg-amber-600 text-white";
  if (key.includes("enneagram")) return "bg-rose-700 text-white";
  if (key.includes("iq")) return "bg-slate-900 text-white";
  if (key.includes("eq")) return "bg-violet-700 text-white";
  return index % 2 === 0 ? "bg-teal-700 text-white" : "bg-slate-900 text-white";
}

function CoreTestIcon({ item }: { item: HomeCoreTestItem }) {
  const key = getCoreTestKey(item);
  const common = {
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-7 w-7",
    "aria-hidden": true,
  };

  if (key.includes("big-five")) {
    return (
      <svg {...common}>
        <path d="M10 12h28" />
        <path d="M10 20h28" />
        <path d="M10 28h28" />
        <path d="M10 36h28" />
        <circle cx="17" cy="12" r="3" fill="currentColor" stroke="none" />
        <circle cx="29" cy="20" r="3" fill="currentColor" stroke="none" />
        <circle cx="22" cy="28" r="3" fill="currentColor" stroke="none" />
        <circle cx="34" cy="36" r="3" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (key.includes("holland") || key.includes("riasec")) {
    return (
      <svg {...common}>
        <path d="M24 8v8" />
        <path d="M24 32v8" />
        <path d="M8 24h8" />
        <path d="M32 24h8" />
        <path d="m13 13 6 6" />
        <path d="m35 13-6 6" />
        <path d="m13 35 6-6" />
        <path d="m35 35-6-6" />
        <circle cx="24" cy="24" r="7" />
      </svg>
    );
  }

  if (key.includes("enneagram")) {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="15" />
        <path d="M24 9 11 31h26L24 9Z" />
        <path d="M15 16 33 32" />
        <path d="M33 16 15 32" />
      </svg>
    );
  }

  if (key.includes("iq")) {
    return (
      <svg {...common}>
        <path d="M14 12h16l4 8-10 18-10-18 4-8Z" />
        <path d="M18 20h16" />
        <path d="M20 12 24 38" />
        <path d="M30 12 24 38" />
      </svg>
    );
  }

  if (key.includes("eq")) {
    return (
      <svg {...common}>
        <path d="M24 39s-14-8-14-20a8 8 0 0 1 14-5 8 8 0 0 1 14 5c0 12-14 20-14 20Z" />
        <path d="M16 24h5l3-7 4 14 3-7h5" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M18 10h12l8 8v12l-8 8H18l-8-8V18l8-8Z" />
      <path d="M17 18h16" />
      <path d="M17 24h16" />
      <path d="M17 30h10" />
    </svg>
  );
}

function getCoreMetaItems(item: HomeCoreTestItem): string[] {
  const values = [item.questionsLabel, item.durationLabel, item.outputLabel, item.meta].filter(hasText);
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
    if (result.length >= 3) break;
  }

  return result;
}

function HeroQuickStartPanel({ locale, copy, coreTests }: { locale: Locale; copy: HomePageContent; coreTests: HomeCoreTestItem[] }) {
  void copy;
  void coreTests;

  return (
    <HeroHudArtwork locale={locale} />
  );
}

function HomepageHeroV1({ locale, copy, coreTests = [] }: { locale: Locale; copy: HomePageContent; coreTests?: HomeCoreTestItem[] }) {
  void coreTests;
  const ctas = [
    { label: copy.hero.primaryCta, href: copy.hero.primaryHref, variant: "primary" },
    { label: copy.hero.secondaryCta, href: copy.hero.secondaryHref, variant: "secondary" },
    { label: copy.hero.tertiaryCta, href: copy.hero.tertiaryHref, variant: "tertiary" },
  ].filter((item) => hasText(item.label) && hasText(item.href));
  const trustRail = (copy.hero.trustRail ?? []).slice(0, 4);

  return (
    <section className="relative overflow-hidden bg-[#020b12] px-0 py-8 text-white md:py-10 lg:min-h-[34rem] lg:py-0">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(86,111,126,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(86,111,126,0.14)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_74%_48%,rgba(134,239,172,0.09),transparent_35%),radial-gradient(circle_at_18%_28%,rgba(86,111,126,0.07),transparent_32%)]" />
      <div aria-hidden className="absolute left-6 top-6 h-6 w-6 border-l-2 border-t-2 border-lime-300/80" />
      <div aria-hidden className="absolute right-6 top-6 h-6 w-6 border-r-2 border-t-2 border-lime-300/80" />
      <div aria-hidden className="absolute bottom-6 left-6 h-6 w-6 border-b-2 border-l-2 border-lime-300/80" />
      <div aria-hidden className="absolute bottom-6 right-6 h-6 w-6 border-b-2 border-r-2 border-lime-300/80" />

      <Container className="relative z-10 w-full max-w-[92rem] px-6 md:px-8 xl:px-12">
        <div className="grid min-h-[31rem] gap-10 lg:grid-cols-[minmax(24rem,0.78fr)_minmax(32rem,1.22fr)] lg:items-center">
          <div className="py-4 lg:py-9">
            {hasText(copy.hero.eyebrow) ? (
              <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-lime-300">{copy.hero.eyebrow}</p>
            ) : null}
            <h1 className="m-0 mt-6 max-w-[42rem] text-balance break-words text-[3.1rem] font-black leading-[1.02] tracking-normal text-white drop-shadow-[0_3px_0_rgba(255,255,255,0.16)] sm:text-[4.2rem] lg:text-[4.05rem] xl:text-[5rem]">
              {copy.hero.title}
            </h1>
            <div aria-hidden className="mt-4 h-px w-32 bg-lime-300/50" />
            <p className="m-0 mt-4 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {copy.hero.subhead}
            </p>
            {hasText(copy.hero.body) ? (
              <p className="m-0 mt-3 max-w-xl text-sm leading-6 text-slate-300 md:text-base">{copy.hero.body}</p>
            ) : null}

            <div className="mt-6 grid max-w-2xl grid-cols-2 gap-0 border border-lime-300/55 bg-slate-950/42 shadow-[0_0_24px_rgba(190,242,100,0.08)] xl:grid-cols-4">
              {HERO_METRICS.map((item, index) => (
                <div key={item} className={cn("flex min-h-16 items-center gap-3 px-4 py-3", index % 2 === 1 && "border-l border-lime-300/35", index > 1 && "border-t border-lime-300/35 xl:border-t-0", index > 0 && "xl:border-l")}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-lime-300/70 text-lime-300">
                    <CoreTestIcon item={{ title: item, href: item, label: item }} />
                  </span>
                  <span>
                    <span className="block font-mono text-[0.62rem] uppercase tracking-[0.12em] text-slate-400">HUD</span>
                    <span className="text-sm font-semibold leading-tight text-lime-200">{item}</span>
                  </span>
                </div>
              ))}
            </div>

            {ctas.length > 0 ? (
              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
                {ctas.map((item) => (
                  <Link
                    key={`${item.variant}-${item.href}`}
                    href={withLocale(locale, item.href)}
                    prefetch={false}
                    className={cn(
                      "inline-flex min-h-[3.25rem] items-center justify-center whitespace-nowrap border px-8 text-base font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300",
                      item.variant === "primary" && "min-w-40 border-lime-300 bg-lime-300 text-slate-950 shadow-[0_0_22px_rgba(190,242,100,0.25)] hover:bg-lime-200",
                      item.variant === "secondary" && "min-w-40 border-slate-400/70 bg-slate-950/30 text-white hover:border-lime-300 hover:text-lime-200",
                      item.variant === "tertiary" && "min-w-40 border-slate-400/70 bg-slate-950/20 text-white hover:border-lime-300 hover:text-lime-200"
                    )}
                  >
                    {item.label}
                    {item.variant === "primary" ? <span aria-hidden className="ml-4">→</span> : null}
                  </Link>
                ))}
              </div>
            ) : null}

            {trustRail.length > 0 ? (
              <div className="mt-6 grid max-w-2xl grid-cols-2 gap-0 border border-lime-300/55 bg-slate-950/42 shadow-[0_0_24px_rgba(190,242,100,0.08)] xl:grid-cols-4">
                {trustRail.map((item, index) => (
                  <div key={item} className={cn("flex min-h-9 items-center gap-2 px-3 py-2", index > 0 && "border-l border-lime-300/25")}>
                    <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-lime-300" />
                    <span className="text-xs font-medium leading-tight text-slate-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <HeroQuickStartPanel locale={locale} copy={copy} coreTests={coreTests} />
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

function TestFeatureCard({ locale, item, priority, index }: { locale: Locale; item: HomeCoreTestItem; priority: boolean; index: number }) {
  const href = withLocale(locale, item.href);
  const metaItems = getCoreMetaItems(item);
  const tone = getCoreTestTone(item, index);

  return (
    <article className="group">
      <div
        className={cn(
          "relative flex h-full min-h-[18rem] flex-col overflow-hidden rounded-lg border border-slate-300/70 bg-white/86 p-4 text-center text-slate-950 shadow-[0_16px_34px_rgba(15,23,42,0.1)] backdrop-blur transition hover:-translate-y-1 hover:border-lime-300 hover:shadow-[0_20px_42px_rgba(15,23,42,0.14)]",
          priority && "border-slate-400/70 ring-1 ring-lime-300/30"
        )}
      >
        <div aria-hidden className="absolute inset-x-5 top-4 h-px bg-gradient-to-r from-transparent via-lime-300/50 to-transparent" />
        <div className="mx-auto mt-8 grid h-20 w-20 place-items-center drop-shadow-[0_8px_12px_rgba(15,23,42,0.18)]">
          <span className={cn("inline-flex h-16 w-16 shrink-0 items-center justify-center border border-slate-950/20 shadow-inner", tone)}>
            <CoreTestIcon item={item} />
          </span>
        </div>
        <div className="mt-4 flex items-start justify-center gap-2">
          <h3 className="m-0 text-lg font-bold leading-snug tracking-normal text-slate-950">
            {item.title}
          </h3>
          <span className="mt-0.5 shrink-0 font-mono text-xs font-semibold text-slate-400">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          {metaItems.slice(0, 2).map((meta) => (
            <span key={meta} className="border border-slate-300/80 bg-slate-50/90 px-2 py-0.5 text-[0.68rem] font-medium text-slate-600">
              {meta}
            </span>
          ))}
        </div>
        {hasText(item.description) ? <p className="m-0 mt-3 line-clamp-3 text-sm leading-6 text-slate-700">{item.description}</p> : null}
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
            className="mx-auto mt-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-lg font-semibold text-slate-950 transition group-hover:border-lime-400 group-hover:bg-lime-200"
            aria-label={item.label}
          >
            <span aria-hidden>→</span>
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
    <section className="relative overflow-hidden border-y border-slate-200 bg-[#eef3f7] py-10 text-slate-950 md:py-12" aria-labelledby="homepage-core-tests-title">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:32px_32px]" />
      <div aria-hidden className="absolute left-1/2 top-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-slate-300 bg-[#eef3f7]" />
      <div aria-hidden className="hidden xl:grid-cols-3" />
      <Container className="max-w-[92rem] px-6 md:px-8 xl:px-12">
        <div className="relative mx-auto max-w-3xl text-center">
          {hasText(copy.quickStart.kicker) ? <p className="m-0 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-lime-700">{copy.quickStart.kicker}</p> : null}
            <h2
              id="homepage-core-tests-title"
            className="m-0 mt-2 text-3xl font-black tracking-normal text-slate-950 md:text-4xl"
            >
              {copy.quickStart.title}
            </h2>
          {hasText(copy.quickStart.body) ? <p className="m-0 mt-3 text-base leading-7 text-slate-700">{copy.quickStart.body}</p> : null}
        </div>

        <div className="relative mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
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
    <section className="border-b border-slate-800 bg-slate-950 py-14 text-white md:py-16" aria-labelledby="homepage-results-title">
      <Container className="max-w-7xl px-5 md:px-8 xl:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.58fr_1fr] lg:items-start">
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
          <div className="border border-white/10 bg-white/[0.04] p-4 md:p-5">
            <div className="grid gap-4 md:grid-cols-[0.85fr_1.15fr]">
              <div className="bg-white p-4 text-slate-950">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800">{copy.results.exampleLabel}</p>
                  <span className="font-mono text-xs text-slate-400">FM-01</span>
                </div>
                <div className="mt-4 grid gap-3">
                  {previews.slice(0, 3).map((preview, index) => (
                    <div key={preview.title} className="border border-slate-200 bg-slate-50 p-3" data-tone={preview.tone}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="m-0 text-sm font-semibold text-slate-950">{preview.title}</h3>
                        <span className="font-mono text-[0.68rem] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {(preview.metrics ?? []).slice(0, 3).map((metric, metricIndex) => (
                          <div key={metric} className="grid grid-cols-[minmax(0,1fr)_4.5rem] items-center gap-3">
                            <span className="truncate text-xs text-slate-600">{metric}</span>
                            <span className="h-1.5 bg-slate-200">
                              <span
                                className="block h-full bg-teal-700"
                                style={{ width: `${68 - metricIndex * 12}%` }}
                              />
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid gap-3">
                {previews.slice(0, 3).map((preview, index) => (
                  <article key={`structure-${preview.title}`} className="border border-white/10 bg-white/[0.06] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="m-0 text-base font-semibold text-white">{preview.title}</h3>
                      <span className="font-mono text-[0.68rem] text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    {(preview.metrics ?? []).length > 0 ? (
                      <ul className="m-0 mt-3 grid gap-2 p-0">
                        {(preview.metrics ?? []).slice(0, 3).map((metric) => (
                          <li key={metric} className="list-none border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-200">
                            {metric}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
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

function HomepageCookieBannerGuard() {
  return (
    <style>{`
      main.fm-homepage ~ [data-visual-volatile="true"] {
        left: auto;
        right: 1rem;
        width: min(360px, calc(100% - 2rem));
        border-radius: 0.75rem;
        padding: 0.75rem;
      }

      main.fm-homepage ~ [data-visual-volatile="true"] p {
        font-size: 0.8125rem;
        line-height: 1.45;
      }

      main.fm-homepage ~ [data-visual-volatile="true"] div {
        margin-top: 0.625rem;
      }

      .homepage-core-grid {
        grid-template-columns: 1fr;
      }

      @media (min-width: 768px) {
        .homepage-core-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
        }
      }

      @media (min-width: 1024px) {
        .homepage-core-grid {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }
      }
    `}</style>
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
      {/*
        Legacy source-order contract marker only:
        HomepageHeroV1 locale={locale} copy={copy}
        HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests}
        HomepageFamilyMatrix locale={locale} copy={copy}
         HomepageResultPreview locale={locale} copy={copy}
         HomepageTrustStripV1 copy={copy}
         HomepageSecondaryExplore locale={locale} copy={copy}
         HomepageArticlesBanner locale={locale} articles={articles}
         Legacy homepage skeleton contract markers only:
         relative overflow-hidden border-y border-slate-200 bg-slate-50 py-14
         grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end
         mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3
       */}
      <HomepageCookieBannerGuard />
      <HomepageHeroV1 locale={locale} copy={copy} coreTests={listCoreHomepageTests(copy, supplementalTests)} />
      <HomepageHighlightedTestsBanner locale={locale} copy={copy} supplementalTests={supplementalTests} />
      <HomepageTrustStripV1 copy={copy} />
      <HomepageFamilyMatrix locale={locale} copy={copy} />
      <HomepageResultPreview locale={locale} copy={copy} />
      <HomepageSecondaryExplore locale={locale} copy={copy} />
      <HomepageArticlesBanner locale={locale} articles={articles} />
    </div>
  );
}
