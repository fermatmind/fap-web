import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { buildBig5TakeHref, getBig5VariantLabel, listBig5FormMetas } from "@/lib/big5/forms";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
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
          "m-0 text-balance text-[clamp(2rem,4vw,3.45rem)] font-semibold tracking-[-0.045em]",
          invert ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>
      <p
        className={cn(
          "m-0 max-w-[38rem] text-[1rem] leading-7 md:text-[1.05rem]",
          invert ? "text-slate-300" : "text-slate-600"
        )}
      >
        {body}
      </p>
    </div>
  );
}

function ResultsPreviewGraphic({
  item,
  locale,
}: {
  item: ReturnType<typeof getHomePageContent>["results"]["previews"][number];
  locale: Locale;
}) {
  if (item.tone === "traits") {
    return (
      <div className="fm-home-report-preview-visual fm-home-report-preview-visual--traits" aria-hidden>
        <div className="fm-home-report-preview-chrome">
          <span />
          <span />
          <span />
        </div>
        <svg viewBox="0 0 240 176" className="fm-home-report-radar" role="presentation">
          <polygon points="120,16 188,52 188,124 120,160 52,124 52,52" className="fm-home-report-radar-grid is-outer" />
          <polygon points="120,40 168,64 168,112 120,136 72,112 72,64" className="fm-home-report-radar-grid" />
          <polygon points="120,64 148,78 148,98 120,112 92,98 92,78" className="fm-home-report-radar-grid" />
          <polygon points="120,28 173,63 160,122 120,138 78,108 70,58" className="fm-home-report-radar-shape" />
        </svg>
        <div className="fm-home-report-preview-meta">
          {item.metrics.map((metric) => (
            <span key={`${item.title}-${metric}`}>{metric}</span>
          ))}
        </div>
      </div>
    );
  }

  if (item.tone === "career") {
    return (
      <div className="fm-home-report-preview-visual fm-home-report-preview-visual--career" aria-hidden>
        <div className="fm-home-report-preview-chrome">
          <span />
          <span />
          <span />
        </div>
        <div className="fm-home-report-career-icon">
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="M6 18h12M8 18v-5m4 5V8m4 10v-7" />
          </svg>
        </div>
        <div className="fm-home-report-career-bars">
          {item.metrics.map((metric, index) => (
            <div key={`${item.title}-${metric}`} className="fm-home-report-career-row">
              <span>{metric}</span>
              <i className={`is-${index + 1}`} />
            </div>
          ))}
        </div>
        <div className="fm-home-report-preview-footer">
          <span>{locale === "zh" ? "最佳配适区间" : "Best-fit range"}</span>
          <strong>{locale === "zh" ? "74%" : "74%"}</strong>
        </div>
      </div>
    );
  }

  return (
    <div className="fm-home-report-preview-visual fm-home-report-preview-visual--cognition" aria-hidden>
      <div className="fm-home-report-preview-chrome">
        <span />
        <span />
        <span />
      </div>
      <div className="fm-home-report-cognition-panorama">
        <div className="fm-home-report-cognition-column is-wide">
          <span className="is-tall" />
          <span className="is-mid" />
          <span className="is-short" />
        </div>
        <div className="fm-home-report-cognition-column">
          <i />
          <i />
          <i />
        </div>
      </div>
      <div className="fm-home-report-preview-meta">
        {item.metrics.map((metric) => (
          <span key={`${item.title}-${metric}`}>{metric}</span>
        ))}
      </div>
    </div>
  );
}

