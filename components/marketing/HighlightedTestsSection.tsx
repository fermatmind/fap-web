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
  compact = false,
}: {
  item: HomepageContent["testCatalog"][number];
  locale: Locale;
  className?: string;
  compact?: boolean;
}) {
  const withLocale = (path: string) => toLocalePath(path, locale);

  return (
    <div className={`mt-3 flex flex-wrap gap-2 ${className ?? ""}`}>
      <Link
        href={withLocale(`/tests/${item.slug}/take`)}
        className={buttonVariants({
          size: "sm",
          className: compact ? "h-auto min-h-[40px] px-3 text-xs" : "h-auto min-h-[40px]",
        })}
      >
        {item.primaryCta}
      </Link>
      <Link
        href={withLocale(`/tests/${item.slug}`)}
        className={buttonVariants({
          size: "sm",
          variant: compact ? "ghost" : "outline",
          className: compact ? "h-auto min-h-[40px] px-3 text-xs" : "h-auto min-h-[40px] border-slate-300",
        })}
      >
        {item.secondaryCta}
      </Link>
    </div>
  );
}

const TEST_DURATION_BY_ID: Record<HomeTestId, string> = {
  mbti: "约 12 分钟",
  big5: "约 10 分钟",
  clinical: "约 8 分钟",
  sds20: "约 5 分钟",
  iq: "约 15 分钟",
  eq: "约 14 分钟",
};

const TEST_DURATION_BY_ID_EN: Record<HomeTestId, string> = {
  mbti: "Approx. 12 min",
  big5: "Approx. 10 min",
  clinical: "Approx. 8 min",
  sds20: "Approx. 5 min",
  iq: "Approx. 15 min",
  eq: "Approx. 14 min",
};

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
  const testDurationLookup = locale === "zh" ? TEST_DURATION_BY_ID : TEST_DURATION_BY_ID_EN;
  const microPathPreview =
    locale === "zh"
      ? [
          { label: "结果收益", value: "更快确认问题、减少盲测与重复测试" },
          { label: "建议时长", value: "12–20 分钟" },
        ]
      : [
          { label: "Takeaway", value: "Clarify your next decision and avoid duplicate tests." },
          { label: "Expected time", value: "12–20 minutes" },
        ];

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-section-shell"
    >
      <Container className="max-w-[1200px] space-y-6">
        <header className="max-w-3xl space-y-2">
          <p className="fm-home-section-kicker">{content.paths.recommendationTitle}</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.paths.title}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.paths.supporting}</p>
        </header>

        <div className="fm-home-path-tabs">
          {(Object.entries(content.paths.cards) as Array<[HomePathId, (typeof content.paths.cards)[HomePathId]]>).map(
            ([path, item], index) => {
              const isActive = selectedPath === path;
              return (
                <button
                  key={`path-tab-${path}`}
                  type="button"
                  onClick={() => selectPath(path)}
                  className={`fm-home-path-tab ${isActive ? "is-active" : "is-inactive"}`}
                  aria-pressed={isActive}
                >
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-trust-blue)]">
                    {(index + 1).toString().padStart(2, "0")} / 03
                  </p>
                  <h3 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{item.title}</h3>
                  <p className="m-0 text-sm text-[var(--fm-text-muted)]">{item.body}</p>
                </button>
              );
            }
          )}
        </div>

        <section className="rounded-[1.4rem] border border-[var(--fm-border)] bg-white p-4 md:p-6">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-trust-blue)]">
            {content.paths.recommendationTitle}
          </p>
          <p className="mt-2 text-sm text-[var(--fm-text-muted)]">
            {content.paths.recommendationPrefix}
            {pathCard?.title}
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[8fr_4fr]">
            <article className="fm-home-featured-test-card">
              <div className="space-y-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.13em] text-[var(--fm-text-muted)]">
                  {content.paths.featuredLabel}
                </p>
                <h4 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{featuredTest?.name}</h4>
                <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{featuredTest?.desc}</p>

                <div className="mt-3 grid gap-2 rounded-2xl border border-[var(--fm-border)] bg-slate-50/50 px-3 py-2 text-xs text-[var(--fm-text-muted)]">
                  <div className="flex items-center justify-between">
                    <span>{locale === "zh" ? "预计时长" : "Estimated time"}</span>
                    <span className="font-semibold text-[var(--fm-text)]">
                      {featuredTest?.duration ?? (featuredTest ? testDurationLookup[featuredTest.id] : "")}
                    </span>
                  </div>
                  <p>
                    {microPathPreview[0]?.label}：{microPathPreview[0]?.value}
                  </p>
                  <p>
                    {microPathPreview[1]?.label}：{microPathPreview[1]?.value}
                  </p>
                </div>

                <PathActionLinks item={featuredTest ?? content.testCatalog[0]} locale={locale} />
              </div>
            </article>

            <div className="space-y-3">
              {secondaryTests.map((item, index) => (
                <article key={`${item?.id ?? index}`} className="fm-home-secondary-test-card">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                    {content.paths.secondaryLabel}
                  </p>
                  <h4 className="mt-1 text-base font-semibold text-[var(--fm-text)]">{item?.name}</h4>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--fm-text-muted)]">{item?.desc}</p>
                  <PathActionLinks item={item ?? content.testCatalog[0]} locale={locale} compact />
                </article>
              ))}

              {supportCard ? (
                <article className="fm-home-support-card">
                  <h5 className="m-0 text-sm font-semibold text-[var(--fm-trust-blue-strong)]">{supportCard.title}</h5>
                  <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{supportCard.body}</p>
                  <Link
                    href={withLocale(supportHref ?? "/help")}
                    className={buttonVariants({
                      size: "sm",
                      variant: "outline",
                      className:
                        "mt-3 h-auto min-h-[40px] border-[var(--fm-trust-blue)] text-[var(--fm-trust-blue)]",
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
            <h3
              id="home-all-tests-quick-browse"
              className="m-0 text-xl font-semibold text-[var(--fm-text)] md:text-2xl"
            >
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
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition min-h-[40px] ${
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

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTests.map((item) => (
              <article
                key={item.slug}
                className="fm-home-compact-test-card"
              >
                <h4 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{item.name}</h4>
                <p className="mt-1.5 text-sm leading-6 text-[var(--fm-text-muted)]">{item.desc}</p>
                <p className="mt-2 text-xs text-[var(--fm-trust-blue)]">
                  {featuredTest && featuredTest.id === item.id
                    ? (locale === "zh" ? "推荐路径 · 重点" : "Recommended path · Priority")
                    : (locale === "zh" ? "测试入口" : "Quick entry")}
                </p>
                <div className="mt-3">
                  <Link
                    href={withLocale(`/tests/${item.slug}/take`)}
                    className={buttonVariants({
                      size: "sm",
                      className: "h-auto min-h-[40px] px-3 text-xs",
                    })}
                  >
                    {item.primaryCta}
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
