import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

const HERO_COPY = {
  en: {
    eyebrowPrimary: "Evidence-Informed Measurement",
    eyebrowSecondary: "循证测评体系",
    headlineLines: ["See the Micro.", "Lead the Macro.", "Bring self-knowledge into decision."],
    leadPrimary: "A decision-grade self-knowledge engine for high-growth individuals.",
    leadSecondary:
      "Built on a 30-facet matrix, 100,000+ norm references, and scenario mapping that turns cognitive noise into interpretable, actionable, traceable judgment.",
    primaryCta: "Start calibration",
    secondaryCta: "View measurement matrix",
    protocolLine: "30-FACET matrix / 100,000+ norms / Z-SCORE anchor / AES-256",
  },
  zh: {
    eyebrowPrimary: "循证测评体系",
    eyebrowSecondary: "Evidence-Informed Measurement",
    headlineLines: ["识微。见远。", "人生架构，", "始于度量"],
    leadPrimary: "面向青年教育与就业决策的自我认知引擎。",
    leadSecondary:
      "围绕 30-Facet 分面矩阵、100,000+ 常模参照与场景映射，交付可解释、可执行、可复盘的判断依据。",
    primaryCta: "开始校准",
    secondaryCta: "查看测量矩阵",
    protocolLine: "30-FACET 分面矩阵 / 100,000+ 常模参照 / Z-SCORE 锚定 / AES-256",
  },
} as const;

export function HeroSection({ locale }: { locale: Locale }) {
  const copy = HERO_COPY[locale];
  const primaryHref = localizedPath("/tests/mbti-personality-test-16-personality-types/take", locale);
  const secondaryHref = "#home-highlighted-tests-section";

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-14)] pt-[var(--fm-space-8)] md:pb-[var(--fm-space-20)] md:pt-[var(--fm-space-14)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-grid fm-home-hero-grid-secondary" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="relative z-10 grid gap-[var(--fm-space-8)] md:grid-cols-[minmax(0,5fr)_minmax(0,1fr)_minmax(22rem,6fr)] md:items-center md:gap-0 xl:gap-0">
        <div className="fm-home-enter-primary fm-home-hero-copy-column space-y-[var(--fm-space-5)]">
          <div className="space-y-4">
            <div className="fm-home-hero-label-stack">
              <p className="fm-home-kicker m-0">{copy.eyebrowPrimary}</p>
              <p className="fm-home-kicker-sub m-0">{copy.eyebrowSecondary}</p>
            </div>

            <h1 className="fm-home-hero-title m-0">
              {copy.headlineLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <p className="fm-home-hero-lede m-0">
            <span className="fm-home-hero-lede-primary">{copy.leadPrimary}</span>
            <span className="fm-home-hero-lede-secondary">{copy.leadSecondary}</span>
          </p>

          <div className="fm-home-hero-cta-row">
            <Link
              href={primaryHref}
              className={buttonVariants({
                size: "lg",
                className: "fm-home-hero-cta fm-home-hero-cta-primary min-w-[9.75rem] rounded-xl px-7",
              })}
            >
              {copy.primaryCta}
            </Link>
            <Link
              href={secondaryHref}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "fm-home-hero-cta fm-home-hero-cta-secondary min-w-[10.75rem] rounded-xl px-7",
              })}
            >
              {copy.secondaryCta}
            </Link>
          </div>

          <p
            className="fm-home-hero-taxonomy m-0"
            aria-label={locale === "zh" ? "系统协议" : "System protocols"}
          >
            {copy.protocolLine}
          </p>
        </div>

        <div aria-hidden className="hidden md:block" />

        <div className="relative fm-home-enter-secondary fm-home-hero-panel-column">
          <HeroAnimatedVisual localeLabel={locale === "zh" ? "zh" : "en"} />
        </div>
      </Container>

      <WaveDivider className="relative z-10" fill="#f2f2f7" />
    </section>
  );
}
