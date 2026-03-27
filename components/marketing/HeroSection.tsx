import { Container } from "@/components/layout/Container";
import { HeroAnimatedVisual } from "@/components/marketing/HeroAnimatedVisual";
import { WaveDivider } from "@/components/marketing/WaveDivider";
import type { Locale } from "@/lib/i18n/locales";

const HERO_COPY = {
  en: {
    eyebrowPrimary: "Evidence-Informed Measurement",
    eyebrowSecondary: "循证测评体系",
    headlinePrimaryLines: ["See the Micro.", "Lead the Macro."],
    headlineSecondary: "Life architecture begins with measurement.",
    leadPrimary: "A decision-grade self-knowledge engine for high-growth individuals.",
    leadSecondary:
      "Built on a 30-facet matrix, 100,000+ norm references, and scenario mapping that turns cognitive noise into interpretable, actionable, traceable judgment.",
    protocolLine: "30-FACET matrix / 100,000+ norms / Z-SCORE anchor / AES-256",
  },
  zh: {
    eyebrowPrimary: "循证测评体系",
    eyebrowSecondary: "Evidence-Informed Measurement",
    headlinePrimaryLines: ["识微，见远"],
    headlineSecondary: "人生架构，始于度量",
    leadPrimary: "面向青年教育与就业决策的自我认知引擎。",
    leadSecondary:
      "围绕 30-Facet 分面矩阵、100,000+ 常模参照与场景映射，交付可解释、可执行、可复盘的判断依据。",
    protocolLine: "30-FACET 分面矩阵 / 100,000+ 常模参照 / Z-SCORE 锚定 / AES-256",
  },
} as const;

export function HeroSection({ locale }: { locale: Locale }) {
  const copy = HERO_COPY[locale];
  const headlineParts =
    locale === "zh" ? copy.headlinePrimaryLines[0]?.split("，").map((part) => part.trim()).filter(Boolean) ?? [] : [];

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-14)] pt-[var(--fm-space-8)] md:pb-[var(--fm-space-20)] md:pt-[var(--fm-space-14)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-grid fm-home-hero-grid-secondary" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="relative z-10 grid gap-[var(--fm-space-8)] max-w-[101rem] px-6 md:grid-cols-[minmax(0,6.1fr)_minmax(0.4rem,0.18fr)_minmax(48rem,8.9fr)] md:items-center md:gap-0 md:px-8 lg:px-12 xl:max-w-[106rem] xl:px-16 2xl:max-w-[110rem] 2xl:px-20">
        <div className="fm-home-enter-primary fm-home-hero-copy-column space-y-[var(--fm-space-5)]">
          <div className="fm-home-hero-title-shell space-y-4">
            <div aria-hidden className="fm-home-hero-title-matrix-field" />
            <div aria-hidden className="fm-home-hero-title-code-rail">
              <span className="fm-home-hero-title-code-label">RESOLUTION</span>
              <span className="fm-home-hero-title-code-value">0.000001</span>
              <span>0x61</span>
              <span>0x7A</span>
              <span>0xC4</span>
              <span>0xF1</span>
            </div>

            <div className="fm-home-hero-label-stack">
              <p className="fm-home-kicker m-0">{copy.eyebrowPrimary}</p>
              <p className="fm-home-kicker-sub m-0">{copy.eyebrowSecondary}</p>
            </div>

            <h1 className="fm-home-hero-title m-0">
              <span className="fm-home-hero-title-brand-stack">
                {locale === "zh" && headlineParts.length === 2 ? (
                  <span className="fm-home-hero-title-brand-row">
                    <span className="fm-home-hero-title-brand-word">{headlineParts[0]}</span>
                    <span className="fm-home-hero-title-punctuation-shell" aria-hidden>
                      <span className="fm-home-hero-title-punctuation">，</span>
                      <span className="fm-home-hero-title-crosshair">
                        <span className="fm-home-hero-title-crosshair-horizontal" />
                        <span className="fm-home-hero-title-crosshair-vertical" />
                      </span>
                    </span>
                    <span className="fm-home-hero-title-brand-word">{headlineParts[1]}</span>
                  </span>
                ) : (
                  copy.headlinePrimaryLines.map((line) => (
                    <span key={line} className="fm-home-hero-title-brand">
                      {line}
                    </span>
                  ))
                )}
              </span>
              <span className="fm-home-hero-title-ruler">
                <span className="fm-home-hero-title-ruler-mark fm-home-hero-title-ruler-mark-start">[A1]</span>
                <span className="fm-home-hero-title-subline">{copy.headlineSecondary}</span>
                <span className="fm-home-hero-title-ruler-mark fm-home-hero-title-ruler-mark-end">[B4]</span>
              </span>
            </h1>
          </div>

          <p className="fm-home-hero-lede m-0">
            <span className="fm-home-hero-lede-primary">{copy.leadPrimary}</span>
            <span className="fm-home-hero-lede-secondary">{copy.leadSecondary}</span>
          </p>

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
