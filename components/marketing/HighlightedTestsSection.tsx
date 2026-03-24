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
  RouteKey,
} from "./homepageContent";

type HighlightedTestsSectionProps = {
  locale: Locale;
  content: Pick<HomepageContent, "paths" | "pathRecommendations" | "testCatalog" | "quickBrowse">;
  routes: Pick<Record<RouteKey, string>, "help">;
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
  className,
}: {
  item: HomepageContent["testCatalog"][number];
  locale: Locale;
  className?: string;
}) {
  const withLocale = (path: string) => toLocalePath(path, locale);

  return (
    <div className={`mt-4 flex flex-wrap gap-2 ${className ?? ""}`}>
      <Link
        href={withLocale(`/tests/${item.slug}/take`)}
        className={buttonVariants({ size: "sm", className: "h-auto min-h-[44px]" })}
      >
        {item.primaryCta}
      </Link>
      <Link
        href={withLocale(`/tests/${item.slug}`)}
        className={buttonVariants({
          size: "sm",
          variant: "outline",
          className: "h-auto min-h-[44px] border-slate-300",
        })}
      >
        {item.secondaryCta}
      </Link>
    </div>
  );
}

export function HighlightedTestsSection({ locale, content, routes }: HighlightedTestsSectionProps) {
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
  const supportCard = recommendation.support ?? null;
  const pathCard = content.paths.cards[selectedPath];
  const supportHref = supportCard ? routes[supportCard.routeKey] : null;

  function selectPath(path: HomePathId) {
    setSelectedPath(path);
    dispatchSelectedPath(path);
  }

  const quickBrowseTitle = content.quickBrowse.title;
  const quickBrowseSupporting = content.quickBrowse.supporting;

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="py-[clamp(56px,8vw,112px)]"
    >
      <Container className="space-y-[var(--fm-space-8)]">
        <div className="space-y-2">
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.paths.title}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.paths.supporting}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {(Object.entries(content.paths.cards) as Array<[HomePathId, (typeof content.paths.cards)[HomePathId]]>).map(
            ([path, item]) => {
              const isActive = selectedPath === path;
              return (
                <article
                  key={path}
                  className={`rounded-2xl border p-4 transition md:p-5 ${
                    isActive
                      ? "border-[var(--fm-trust-blue)] bg-white shadow-[var(--fm-shadow-sm)]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => selectPath(path)}
                    className="w-full text-left"
                    aria-pressed={isActive}
                  >
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
                      {path === "self" ? "1" : path === "career" ? "2" : "3"} / 3
                    </p>
                    <h3 className="mt-1 text-xl font-semibold text-[var(--fm-text)]">{item.title}</h3>
                    <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{item.body}</p>
                    <p className="mt-2 text-xs text-[var(--fm-text-muted)]">{item.meta}</p>
                  </button>
                  {path === selectedPath && pathCard ? (
                    <Link
                      href={withLocale(`/tests/${featuredTest?.slug ?? ""}/take`)}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className: "mt-3 h-auto min-h-[44px]",
                      })}
                    >
                      {item.cta}
                    </Link>
                  ) : null}
                </article>
              );
            }
          )}
        </div>

        <section className="space-y-4 rounded-[1.6rem] border border-slate-200 bg-white p-4 md:p-6" aria-labelledby="home-featured-tests-title">
          <div className="md:rounded-2xl">
            <p
              id="home-featured-tests-title"
              className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]"
            >
              {content.paths.recommendationTitle}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-[var(--fm-text)]">
              {content.paths.recommendationPrefix}
              {pathCard?.title}
            </h3>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.22fr_0.78fr]">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                {content.paths.featuredLabel}
              </p>
              <h4 className="mt-2 text-2xl font-semibold text-[var(--fm-text)]">{featuredTest?.name}</h4>
              <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{featuredTest?.desc}</p>
              <PathActionLinks item={featuredTest ?? content.testCatalog[0]} locale={locale} />
            </article>

            <div className="space-y-3">
              {secondaryTests.map((item, index) => (
                <article
                  key={`${item?.id ?? index}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                    {content.paths.secondaryLabel}
                  </p>
                  <h4 className="mt-1 text-lg font-semibold text-[var(--fm-text)]">{item?.name}</h4>
                  <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{item?.desc}</p>
                  <PathActionLinks item={item ?? content.testCatalog[0]} locale={locale} />
                </article>
              ))}
              {supportCard ? (
                <article className="rounded-2xl border border-[var(--fm-trust-blue)] bg-sky-50/80 p-4 text-[var(--fm-trust-blue-strong)]">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em]">{supportCard.title}</p>
                  <p className="mt-2 text-sm">{supportCard.body}</p>
                  <Link
                    href={withLocale(supportHref ?? "/help")}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                      className: "mt-3 h-auto min-h-[44px] border-[var(--fm-trust-blue)] text-[var(--fm-trust-blue)]",
                    })}
                  >
                    {supportCard.cta}
                  </Link>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        <section aria-labelledby="home-all-tests-quick-browse" className="space-y-4">
          <div className="space-y-2">
            <p className="fm-home-section-kicker">{content.paths.allTestsHeading}</p>
            <h3 id="home-all-tests-quick-browse" className="m-0 text-2xl font-semibold text-[var(--fm-text)]">
              {quickBrowseTitle}
            </h3>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">{quickBrowseSupporting}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {content.quickBrowse.filters.map((filter) => {
              const isActive = selectedFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition min-h-[44px] ${
                    isActive
                      ? "border-[var(--fm-trust-blue)] bg-[var(--fm-trust-blue)] text-white"
                      : "border-slate-300 text-[var(--fm-text-muted)]"
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {visibleTests.map((item) => (
              <article
                key={item.slug}
                className="rounded-2xl border border-slate-200 bg-white p-4"
              >
                <h4 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{item.name}</h4>
                <p className="mt-2 text-sm text-[var(--fm-text-muted)]">{item.desc}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={withLocale(`/tests/${item.slug}/take`)}
                    className={buttonVariants({
                      size: "sm",
                      className: "h-auto min-h-[44px]",
                    })}
                  >
                    {item.primaryCta}
                  </Link>
                  <Link
                    href={withLocale(`/tests/${item.slug}`)}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                      className: "h-auto min-h-[44px] border-slate-300",
                    })}
                  >
                    {item.secondaryCta}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </section>
  );
}
