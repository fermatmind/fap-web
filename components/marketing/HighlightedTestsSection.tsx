"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type {
  HomePathId,
  HomeTestId,
  HomepageContent,
  QuickBrowseFilterId,
} from "./homepageContent";

type HighlightedTestsSectionProps = {
  locale: Locale;
  content: Pick<HomepageContent, "paths" | "pathRecommendations" | "testCatalog" | "quickBrowse">;
};

function toLocalePath(path: string, locale: Locale) {
  return localizedPath(path, locale);
}

function dispatchSelectedPath(path: HomePathId) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("home-path-select", { detail: { path } }));
}

function getTestById(testCatalog: HomepageContent["testCatalog"], id: HomeTestId) {
  return testCatalog.find((item) => item.id === id);
}

function filterTests(
  tests: HomepageContent["testCatalog"],
  filterId: QuickBrowseFilterId,
) {
  if (filterId === "all") return tests;
  return tests.filter((item) => item.filterTags.includes(filterId));
}

function PathActionLinks({
  item,
  locale,
  compact = false,
  className,
}: {
  item: HomepageContent["testCatalog"][number];
  locale: Locale;
  compact?: boolean;
  className?: string;
}) {
  const withLocale = (path: string) => toLocalePath(path, locale);

  return (
    <div className={`mt-3 flex flex-wrap gap-2 ${className ?? ""}`}>
      <Link
        href={withLocale(`/tests/${item.slug}/take`)}
        className={buttonVariants({
          size: "sm",
          className: compact ? "h-auto min-h-[38px] px-3 text-xs" : "h-auto min-h-[40px]",
        })}
      >
        {item.primaryCta}
      </Link>
      <Link
        href={withLocale(`/tests/${item.slug}`)}
        className={buttonVariants({
          size: "sm",
          variant: compact ? "ghost" : "outline",
          className: compact ? "h-auto min-h-[38px] px-3 text-xs" : "h-auto min-h-[40px] border-slate-300",
        })}
      >
        {item.secondaryCta}
      </Link>
    </div>
  );
}

