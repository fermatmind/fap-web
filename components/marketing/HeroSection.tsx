import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";
import { buttonVariants } from "@/components/ui/button";

const HERO_COPY = {
  en: {
    headlineLines: ["FermatMind makes", "self-knowledge", "decision-ready."],
    supporting:
      "Structured assessments for personality, capability, and career direction with results that stay explainable, actionable, and traceable.",
  },
  zh: {
    headlineLines: ["费马测试，", "让自我认知", "进入决策。"],
    supporting: "围绕人格、能力与职业方向生成结构化报告，让结果可解释、可行动、可复盘。",
  },
} as const;

export function HeroSection({ dict, locale }: { dict: SiteDictionary; locale: Locale }) {
  const copy = HERO_COPY[locale];
  const primaryHref = "#home-highlighted-tests-section";
  const secondaryHref = localizedPath("/tests", locale);

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-16)] pt-[var(--fm-space-12)] md:pb-[var(--fm-space-20)] md:pt-[var(--fm-space-16)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="relative z-10 grid gap-[var(--fm-space-10)] md:grid-cols-[minmax(0,1.02fr)_minmax(22rem,0.98fr)] md:items-center md:gap-[var(--fm-space-12)]">
        <div className="fm-home-enter-primary space-y-[var(--fm-space-5)]">
          <div className="space-y-[var(--fm-gap-sm)]">
            <p className="fm-home-kicker m-0">{dict.home.hero.kicker}</p>
            <h1
              className="m-0 text-[clamp(2.75rem,6.3vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.05em] text-[var(--fm-trust-blue-strong)]"
            >
              {copy.headlineLines.map((line) => (
                <span key={line} className="block md:whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <p className="m-0 max-w-[38rem] text-[1rem] leading-7 text-[var(--fm-text-muted)] md:text-[1.08rem]">
            {copy.supporting}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={primaryHref}
              className={buttonVariants({
                size: "lg",
                className:
                  "fm-home-hero-cta fm-home-hero-cta-primary min-w-[12rem] rounded-full px-7 shadow-[0_18px_36px_rgba(15,47,97,0.16)]",
              })}
            >
              {dict.home.hero.ctaPrimary}
            </Link>
            <Link
              href={secondaryHref}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className:
                  "fm-home-hero-cta fm-home-hero-cta-secondary min-w-[12rem] rounded-full border-[#b6c7de] bg-white/72 px-7 text-[var(--fm-trust-blue-strong)] shadow-none backdrop-blur-sm",
              })}
            >
              {dict.home.hero.ctaSecondary}
            </Link>
          </div>

          <p className="fm-home-hero-taxonomy m-0" aria-label={locale === "zh" ? "测评方向" : "Assessment directions"}>
            {dict.home.hero.chips.join(locale === "zh" ? " / " : " / ")}
          </p>
        </div>

        <div className="relative fm-home-enter-secondary">
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
