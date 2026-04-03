import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroEvidencePanel } from "@/components/marketing/HeroEvidencePanel";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

const HERO_COPY = {
  en: {
    eyebrowPrimary: "FermatMind",
    eyebrowSecondary: "Evidence-informed self-assessment",
    productName: "FermatMind",
    valueLine: "Understand your trait structure clearly, then make better education and career decisions.",
    leadPrimary: "Start with a free assessment and get interpretable results you can revisit and discuss.",
    leadSecondary:
      "Method scope: 30-facet structure, norm-referenced context, and scenario interpretation. The result supports decisions, but does not define a person.",
    methodLabel: "Method & boundaries",
    primaryCta: "Start free assessment",
    secondaryCta: "View assessment options",
  },
  zh: {
    eyebrowPrimary: "FermatMind 费马测试",
    eyebrowSecondary: "循证自我测评",
    productName: "FermatMind / 费马测试",
    valueLine: "更清晰地理解自己，把学习、职业与协作判断落到可执行的下一步。",
    leadPrimary: "先从免费测评开始，快速获得可解释、可讨论、可复盘的结果。",
    leadSecondary: "方法范围：30 个分面结构、常模参照语境与场景解释。结果用于支持决策，不用于定义一个人。",
    methodLabel: "方法与边界",
    primaryCta: "开始免费测评",
    secondaryCta: "查看测评入口",
  },
} as const;

export function HeroSection({ locale }: { locale: Locale }) {
  const copy = HERO_COPY[locale];
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      data-testid="home-hero-section"
      className="fm-home-hero relative overflow-hidden pb-[var(--fm-space-12)] pt-[var(--fm-space-6)] md:pb-[var(--fm-space-18)] md:pt-[var(--fm-space-10)]"
    >
      <div aria-hidden className="fm-home-hero-grid" />
      <div aria-hidden className="fm-home-hero-grid fm-home-hero-grid-secondary" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-left" />
      <div aria-hidden className="fm-home-hero-glow fm-home-hero-glow-right" />

      <Container className="fm-home-hero-shell relative z-10 grid gap-[var(--fm-space-8)] max-w-[104rem] px-6 md:px-8 lg:px-12 xl:max-w-[111rem] xl:px-16 2xl:max-w-[116rem] 2xl:px-20">
        <div className="fm-home-enter-primary fm-home-hero-copy-column space-y-[var(--fm-space-6)]">
          <div className="fm-home-hero-title-shell space-y-5">
            <div aria-hidden className="fm-home-hero-title-matrix-field" />

            <div className="fm-home-hero-label-stack">
              <p className="fm-home-kicker m-0">{copy.eyebrowPrimary}</p>
              <p className="fm-home-kicker-sub m-0">{copy.eyebrowSecondary}</p>
            </div>

            <h1 className="fm-home-hero-title m-0">
              <span className="fm-home-hero-title-brand-stack">
                <span className="fm-home-hero-title-brand">{copy.productName}</span>
              </span>
            </h1>

            <div className="fm-home-hero-title-ruler">
              <span className="fm-home-hero-title-subline">{copy.valueLine}</span>
            </div>
          </div>

          <div className="fm-home-hero-reading-stack">
            <p className="fm-home-hero-definition m-0">{copy.leadPrimary}</p>
            <p className="fm-home-hero-method-note m-0">{copy.leadSecondary}</p>
          </div>

          <div className="fm-home-hero-cta-row">
            <Link
              href={withLocale("/tests/mbti-personality-test-16-personality-types/take")}
              className="fm-home-hero-cta fm-home-hero-cta-primary"
            >
              {copy.primaryCta}
            </Link>
            <Link href="#home-highlighted-tests-section" className="fm-home-hero-cta fm-home-hero-cta-secondary">
              {copy.secondaryCta}
            </Link>
          </div>

          <div className="fm-home-hero-footnote">
            <span className="fm-home-hero-footnote-label">{copy.methodLabel}</span>
            <p className="fm-home-hero-taxonomy m-0">{copy.leadSecondary}</p>
          </div>
        </div>

        <div className="relative fm-home-enter-secondary fm-home-hero-panel-column">
          <HeroEvidencePanel locale={locale} />
        </div>
      </Container>
      <div aria-hidden className="fm-home-hero-transition" />
    </section>
  );
}