function extractTestSlugFromHref(href: string): string | null {
  const slugMatch = href.match(/\/tests\/([^/?#]+)/);
  return slugMatch?.[1] ?? null;
}

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const heroTitleLines = copy.hero.title.split("\n");
  const heroLeadLine = heroTitleLines[0] ?? copy.hero.title;
  const heroSecondLine = heroTitleLines[1];
  const primaryButtonClass = buttonVariants({
    size: "lg",
    className:
      "px-7 border-transparent bg-[#dfe9e3] text-slate-950 shadow-[0_18px_40px_rgba(4,8,14,0.22)] hover:bg-[#edf4f0]",
  });
  const darkOutlineButtonClass = buttonVariants({
    variant: "outline",
    size: "lg",
    className:
      "border-white/14 bg-white/[0.05] px-7 text-white hover:border-white/28 hover:bg-white/[0.09] hover:text-white",
  });

  return (
    <>
      <section className="fm-home-hero-surface relative overflow-hidden">
        <div aria-hidden className="fm-home-ambient fm-home-ambient--left" />
        <div aria-hidden className="fm-home-ambient fm-home-ambient--right" />

        <Container className="relative z-10 max-w-[110rem] px-5 pb-[var(--fm-space-18)] pt-[calc(var(--fm-space-16)+var(--fm-space-10))] md:px-8 md:pb-[var(--fm-space-22)] md:pt-[calc(var(--fm-space-20)+var(--fm-space-10))] xl:px-12">
          <div className="fm-home-hero-poster">
            <div className="fm-home-hero-copy-shell">
              <div className="space-y-8 md:space-y-10">
                <h1 className="fm-home-hero-title m-0 text-white">
                  <span className="fm-home-hero-title-line fm-home-hero-title-line--lead">{heroLeadLine}</span>
                  {heroSecondLine ? (
                    <span className="fm-home-hero-title-line fm-home-hero-title-line--subtle">{heroSecondLine}</span>
                  ) : null}
                </h1>
                {copy.hero.body ? (
                  <p className="fm-home-hero-description m-0 max-w-[31rem]">
                    {copy.hero.body}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={withLocale(copy.hero.primaryHref)} className={primaryButtonClass}>
                  {copy.hero.primaryCta}
                </Link>
                <Link
                  href={copy.hero.secondaryHref.startsWith("#") ? copy.hero.secondaryHref : withLocale(copy.hero.secondaryHref)}
                  className={darkOutlineButtonClass}
                >
                  {copy.hero.secondaryCta}
                </Link>
              </div>

              <ul className="fm-home-trust-rail" aria-label={locale === "zh" ? "开始说明" : "Start details"}>
                {copy.hero.trustRail.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="fm-home-hero-stage">
              <div className="fm-home-hero-stage-grid">
                <div className="fm-home-hero-select-panel">
                  <div className="fm-home-hero-choice-list">
                    {copy.quickStart.items.slice(0, 5).map((item, index) => (
                      <div key={item.title} className={cn("fm-home-hero-choice-row", index === 0 && "is-emphasis")}>
                        <span className="fm-home-hero-choice-index">0{index + 1}</span>
                        <div className="min-w-0">
                          <p className="m-0 text-sm font-medium text-white">{item.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="fm-home-hero-stage-canvas">
                  <div aria-hidden className="fm-home-hero-stage-orbit" />

                  <div className="fm-home-hero-result-surface">
                    <div className="fm-home-hero-surface-topline" aria-hidden>
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="fm-home-hero-surface-grid">
                      <div className="fm-home-hero-surface-metrics" aria-label={locale === "zh" ? "结果维度" : "Result dimensions"}>
                        {copy.results.previews[0].metrics.map((metric, index) => (
                          <div key={metric} className="fm-home-hero-surface-metric-row">
                            <span>{metric}</span>
                            <span className={cn("fm-home-hero-surface-meter", index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")}>
                              <i />
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="fm-home-hero-surface-plot" aria-hidden>
                        <div className="fm-home-hero-surface-plot-bars">
                          <span />
                          <span />
                          <span />
                        </div>
                        <div className="fm-home-hero-surface-plot-lines">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </div>

                    <div className="fm-home-hero-surface-module-row">
                      {copy.results.previews.slice(1).map((item) => (
                        <div key={item.title} className="fm-home-hero-surface-module">
                          <div className="fm-home-hero-surface-module-bars" aria-hidden>
                            <span />
                            <span />
                          </div>
                          <div className="fm-home-hero-surface-module-list">
                            {item.metrics.slice(0, 2).map((metric) => (
                              <span key={`${item.title}-${metric}`}>{metric}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="home-quick-start" className="bg-[#111922] pb-[var(--fm-space-24)] md:pb-[7rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-quick-start-shell">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader kicker={copy.quickStart.kicker} title={copy.quickStart.title} body={copy.quickStart.body} invert />
              <Link href={withLocale("/tests")} className="fm-home-inline-link inline-flex items-center gap-2">
                {locale === "zh" ? "查看全部测评" : "View all assessments"}
                <span aria-hidden>+</span>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-5 lg:gap-4">
              {copy.quickStart.items.map((item, index) => (
                <article key={item.title} className="fm-home-quick-card">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <span className="fm-home-quick-card-index">0{index + 1}</span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="m-0 text-[1.08rem] font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                    </div>

                    {item.hints?.length ? (
                      <ul className="fm-home-quick-hints" aria-label={locale === "zh" ? "相关入口提示" : "Related entry hints"}>
                        {item.hints.slice(0, 2).map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <Link href={withLocale(item.href)} className="fm-home-quick-card-link mt-6 inline-flex items-center gap-2">
                    {item.label ?? (locale === "zh" ? "查看入口" : "Open path")}
                    <span aria-hidden>+</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="home-featured-paths" className="bg-[#f4efe7] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeader kicker={copy.families.kicker} title={copy.families.title} body={copy.families.body} />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.families.items.map((family) => (
              <article key={family.title} className="fm-home-family-panel">
                <div className="space-y-2">
                  <h3 className="m-0 text-[1.45rem] font-semibold tracking-[-0.035em] text-slate-950">{family.title}</h3>
                  <p className="m-0 max-w-[28rem] text-[0.9rem] leading-6 text-slate-500">{family.description}</p>
                </div>

                <div className="fm-home-family-link-stack">
                  {family.links.map((link) => {
                    const linkSlug = extractTestSlugFromHref(link.href);
                    const variantFamily = linkSlug === "big-five-personality-test-ocean-model" ? "big5" : null;
                    const form = listBig5FormMetas()[0];
                    const big5Href =
                      variantFamily === "big5" && linkSlug && form
                        ? buildBig5TakeHref(linkSlug, locale, form.formCode)
                        : null;
                    const big5AriaLabel = form ? getBig5VariantLabel(form.formCode, locale) : null;
                    return (
                      <div key={`${family.title}-${link.title}`} className="fm-home-family-link-row">
                        <Link
                          href={big5Href ?? withLocale(link.href)}
                          aria-label={big5Href ? `${link.title} · ${big5AriaLabel}` : undefined}
                          className="inline-flex items-center gap-2 text-[0.98rem] font-medium text-slate-900 transition hover:text-slate-700"
                        >
                          <span>{link.title}</span>
                          <span aria-hidden>+</span>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#ebe5db] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="space-y-10">
            <SectionHeader kicker={copy.results.kicker} title={copy.results.title} body={copy.results.body} />
            <div className="fm-home-results-grid">
              {copy.results.previews.map((item) => (
                <article key={item.title} className="fm-home-report-preview" data-tone={item.tone}>
                  <ResultsPreviewGraphic item={item} locale={locale} />
                  <h3 className="m-0 text-[1.22rem] font-semibold tracking-[-0.035em] text-slate-950">{item.title}</h3>
                  <p className="m-0 text-[0.95rem] leading-7 text-slate-500">{item.caption}</p>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#10171f] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
            <SectionHeader kicker={copy.trust.kicker} title={copy.trust.title} body={copy.trust.body} invert />
            <div className="space-y-3">
              {copy.trust.items.map((item) => (
                <details key={item.title} className="fm-home-trust-item group">
                  <summary className="fm-home-trust-summary">
                    <div>
                      <p className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-white">{item.title}</p>
                      <p className="m-0 mt-2 max-w-[40rem] text-sm leading-7 text-slate-400">{item.summary}</p>
                    </div>
                    <span className="fm-home-trust-plus" aria-hidden>
                      <span />
                      <span />
                    </span>
                  </summary>
                  <div className="fm-home-trust-body">
                    {item.paragraphs[0] ? <p className="m-0 text-sm leading-7 text-slate-300">{item.paragraphs[0]}</p> : null}
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

      <section className="bg-[#121a22] py-[var(--fm-space-20)] md:py-[6.5rem]">
        <Container className="max-w-[90rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-final-band flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[34rem] space-y-3">
              <h2 className="m-0 text-balance text-[clamp(2rem,4vw,3.4rem)] font-semibold tracking-[-0.045em] text-white">
                {copy.finalCta.title}
              </h2>
              <p className="m-0 text-[1rem] leading-7 text-slate-300 md:text-[1.05rem]">{copy.finalCta.body}</p>
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
