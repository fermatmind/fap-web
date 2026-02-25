import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function HeroSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      data-testid="home-hero-section"
      className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-100 pb-28 pt-16 md:pb-40 md:pt-20"
    >
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
          </div>
        </div>

        <div className="relative">
          <HeroAnimatedVisual
            chips={dict.home.hero.chips}
            localeLabel={locale === "zh" ? "zh" : "en"}
          />
        </div>
      </Container>

      <WaveDivider />
    </section>
  );
}