export function HighlightedTestsSection({ locale, content }: HighlightedTestsSectionProps) {
  const withLocale = (path: string) => toLocalePath(path, locale);
  const [selectedPath, setSelectedPath] = useState<HomePathId>("self");
  const [selectedFilter, setSelectedFilter] = useState<QuickBrowseFilterId>("all");

  const visibleTests = useMemo(
    () => filterTests(content.testCatalog, selectedFilter),
    [content.testCatalog, selectedFilter]
  );

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: HomePathId }>).detail;
      const path = detail?.path;
      if (path === "self" || path === "career" || path === "wellbeing") {
        setSelectedPath(path);
      }
    };

    window.addEventListener("home-path-select", handler);
    return () => window.removeEventListener("home-path-select", handler);
  }, []);

  const recommendation = content.pathRecommendations[selectedPath];
  const featuredTest = getTestById(content.testCatalog, recommendation.featured) ?? content.testCatalog[0];
  const secondaryTests = recommendation.secondary
    .map((id) => getTestById(content.testCatalog, id))
    .filter(Boolean);
  const pathCard = content.paths.cards[selectedPath];

  const quickBrowseTitle = content.quickBrowse.title;
  const quickBrowseSupporting = content.quickBrowse.supporting;

  const outcomeText =
    locale === "zh"
      ? `你会获得什么：${pathCard?.body ?? "更清晰的下一步方向"}`
      : `What you'll get: ${pathCard?.body ?? "clearer next-step direction"}`;

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-section-shell"
    >
      <Container className="max-w-[1200px] space-y-7">
        <header className="max-w-3xl space-y-2">
          <p className="fm-home-section-kicker">{content.paths.recommendationTitle}</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.paths.title}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.paths.supporting}</p>
        </header>

        <div className="grid gap-3 md:grid-cols-3">
          {(Object.entries(content.paths.cards) as Array<[HomePathId, (typeof content.paths.cards)[HomePathId]]>).map(
            ([path, item], index) => {
              const isActive = selectedPath === path;
              return (
                <button
                  key={`path-tab-${path}`}
                  type="button"
                  onClick={() => {
                    setSelectedPath(path);
                    dispatchSelectedPath(path);
                  }}
                  className={`rounded-xl border bg-white p-3 text-left transition duration-150 ${
                    isActive
                      ? "border-[var(--fm-trust-blue-strong)] shadow-[var(--fm-shadow-md)]"
                      : "border-[var(--fm-border)] text-[var(--fm-text-muted)]"
                  }`}
                  aria-pressed={isActive}
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-trust-blue)]">
                    {(index + 1).toString().padStart(2, "0")} / 03
                  </p>
                  <h3 className="m-0 mt-1 text-base font-semibold text-[var(--fm-text)]">{item.title}</h3>
                  <p className="m-0 mt-1.5 text-sm leading-6 text-[var(--fm-text-muted)]">{item.body}</p>
                </button>
              );
            }
          )}
        </div>

        <section className="grid gap-3 rounded-[1.2rem] border border-[var(--fm-border)] bg-white p-4 md:grid-cols-[8fr_4fr] lg:gap-4">
          <article className="space-y-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-text-muted)]">
              {content.paths.featuredLabel}
            </p>
            <h3 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{featuredTest?.name}</h3>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{featuredTest?.desc}</p>

            <div className="mt-3 grid gap-1 rounded-xl border border-[var(--fm-border)] bg-slate-50/70 px-3 py-2 text-sm text-[var(--fm-text-muted)]">
              <div className="flex items-center justify-between">
                <span>{locale === "zh" ? "预计时长" : "Estimated time"}</span>
                <span className="font-semibold text-[var(--fm-text)]">
                  {featuredTest?.duration ?? ""}
                </span>
              </div>
              <p className="text-[var(--fm-text)]">{outcomeText}</p>
            </div>

            <PathActionLinks item={featuredTest ?? content.testCatalog[0]} locale={locale} />
          </article>

          <div className="space-y-3">
            {secondaryTests.map((item, index) => (
              <article key={`${item?.id ?? index}`} className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                  {content.paths.secondaryLabel}
                </p>
                <h4 className="mt-1 text-base font-semibold leading-tight text-[var(--fm-text)]">{item?.name}</h4>
                <p className="mt-1.5 text-sm leading-6 text-[var(--fm-text-muted)]">{item?.desc}</p>
                <PathActionLinks item={item ?? content.testCatalog[0]} locale={locale} compact />
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="home-all-tests-quick-browse" className="space-y-3 rounded-[1.2rem] border border-[var(--fm-border)] bg-white p-4">
          <div className="space-y-1">
            <p className="fm-home-section-kicker">{content.paths.allTestsHeading}</p>
            <h3 id="home-all-tests-quick-browse" className="m-0 text-xl font-semibold text-[var(--fm-text)] md:text-2xl">
              {quickBrowseTitle}
            </h3>
            <p className="m-0 max-w-3xl text-sm text-[var(--fm-text-muted)]">{quickBrowseSupporting}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {content.quickBrowse.filters.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white"
                      : "border-[var(--fm-border)] text-[var(--fm-text-muted)] hover:border-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue)]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTests.slice(0, 6).map((item) => (
              <article
                key={item.slug}
                className="flex min-h-[136px] flex-col justify-between rounded-xl border border-[var(--fm-border)] bg-white p-4"
              >
                <div className="space-y-1.5">
                  <h4 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.name}</h4>
                  <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{item.desc}</p>
                </div>
                <Link
                  href={withLocale(`/tests/${item.slug}/take`)}
                  className={buttonVariants({
                    size: "sm",
                    className: "mt-2 h-auto min-h-[38px] w-fit px-3 text-xs",
                  })}
                >
                  {item.primaryCta}
                </Link>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </section>
  );
}
