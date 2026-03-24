import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath } from "@/lib/i18n/locales";
import type { Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";

type HeroSectionProps = {
  dict: SiteDictionary;
  locale: Locale;
  primaryTestSlug: string;
};

export function HeroSection({ dict, locale, primaryTestSlug }: HeroSectionProps) {
  const startHref = localizedPath(`/tests/${primaryTestSlug}/take`, locale);
  const testsHref = localizedPath("/tests", locale);
  const primaryCta = locale === "zh" ? "开始测试" : "Find your test";
  const secondaryCta = locale === "zh" ? "浏览全部测试" : "Browse all tests";

  return (
    <section
      data-testid="home-hero-section"
      className="relative overflow-hidden fm-home-hero fm-enter fm-home-enter-up"
    >
      <div className="absolute inset-0 fm-home-hero-backdrop" aria-hidden />
      <div className="absolute inset-0 fm-home-hero-beam" aria-hidden />

      <Container className="relative z-10 py-12 md:py-[var(--fm-section-y-md)] lg:py-[var(--fm-section-y-lg)]">
        <div className="fm-home-hero-copy-grid md:items-center">
          <div className="fm-home-hero-copy">
            <p className="fm-home-section-kicker fm-home-enter-up-delay-1">{dict.home.hero.kicker}</p>
            <h1 className="fm-home-hero-title fm-home-enter-up-delay-1">{dict.home.hero.title}</h1>
            <p className="fm-home-hero-subtitle fm-home-enter-up-delay-2">{dict.home.hero.subtitle}</p>
            <p className="text-sm leading-7 text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? "先看到结构化结果，再做决策。"
                : "See structured output first, then make the next decision with confidence."}
            </p>

            <div className="fm-home-hero-actions fm-home-enter-up-delay-2">
              <Link
                href={startHref}
                className={buttonVariants({
                  size: "lg",
                  className: "fm-home-hero-cta fm-home-enter-up",
                })}
                aria-label={primaryCta}
              >
                {primaryCta}
              </Link>
              <Link
                href={testsHref}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className:
                    "fm-home-hero-cta fm-home-hero-cta-secondary border-white/55 bg-white/85 text-[var(--fm-trust-blue)] hover:border-white hover:bg-white hover:text-[var(--fm-trust-blue-strong)]",
                })}
                aria-label={secondaryCta}
              >
                {secondaryCta}
              </Link>
            </div>
          </div>

          <div className="fm-home-hero-stage fm-home-enter-up fm-home-enter-up-delay-2">
            <HeroAnimatedVisual
              chips={dict.home.hero.chips}
              localeLabel={locale === "zh" ? "zh" : "en"}
            />
          </div>
        </div>
      </Container>

      <WaveDivider fill="#ffffff" />
    </section>
  );
}
