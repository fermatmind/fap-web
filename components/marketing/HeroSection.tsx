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
    leadPrimary: "A self-knowledge engine for youth education and employment decisions.",
    leadSecondary:
      "Built on a 30-facet matrix, 100,000+ norm references, and scenario mapping that turns cognitive noise into interpretable, actionable, traceable judgment.",
    protocolLine: "30-FACET matrix / 100,000+ norm references / scenario mapping / traceable outputs",
  },
  zh: {
    eyebrowPrimary: "循证测评体系",
    eyebrowSecondary: "Evidence-Informed Measurement",
    headlinePrimaryLines: ["识微", "见远"],
    headlineSecondary: "人生架构，始于度量",
    leadPrimary: "面向青年教育与就业决策的自我认知引擎。",
    leadSecondary:
      "围绕 30-Facet 分面矩阵、100,000+ 常模参照与场景映射，交付可解释、可执行、可复盘的判断依据。",
    protocolLine: "30-FACET 分面矩阵 / 100,000+ 常模参照 / Z-SCORE 锚定 / AES-256",
  },
} as const;

export function HeroSection({ locale }: { locale: Locale }) {
  const copy = HERO_COPY[locale];
  const headlineParts = locale === "zh" ? copy.headlinePrimaryLines.filter(Boolean) : [];

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-14)] pt-[var(--fm-space-8)] md:pb-[var(--fm-space-20)] md:pt-[var(--fm-space-14)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-grid fm-home-hero-grid-secondary" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="fm-home-hero-shell relative z-10 grid gap-[var(--fm-space-8)] max-w-[101rem] px-6 md:px-8 lg:px-12 xl:max-w-[106rem] xl:px-16 2xl:max-w-[110rem] 2xl:px-20">
        <div className="fm-home-enter-primary fm-home-hero-copy-column space-y-[var(--fm-space-6)]">
          <div className="fm-home-hero-title-shell space-y-5">
            <div aria-hidden className="fm-home-hero-title-matrix-field" />

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
            </h1>

            <div className="fm-home-hero-title-ruler">
              <span className="fm-home-hero-title-ruler-mark fm-home-hero-title-ruler-mark-start">[A1]</span>
              <span className="fm-home-hero-title-subline">{copy.headlineSecondary}</span>
              <span className="fm-home-hero-title-ruler-mark fm-home-hero-title-ruler-mark-end">[B4]</span>
            </div>
          </div>

          <div className="fm-home-hero-reading-stack">
            <p className="fm-home-hero-definition m-0">{copy.leadPrimary}</p>
            <p className="fm-home-hero-method-note m-0">{copy.leadSecondary}</p>
          </div>

          <div className="fm-home-hero-footnote">
            <span className="fm-home-hero-footnote-label">METHOD_NOTE</span>
            <p
              className="fm-home-hero-taxonomy m-0"
              aria-label={locale === "zh" ? "系统协议" : "System protocols"}
            >
              {copy.protocolLine}
            </p>
          </div>
        </div>

        <div className="relative fm-home-enter-secondary fm-home-hero-panel-column">
          <HeroAnimatedVisual localeLabel={locale === "zh" ? "zh" : "en"} />
        </div>
      </Container>

      <WaveDivider className="relative z-10" fill="#f2f2f7" />
    </section>
  );
}
