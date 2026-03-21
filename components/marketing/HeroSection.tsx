import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function HeroSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden"
    >
      <div aria-hidden className="fm-home-hero-backdrop" />
      <div aria-hidden className="fm-home-hero-beam" />

      <Container className="relative z-10 grid gap-[var(--fm-space-12)] pb-[calc(var(--fm-space-16)+48px)] pt-[var(--fm-space-10)] md:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] md:items-center md:pb-[calc(var(--fm-space-20)+64px)] md:pt-[var(--fm-space-12)]">
        <div className="fm-home-hero-copy">
          <div className="space-y-[var(--fm-gap-sm)]">
            <p className="fm-home-section-kicker">{dict.home.hero.kicker}</p>
            <p className="fm-home-hero-brand">{dict.header.brand}</p>
          </div>

          <h1 className="fm-home-hero-title">
            {dict.home.hero.title}
          </h1>
          <p className="fm-home-hero-subtitle">{dict.home.hero.subtitle}</p>

          <div className="fm-home-hero-actions">
            <a href="#home-highlighted-tests-section" className={buttonVariants({ size: "lg" })}>
              {dict.home.hero.ctaPrimary}
            </a>
            <Link
              href={withLocale("/tests")}
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "bg-white/78 backdrop-blur",
              })}
            >
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="fm-home-hero-stage">
          <HeroAnimatedVisual
            chips={dict.home.hero.chips}
            localeLabel={locale === "zh" ? "zh" : "en"}
            className="fm-home-hero-visual"
          />
        </div>
      </Container>

      <WaveDivider fill="#f9fbfe" />
    </section>
  );
}
