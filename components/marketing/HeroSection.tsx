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
  const pathTargets = useMemo(
    () =>
      [
        { id: "self", label: content.chips[0] },
        { id: "career", label: content.chips[1] },
        { id: "wellbeing", label: content.chips[2] },
      ] as const,
    [content.chips]
  );
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
    <section data-testid="home-hero-section" className="fm-home-hero fm-home-hero-v2 relative overflow-hidden">
      <div aria-hidden className="fm-home-hero-backdrop" />
      <div aria-hidden className="fm-home-hero-beam" />

      <Container className="fm-home-hero-copy-grid relative z-10 max-w-[1200px] py-8">
        <div className="space-y-[var(--fm-space-6)]">
          <p className="fm-home-section-kicker">{content.eyebrow}</p>
          <h1 className="fm-home-hero-title fm-home-hero-title-landing">{content.title}</h1>
          <p className="fm-home-hero-subtitle">{content.supporting}</p>

          <div className="fm-home-chip-stack">
            {pathTargets.map(({ id: path, label }) => {
              const isActive = activePath === path;
              return (
                <button
                  key={`hero-path-chip-${path}`}
                  type="button"
                  onClick={() => emitPathSelect(path)}
                  className={`fm-home-chip ${isActive ? "is-active" : "is-inactive"}`}
                  aria-pressed={isActive}
                >
                  {label}
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
        </div>

        <div className="space-y-3">
          <article className="rounded-[1.25rem] border border-[var(--fm-border)] bg-white p-4 shadow-[var(--fm-shadow-md)]">
            <p className="fm-home-preview-kicker">{content.visual.summaryTitle}</p>
            <h2 className="m-0 mt-2 text-lg font-semibold text-[var(--fm-text)]">{content.visual.summaryTitle}</h2>
            <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{content.visual.summaryText}</p>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-[var(--fm-border)] bg-slate-50/75 px-3 py-2 text-xs text-[var(--fm-text-muted)]">
              <span className="font-semibold text-[var(--fm-trust-blue)]">结果说明结构</span>
              <span>摘要 · 维度 · 行动</span>
            </div>
          </article>

          <div className="grid gap-3 sm:grid-cols-2">
            <article className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <p className="fm-home-preview-kicker">{content.visual.dimensionsTitle}</p>
              <div className="mt-2 space-y-2.5">
                {content.visual.dimensions.map((dimension) => (
                  <div key={dimension.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[var(--fm-text)]">{dimension.label}</span>
                      <span className="text-[var(--fm-text-muted)]">{dimension.value}</span>
                    </div>
                    <div className="fm-home-preview-progress">
                      <span
                        className="fm-home-preview-progress-fill"
                        style={{ width: `${percentFromValue(dimension.value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
              <p className="fm-home-preview-kicker">{content.visual.actionsTitle}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-[var(--fm-text-muted)]">
                {content.visual.actionItems.map((item) => (
                  <li key={item} className="list-disc pl-1 leading-6 marker:text-[var(--fm-trust-blue)]">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
