import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { buttonVariants } from "@/components/ui/button";
import { ExecutiveSnapshotPanel } from "@/components/personality/ExecutiveSnapshotPanel";
import { PersonalityQuickLocateBar } from "@/components/personality/PersonalityQuickLocateBar";
import type { PersonalityHubHero } from "@/lib/mbti/personalityHub.types";
import type { PersonalityQuickLocateIndex } from "@/lib/mbti/personalityQuickLocate";

export function PersonalityHeroExecutiveSummary({
  locale,
  hero,
  primaryHref,
  primaryTrackingProps,
  secondaryHref,
  quickLocateIndex,
  supportingLinks,
  footerNote,
}: {
  locale: "en" | "zh";
  hero: PersonalityHubHero;
  primaryHref: string;
  primaryTrackingProps: Record<string, unknown>;
  secondaryHref: string;
  quickLocateIndex: PersonalityQuickLocateIndex;
  supportingLinks?: Array<{ key: string; label: string; href: string }>;
  footerNote?: string;
}) {
  const mobileMoreLabel = locale === "zh" ? "查看更多入口" : "Show more entry paths";

  return (
    <section className="grid gap-5 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-hub-hero-bg)] p-5 shadow-[var(--fm-shadow-md)] sm:p-6 lg:grid-cols-[1.3fr_0.9fr]" data-testid="personality-hero-executive-summary">
      <div className="space-y-4">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">{hero.eyebrow}</p>
        <h1 className="m-0 font-serif text-[clamp(2.2rem,9vw,var(--fm-hub-heading-display))] leading-[1.05] text-[var(--fm-hub-navy-strong)]">
          {hero.title}
        </h1>
        <p className="m-0 max-w-3xl text-base leading-7 text-[var(--fm-text)] sm:text-[length:var(--fm-hub-body-lg)] sm:leading-8">{hero.summary}</p>
        <div className="flex flex-wrap items-center gap-3" data-testid="mbti-personality-index-entry-cta-group">
          <TrackedEntryCtaLink
            href={primaryHref}
            prefetch
            data-testid="mbti-personality-index-primary-cta"
            eventProperties={primaryTrackingProps}
            className={buttonVariants({ size: "lg" })}
          >
            {hero.primaryCta.label}
          </TrackedEntryCtaLink>
          <Link
            href={secondaryHref}
            data-testid="mbti-personality-index-secondary-cta"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
        <div className="hidden flex-wrap gap-2 md:flex" data-testid="mbti-personality-index-discoverability-links">
          {hero.discoverabilityLinks.map((link) => (
            <Link key={link.label} href={link.href} className="fm-help-chip-link">
              {link.label}
            </Link>
          ))}
        </div>
        <PersonalityQuickLocateBar locale={locale} index={quickLocateIndex} fallbackHref={primaryHref} />
        <details className="md:hidden" data-testid="personality-hero-more-links">
          <summary className="cursor-pointer list-none text-sm font-semibold text-[var(--fm-accent)]">
            {mobileMoreLabel}
          </summary>
          <div className="mt-3 flex flex-wrap gap-2">
            {hero.discoverabilityLinks.map((link) => (
              <Link key={link.label} href={link.href} className="fm-help-chip-link">
                {link.label}
              </Link>
            ))}
            {supportingLinks?.map((cta) => (
              <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        </details>
        {supportingLinks?.length ? (
          <div className="hidden flex-wrap gap-2 md:flex" data-testid="personality-index-landing-cta">
            {supportingLinks.map((cta) => (
              <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        ) : null}
        {footerNote ? <p className="m-0 text-xs text-[var(--fm-text-muted)]">{footerNote}</p> : null}
      </div>
      <ExecutiveSnapshotPanel
        heading={locale === "zh" ? "执行摘要" : "Executive snapshot"}
        metrics={hero.metrics}
      />
    </section>
  );
}
