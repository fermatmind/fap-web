"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { HeroSectionContent, HomePathId, HomeTestId, HomepageContent } from "./homepageContent";

type HeroSectionProps = {
  locale: Locale;
  content: HeroSectionContent;
  routes: {
    tests: string;
  };
  pathRecommendations: Pick<HomepageContent, "pathRecommendations">["pathRecommendations"];
  testCatalog: HomepageContent["testCatalog"];
};

export function HeroSection({ locale, content, routes, pathRecommendations, testCatalog }: HeroSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const [activePath, setActivePath] = useState<HomePathId>("self");
  const pathTargets = useMemo<HomePathId[]>(() => ["self", "career", "wellbeing"], []);
  const targetSectionId = "home-highlighted-tests-section";

  function emitPathSelect(path: HomePathId) {
    setActivePath(path);

    if (typeof window === "undefined") return;

    window.dispatchEvent(
      new CustomEvent("home-path-select", {
        detail: {
          path,
        },
      })
    );

    const target = document.getElementById(targetSectionId);
    if (!target) return;

    const reduceMotion =
      typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ path?: HomePathId }>).detail;
      const path = detail?.path;
      if (path === "self" || path === "career" || path === "wellbeing") {
        setActivePath(path);
      }
    };

    window.addEventListener("home-path-select", handler);
    return () => {
      window.removeEventListener("home-path-select", handler);
    };
  }, []);

  const percentFromValue = (value: string) => {
    const match = value.match(/(\d+)%/);
    return match ? Number(match[1]) : 50;
  };

  const primaryStartPath = useMemo(() => {
    const featuredTestId: HomeTestId | undefined = pathRecommendations[activePath]?.featured;
    const featuredTest = testCatalog.find((item) => item.id === featuredTestId);

    return featuredTest?.slug ? `/tests/${featuredTest.slug}/take` : routes.tests;
  }, [activePath, pathRecommendations, testCatalog, routes.tests]);

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden py-[clamp(56px,8vw,112px)]"
    >
      <div aria-hidden className="fm-home-hero-backdrop" />
      <div aria-hidden className="fm-home-hero-beam" />

      <Container className="relative z-10 grid gap-[var(--fm-space-8)] md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] md:items-center">
        <div className="space-y-[var(--fm-space-6)]">
          <p className="fm-home-section-kicker">{content.eyebrow}</p>
          <h1 className="fm-home-hero-title">{content.title}</h1>
          <p className="fm-home-hero-subtitle">{content.supporting}</p>

          <div className="flex flex-wrap gap-2">
            {pathTargets.map((path, index) => {
              const isActive = activePath === path;
              return (
                <button
                  key={`hero-path-chip-${path}`}
                  type="button"
                  onClick={() => emitPathSelect(path)}
                  className={`min-h-[44px] focus-visible:ring-2 ring-[var(--fm-focus)] rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "border-[var(--fm-trust-blue)] bg-white text-[var(--fm-trust-blue-strong)]"
                      : "border-slate-300/90 text-[var(--fm-text)] hover:border-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  }`}
                  aria-pressed={isActive}
                >
                  {content.chips[index]}
                </button>
              );
            })}
          </div>

          <div className="fm-home-hero-actions">
            <Link href={withLocale(primaryStartPath)} className={buttonVariants({ size: "lg" })}>
              {content.primaryCta}
            </Link>
            <Link href={withLocale(routes.tests)} className={buttonVariants({ size: "lg", variant: "outline" })}>
              {content.secondaryCta}
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 pt-[var(--fm-space-2)]">
            {content.trustStrip.map((item) => (
              <span
                key={item}
                className="rounded-full border border-slate-300/85 bg-white/85 px-3 py-2 text-xs font-semibold tracking-wide text-[var(--fm-text-muted)] backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[1.9rem] border border-slate-200/65 bg-white/88 p-5 shadow-[var(--fm-shadow-md)] backdrop-blur sm:p-6">
          <div className="space-y-5">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-[var(--fm-trust-blue-strong)]">{content.visual.summaryTitle}</h2>
              <p className="text-sm leading-6 text-[var(--fm-text-muted)]">{content.visual.summaryText}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-[var(--fm-trust-blue)]">{content.visual.dimensionsTitle}</p>
              <div className="space-y-2">
                {content.visual.dimensions.map((dimension) => (
                  <div key={dimension.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-[var(--fm-text-muted)]">
                      <span>{dimension.label}</span>
                      <span>{dimension.value}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-[var(--fm-teal)]"
                        style={{ width: `${percentFromValue(dimension.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold text-[var(--fm-trust-blue)]">{content.visual.actionsTitle}</p>
              <ul className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                {content.visual.actionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
