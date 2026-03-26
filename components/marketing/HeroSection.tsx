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
    supporting:
      "A decision-grade self-knowledge engine for high-growth individuals. Built on a 30-facet matrix, 100,000+ norm references, and scenario mapping that turns cognitive noise into interpretable, actionable, traceable judgment.",
    primaryCta: "Start calibration",
    secondaryCta: "View measurement matrix",
    protocolLine: "30-Facet matrix / 100,000+ norms / scenario mapping",
  },
  zh: {
    eyebrowPrimary: "循证测评体系",
    eyebrowSecondary: "Evidence-Informed Measurement",
    headlineLines: ["识微。见远。", "让自我认知", "进入决策。"],
    supporting:
      "面向高成长个体的决策级自我认知引擎。围绕 30-Facet 分面矩阵、100,000+ 常模参照与场景映射，交付可解释、可执行、可复盘的判断依据。",
    primaryCta: "开始校准",
    secondaryCta: "查看测量矩阵",
    protocolLine: "30-Facet 分面矩阵 / 100,000+ 常模参照 / 场景映射",
  },
} as const;

export function HeroSection({ locale }: { locale: Locale }) {
  const copy = HERO_COPY[locale];
  const primaryHref = localizedPath("/tests/mbti-personality-test-16-personality-types/take", locale);
  const secondaryHref = "#home-highlighted-tests-section";

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-14)] pt-[var(--fm-space-10)] md:pb-[var(--fm-space-20)] md:pt-[var(--fm-space-14)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-grid fm-home-hero-grid-secondary" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="relative z-10 grid gap-[var(--fm-space-8)] md:grid-cols-[minmax(0,0.96fr)_minmax(22rem,1.04fr)] md:items-center md:gap-[var(--fm-space-10)] xl:gap-[var(--fm-space-12)]">
        <div className="fm-home-enter-primary space-y-[var(--fm-space-5)]">
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

          <p className="fm-home-hero-lede m-0 max-w-[42rem]">{copy.supporting}</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={primaryHref}
              className={buttonVariants({
                size: "lg",
                className: "fm-home-hero-cta fm-home-hero-cta-primary min-w-[12.5rem] rounded-full px-7",
              })}
            >
              {copy.primaryCta}
            </Link>
            <Link
              href={secondaryHref}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
                className: "fm-home-hero-cta fm-home-hero-cta-secondary min-w-[12.5rem] rounded-full px-7",
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

        <div className="relative fm-home-enter-secondary">
          <HeroAnimatedVisual localeLabel={locale === "zh" ? "zh" : "en"} />
        </div>
      </Container>

      <WaveDivider className="relative z-10" fill="#f2f2f7" />
    </section>
  );
}
