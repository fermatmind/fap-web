import Link from "next/link";
import { Compass, Monitor, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function HeroSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-100 pb-28 pt-16 md:pb-40 md:pt-20">
      <Container className="relative z-10 grid gap-12 md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="space-y-6">
          <p className="m-0 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--fm-trust-blue)]">
            {dict.home.hero.kicker}
          </p>
          <h1 className="m-0 max-w-2xl font-serif text-4xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-6xl">
            {dict.home.hero.title}
          </h1>
          <p className="m-0 max-w-2xl text-lg leading-8 text-[var(--fm-text-muted)]">{dict.home.hero.subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={withLocale("/tests")} className={buttonVariants({ size: "lg" })}>
              {dict.home.hero.ctaPrimary}
            </Link>
            <Link href={withLocale("/tests")} className={buttonVariants({ variant: "outline", size: "lg" })}>
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-[var(--fm-radius-xl)] border border-sky-200/80 bg-white/85 p-6 shadow-[var(--fm-shadow-lg)] backdrop-blur">
            <div className="grid gap-4">
              <div className="flex items-center justify-between rounded-xl bg-[var(--fm-teal-soft)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--fm-teal)]">Live assessment workspace</span>
                <Sparkles className="h-4 w-4 text-[var(--fm-cta-orange)]" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
                  <Monitor className="h-5 w-5 text-[var(--fm-trust-blue)]" />
                  <p className="mt-2 text-sm font-semibold text-[var(--fm-text)]">Structured reports</p>
                </div>
                <div className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
                  <Compass className="h-5 w-5 text-[var(--fm-teal)]" />
                  <p className="mt-2 text-sm font-semibold text-[var(--fm-text)]">Decision-ready insights</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -left-3 bottom-0 rounded-lg bg-[var(--fm-teal)] px-4 py-2 text-xs font-semibold text-white shadow-[var(--fm-shadow-md)] md:-left-6">
            {dict.home.hero.chips[1]}
          </div>
          <div className="absolute -right-2 top-4 rounded-lg bg-[var(--fm-gold)] px-4 py-2 text-xs font-semibold text-amber-900 shadow-[var(--fm-shadow-md)] md:-right-5">
            {dict.home.hero.chips[2]}
          </div>
        </div>
      </Container>

      <WaveDivider />
    </section>
  );
}
