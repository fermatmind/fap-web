import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import type { Locale } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

export function HeroSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  return (
    <section
      data-testid="home-hero-section"
      className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-sky-100 pb-[var(--fm-space-16)] pt-[var(--fm-space-16)] md:pb-[var(--fm-space-14)] md:pt-[var(--fm-space-20)]"
    >
      <Container className="relative z-10 grid gap-[var(--fm-space-12)] md:grid-cols-[1.05fr_0.95fr] md:items-center">
        <div className="space-y-[var(--fm-gap-md)]">
          <h1 className="m-0 max-w-2xl font-serif text-4xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-6xl">
            {dict.home.hero.title}
          </h1>
          <p className="m-0 max-w-2xl text-lg leading-8 text-[var(--fm-text-muted)]">{dict.home.hero.subtitle}</p>
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
