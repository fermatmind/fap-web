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

      <Container className="fm-home-hero-copy-grid relative z-10">
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

          <div className="flex flex-wrap gap-2 pt-[var(--fm-space-2)]">
            {content.trustStrip.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/45 bg-white/75 px-3 py-2 text-xs font-semibold tracking-wide text-[var(--fm-text-muted)] backdrop-blur"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="fm-home-preview-stage">
          <article className="fm-home-preview-panel fm-home-preview-panel--top">
            <p className="fm-home-preview-kicker">{content.visual.summaryTitle}</p>
            <h2 className="fm-home-preview-title">{content.visual.summaryTitle}</h2>
            <p className="fm-home-preview-text">{content.visual.summaryText}</p>
            <div className="mt-3 grid gap-2 text-xs text-[var(--fm-text-muted)]">
              <p className="font-semibold text-[var(--fm-trust-blue)]">结果状态：可解释、可复盘、可执行</p>
              <p>当前建议优先澄清职业目标，再落到可执行的下一步。</p>
            </div>
          </article>

          <article className="fm-home-preview-panel fm-home-preview-panel--middle">
            <p className="fm-home-preview-kicker">{content.visual.dimensionsTitle}</p>
            <div className="space-y-3">
              {content.visual.dimensions.map((dimension) => (
                <div key={dimension.label} className="space-y-1.5">
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

          <article className="fm-home-preview-panel fm-home-preview-panel--bottom">
            <p className="fm-home-preview-kicker">{content.visual.actionsTitle}</p>
            <ul className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              {content.visual.actionItems.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--fm-trust-blue)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Container>
    </section>
  );
}
