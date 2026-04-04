import Link from "next/link";
import { buildBig5TakeHref } from "@/lib/big5/forms";
import { Container } from "@/components/layout/Container";
import { ResultsPreviewShowcase } from "@/components/marketing/ResultsPreviewShowcase";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent, type HomeLinkItem } from "@/lib/marketing/homepageContent";
import { buildMbtiTakeHref } from "@/lib/mbti/forms";
import { cn } from "@/lib/utils";

function SectionHeader({
  kicker,
  title,
  body,
  invert = false,
}: {
  kicker: string;
  title: string;
  body: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-[42rem] space-y-4">
      <p className={cn("fm-home-section-kicker", invert && "text-white/65")}>{kicker}</p>
      <h2
        className={cn(
          "m-0 text-balance text-[clamp(2.2rem,4vw,3.8rem)] font-semibold tracking-[-0.05em]",
          invert ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "m-0 max-w-[38rem] text-[0.98rem] leading-7 md:text-[1.02rem]",
            invert ? "text-slate-300" : "text-slate-600"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function VariantLink({
  href,
  label,
  meta,
}: {
  href: string;
  label: string;
  meta: string;
}) {
  return (
    <Link href={href} className="fm-home-lineup-variant">
      <span>{label}</span>
      <small>{meta}</small>
    </Link>
  );
}

function PersonalityFamilyPanel({
  locale,
  withLocale,
  family,
}: {
  locale: Locale;
  withLocale: (path: string) => string;
  family: {
    title: string;
    description: string;
    exploreHref: string;
    exploreLabel: string;
    links: HomeLinkItem[];
  };
}) {
  const mbtiSlug = "mbti-personality-test-16-personality-types";
  const big5Slug = "big-five-personality-test-ocean-model";

  return (
    <article className="fm-home-family-panel fm-home-family-panel--lead">
      <div className="space-y-3">
        <h3 className="m-0 text-[1.5rem] font-semibold tracking-[-0.045em] text-slate-950">{family.title}</h3>
        <p className="m-0 max-w-[38rem] text-[0.95rem] leading-7 text-slate-600">{family.description}</p>
      </div>

      <div className="fm-home-lineup-grid">
        <section className="fm-home-lineup-block">
          <div className="fm-home-lineup-block-head">
            <h4>MBTI</h4>
            <p>{locale === "zh" ? "先快速读懂整体，再决定是否进入更完整画像。" : "Start with the fast read, then move into the fuller profile if needed."}</p>
          </div>
          <div className="fm-home-lineup-variants">
            <VariantLink
              href={buildMbtiTakeHref(mbtiSlug, locale, "mbti_93")}
              label={locale === "zh" ? "快速版" : "Quick Read"}
              meta={locale === "zh" ? "93 题" : "93 questions"}
            />
            <VariantLink
              href={buildMbtiTakeHref(mbtiSlug, locale, "mbti_144")}
              label={locale === "zh" ? "深度版" : "Deep Profile"}
              meta={locale === "zh" ? "144 题" : "144 questions"}
            />
          </div>
        </section>

        <section className="fm-home-lineup-block">
          <div className="fm-home-lineup-block-head">
            <h4>Big Five</h4>
            <p>{locale === "zh" ? "从轮廓进入，或直接读取更完整的五维分布。" : "Start from the outline, or go straight to the fuller five-factor profile."}</p>
          </div>
          <div className="fm-home-lineup-variants">
            <VariantLink
              href={buildBig5TakeHref(big5Slug, locale, "big5_90")}
              label={locale === "zh" ? "快速版" : "Quick Read"}
              meta={locale === "zh" ? "90 题" : "90 questions"}
            />
            <VariantLink
              href={buildBig5TakeHref(big5Slug, locale, "big5_120")}
              label={locale === "zh" ? "全量版" : "Full Profile"}
              meta={locale === "zh" ? "120 题" : "120 questions"}
            />
          </div>
        </section>
      </div>

      <div className="fm-home-family-footer">
        {family.links
          .filter((link) => !["MBTI", "Big Five"].includes(link.title))
          .map((link) => (
            <Link key={`${family.title}-${link.title}`} href={withLocale(link.href)} className="fm-home-family-muted-link">
              <span>{link.title}</span>
              <span aria-hidden>+</span>
            </Link>
          ))}
        <Link href={withLocale(family.exploreHref)} className="fm-home-family-explore">
          {family.exploreLabel}
          <span aria-hidden>+</span>
        </Link>
      </div>
    </article>
  );
}

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const primaryButtonClass = buttonVariants({
    size: "lg",
    className:
      "px-7 border-transparent bg-[#e7efe9] text-slate-950 shadow-[0_18px_40px_rgba(4,8,14,0.18)] hover:bg-[#f2f6f3]",
  });
  const darkOutlineButtonClass = buttonVariants({
    variant: "outline",
    size: "lg",
    className:
      "border-white/14 bg-white/[0.04] px-7 text-white hover:border-white/26 hover:bg-white/[0.08] hover:text-white",
  });
  const heroMetricLevels = locale === "zh" ? ["偏高", "中位偏高", "中位"] : ["High", "Mid-high", "Moderate"];
  const heroSourceLabels =
    locale === "zh" ? ["职业方向", "人格结构", "情绪状态"] : ["Career direction", "Personality", "Current state"];
  const heroResultSummary =
    locale === "zh" ? "把判断放回一个清楚的结构里。" : "Bring judgment back into one clear structure.";
  const heroLeadCue =
    locale === "zh"
      ? "偏好结构清楚，环境敏感度高。"
      : "Preference structure is clear, with higher context sensitivity.";
  const heroScenarioLine =
    locale === "zh" ? "学习、职业、协作分别呈现。" : "Learning, career, and collaboration are mapped separately.";
  const heroNextStepLine =
    locale === "zh" ? "先看最值得继续验证的一条。" : "Start with the path most worth validating next.";

  return (
    <>
      <section className="fm-home-hero-surface fm-home-motion-section relative overflow-hidden">
        <div aria-hidden className="fm-home-ambient fm-home-ambient--left" />
        <div aria-hidden className="fm-home-ambient fm-home-ambient--right" />
        <div aria-hidden className="fm-home-hero-gridline fm-home-hero-gridline--x" />
        <div aria-hidden className="fm-home-hero-gridline fm-home-hero-gridline--y" />

        <Container className="fm-home-hero-frame relative z-10 max-w-[110rem] px-5 pb-[var(--fm-space-6)] pt-[calc(var(--fm-space-6)+var(--fm-space-6))] md:px-8 md:pb-[var(--fm-space-8)] md:pt-[calc(var(--fm-space-7)+var(--fm-space-6))] xl:px-12">
          <div className="fm-home-hero-composition">
            <div className="fm-home-hero-copy-shell">
              <h1 className="fm-home-hero-title m-0 text-white">
                <span className="fm-home-hero-title-line fm-home-hero-title-line--poster fm-home-hero-line fm-home-hero-line--identity">
                  {copy.hero.title}
                </span>
              </h1>
              <p className="fm-home-hero-subhead fm-home-hero-line fm-home-hero-line--function m-0">{copy.hero.subhead}</p>
              <div className="fm-home-hero-cta-row fm-home-hero-line fm-home-hero-line--function">
                <Link href={withLocale(copy.hero.primaryHref)} className={primaryButtonClass}>
                  {copy.hero.primaryCta}
                </Link>
                <Link href={copy.hero.secondaryHref} className={darkOutlineButtonClass}>
                  {copy.hero.secondaryCta}
                </Link>
              </div>
            </div>

            <div className="fm-home-hero-product-stage" aria-hidden>
              <div className="fm-home-hero-workbench">
                <div className="fm-home-hero-result-surface">
                  <div className="fm-home-hero-result-header">
                    <span className="fm-home-hero-result-kicker">{locale === "zh" ? "结果首页" : "Result front page"}</span>
                    <strong>{heroResultSummary}</strong>
                  </div>

                  <div className="fm-home-hero-result-main">
                    <div className="fm-home-hero-chart-surface">
                      <svg viewBox="0 0 220 180" className="fm-home-hero-radar" role="presentation">
                        <polygon points="110,18 176,56 176,124 110,162 44,124 44,56" className="fm-home-hero-radar-ring is-outer" />
                        <polygon points="110,42 160,69 160,111 110,138 60,111 60,69" className="fm-home-hero-radar-ring" />
                        <polygon points="110,64 143,82 143,98 110,116 77,98 77,82" className="fm-home-hero-radar-ring" />
                        <polygon points="110,28 171,61 157,124 110,144 74,110 70,60" className="fm-home-hero-radar-shape" />
                      </svg>
                      <p className="fm-home-hero-chart-summary">{heroLeadCue}</p>
                      <div className="fm-home-hero-source-tags">
                        {heroSourceLabels.map((label) => (
                          <span key={label}>{label}</span>
                        ))}
                      </div>
                    </div>

                    <div className="fm-home-hero-cue-list">
                      {copy.results.previews[0].metrics.slice(0, 3).map((metric, index) => (
                        <div key={metric} className="fm-home-hero-cue-row">
                          <div className="fm-home-hero-cue-head">
                            <span>{metric}</span>
                            <b>{heroMetricLevels[index] ?? (locale === "zh" ? "中位" : "Moderate")}</b>
                          </div>
                          <i className={cn(index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="fm-home-hero-support-grid">
                  <article className="fm-home-hero-support-card">
                    <span>{locale === "zh" ? "场景映射" : "Scenario cues"}</span>
                    <p>{heroScenarioLine}</p>
                  </article>
                  <article className="fm-home-hero-support-card">
                    <span>{locale === "zh" ? "下一步" : "Next step"}</span>
                    <p>{heroNextStepLine}</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="home-quick-start" className="bg-[#111922] pb-[var(--fm-space-24)] pt-[var(--fm-space-8)] md:pb-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-quick-start-shell">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader kicker={copy.quickStart.kicker} title={copy.quickStart.title} body={copy.quickStart.body} invert />
              <Link href={withLocale("/tests")} className="fm-home-inline-link inline-flex items-center gap-2">
                {locale === "zh" ? "查看全部测评" : "View all assessments"}
                <span aria-hidden>+</span>
              </Link>
            </div>

            <div className="fm-home-quick-grid mt-8 lg:grid-cols-6">
              {copy.quickStart.items.map((item, index) => (
                <article
                  key={item.title}
                  className={cn(
                    "fm-home-quick-card",
                    index < 2 ? "is-primary lg:col-span-3" : "is-secondary lg:col-span-2"
                  )}
                >
                  <div className="fm-home-quick-card-head">
                    <span className="fm-home-quick-card-index">0{index + 1}</span>
                    <h3 className="m-0 text-[1.18rem] font-semibold tracking-[-0.035em] text-white">{item.title}</h3>
                  </div>

                  {item.variants?.length ? (
                    <div className="fm-home-quick-variants" aria-label={locale === "zh" ? "版本选择" : "Version options"}>
                      {item.variants.map((variant) => (
                        <div key={`${item.title}-${variant.title}`} className="fm-home-quick-variant">
                          <p className="m-0">{variant.title}</p>
                          <small>{variant.description}</small>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="fm-home-quick-card-body m-0">{item.description}</p>
                  )}

                  <Link href={withLocale(item.href)} className="fm-home-quick-card-link">
                    {item.label ?? (locale === "zh" ? "查看入口" : "Open path")}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="home-featured-paths" className="bg-[#f4efe7] py-[var(--fm-space-24)] md:py-[8.5rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeader kicker={copy.families.kicker} title={copy.families.title} body={copy.families.body} />

          <div className="fm-home-family-grid mt-12">
            {copy.families.items.map((family) => {
              if (family.title === (locale === "zh" ? "人格与风格" : "Personality and style")) {
                return (
                  <PersonalityFamilyPanel
                    key={family.title}
                    locale={locale}
                    withLocale={withLocale}
                    family={family}
                  />
                );
              }

              return (
                <article key={family.title} className="fm-home-family-panel">
                  <div className="space-y-2">
                    <h3 className="m-0 text-[1.28rem] font-semibold tracking-[-0.04em] text-slate-950">{family.title}</h3>
                    <p className="m-0 max-w-[28rem] text-[0.92rem] leading-7 text-slate-600">{family.description}</p>
                  </div>

                  <div className="fm-home-family-link-stack">
                    {family.links.map((link) => {
                      return (
                        <div key={`${family.title}-${link.title}`} className="fm-home-family-link-row">
                          <Link href={withLocale(link.href)} className="fm-home-family-muted-link">
                            <span>{link.title}</span>
                            <span aria-hidden>+</span>
                          </Link>
                          {link.description ? <p className="fm-home-family-link-note m-0">{link.description}</p> : null}
                        </div>
                      );
                    })}
                  </div>

                  <Link href={withLocale(family.exploreHref)} className="fm-home-family-explore">
                    {family.exploreLabel}
                    <span aria-hidden>+</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-[#ebe5db] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="space-y-10">
            <div className="fm-home-results-header">
              <p className="fm-home-section-kicker">{copy.results.kicker}</p>
              <h2 className={cn("fm-home-results-heading", locale === "zh" && "fm-home-results-heading--zh-single-line")}>
                {copy.results.title}
              </h2>
              <p className="fm-home-results-heading-body">{copy.results.body}</p>
            </div>
            <ResultsPreviewShowcase locale={locale} previews={copy.results.previews} />
          </div>
        </Container>
      </section>

      <section className="bg-[#10171f] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
            <SectionHeader kicker={copy.trust.kicker} title={copy.trust.title} body={copy.trust.body} invert />
            <div className="space-y-3">
              {copy.trust.items.map((item) => (
                <details key={item.title} className="fm-home-trust-item group">
                  <summary className="fm-home-trust-summary">
                    <div>
                      <p className="m-0 text-[0.98rem] font-semibold tracking-[-0.02em] text-white">{item.title}</p>
                      <p className="m-0 mt-1.5 max-w-[42rem] text-[0.92rem] leading-7 text-slate-400">{item.summary}</p>
                    </div>
                    <span className="fm-home-trust-plus" aria-hidden>
                      <span />
                      <span />
                    </span>
                  </summary>
                  <div className="fm-home-trust-body">
                    {item.paragraphs[0] ? <p className="m-0 text-[0.9rem] leading-7 text-slate-300">{item.paragraphs[0]}</p> : null}
                    {item.href && item.hrefLabel ? (
                      <Link href={withLocale(item.href)} className="fm-home-inline-link inline-flex items-center gap-2 text-white">
                        {item.hrefLabel}
                        <span aria-hidden>+</span>
                      </Link>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#121a22] py-[var(--fm-space-18)] md:py-[6rem]">
        <Container className="max-w-[90rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-final-band flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-[34rem] space-y-2">
              <h2 className="m-0 text-balance text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-[-0.05em] text-white">
                {copy.finalCta.title}
              </h2>
              <p className="m-0 text-[0.98rem] leading-7 text-slate-300 md:text-[1.02rem]">{copy.finalCta.body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={withLocale(copy.finalCta.primaryHref)} className={primaryButtonClass}>
                {copy.finalCta.primaryCta}
              </Link>
              <Link href={withLocale(copy.finalCta.secondaryHref)} className={darkOutlineButtonClass}>
                {copy.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
