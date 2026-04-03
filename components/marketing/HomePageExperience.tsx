import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { buildBig5TakeHref, getBig5VariantLabel, isBig5Slug, listBig5FormMetas } from "@/lib/big5/forms";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { buildMbtiTakeHref, getMbtiVariantLabel, isMbtiSlug, listMbtiFormMetas } from "@/lib/mbti/forms";
import { cn } from "@/lib/utils";

function extractTestSlugFromHref(href: string): string | null {
  const pathname = href.split("?")[0] ?? "";
  const normalized = pathname.replace(/\/+$/, "");
  const match = normalized.match(/\/tests\/([^/]+)$/);
  return match?.[1] ?? null;
}

function resolveVariantFamily(slug: string | null): "mbti" | "big5" | null {
  if (slug && isBig5Slug(slug)) {
    return "big5";
  }
  if (slug && isMbtiSlug(slug)) {
    return "mbti";
  }
  return null;
}

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

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
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
              <div className="space-y-4">
                <p className="fm-home-eyebrow">{copy.hero.eyebrow}</p>
                <p className="m-0 text-sm font-medium uppercase tracking-[0.22em] text-white/42">{copy.hero.brand}</p>
              </div>

              <div className="space-y-5">
                <h1 className="m-0 max-w-[8.9em] text-balance text-[clamp(2.95rem,5.6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-white">
                  {copy.hero.title}
                </h1>
                <p className="m-0 max-w-[31rem] text-[0.98rem] leading-7 text-slate-300 md:text-[1.04rem] md:leading-8">
                  {copy.hero.body}
                </p>
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
              <div className="fm-home-hero-stage-head">
                <span>{copy.hero.visualEyebrow}</span>
              </div>

              <div className="fm-home-hero-stage-grid">
                <div className="fm-home-hero-select-panel">
                  <div className="flex items-center justify-between gap-3">
                    <p className="fm-home-hero-map-label">{locale === "zh" ? "现在的问题" : "Start from the question"}</p>
                    <span className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/34">05</span>
                  </div>
                  <div className="fm-home-hero-choice-list">
                    {copy.quickStart.items.slice(0, 5).map((item, index) => (
                      <div key={item.title} className={cn("fm-home-hero-choice-row", index === 0 && "is-emphasis")}>
                        <span className="fm-home-hero-choice-index">0{index + 1}</span>
                        <div className="min-w-0">
                          <p className="m-0 text-sm font-medium text-white">{item.title}</p>
                          {item.hints?.length ? (
                            <p className="m-0 mt-1 text-xs leading-6 text-slate-400">{item.hints.slice(0, 2).join(" · ")}</p>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="fm-home-hero-stage-canvas">
                  <div aria-hidden className="fm-home-hero-stage-orbit" />

                  <div className="fm-home-hero-result-surface">
                    <div className="fm-home-hero-result-head">
                      <div className="space-y-3">
                        <p className="fm-home-hero-map-label">{locale === "zh" ? "结果界面" : "Result surface"}</p>
                        <p className="m-0 max-w-[24rem] text-balance text-[clamp(1.45rem,2.4vw,2.25rem)] font-semibold tracking-[-0.045em] text-white">
                          {copy.hero.visualTitle}
                        </p>
                      </div>
                      <div className="fm-home-hero-result-badge">
                        {locale === "zh" ? "结构化输出" : "Structured output"}
                      </div>
                    </div>

                    <p className="m-0 max-w-[30rem] text-[0.92rem] leading-7 text-slate-300 md:text-[0.98rem]">
                      {copy.hero.visualSummary}
                    </p>

                    <div className="fm-home-hero-preview-metrics" aria-hidden>
                      <span className="is-long" />
                      <span className="is-mid" />
                      <span className="is-short" />
                    </div>

                    <div className="fm-home-hero-stage-detail-grid">
                      <div className="fm-home-hero-preview-card fm-home-hero-preview-card--compressed">
                        <p className="fm-home-hero-map-label">{locale === "zh" ? "结果会带回" : "What comes back"}</p>
                        <div className="mt-4 grid gap-2">
                          {copy.hero.visualPoints.map((point) => (
                            <div key={point} className="fm-home-hero-preview-chip">
                              <span className="fm-home-hero-preview-chip-dot" aria-hidden />
                              <span>{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="fm-home-hero-preview-card fm-home-hero-preview-card--compressed">
                        <p className="fm-home-hero-map-label">{locale === "zh" ? "下一步" : "Next move"}</p>
                        <ul className="fm-home-hero-next-list" aria-label={locale === "zh" ? "结果下一步" : "Result next move"}>
                          {copy.results.valuePoints.slice(0, 3).map((point) => (
                            <li key={point}>{point}</li>
                          ))}
                        </ul>
                      </div>
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
                      <p className="m-0 text-sm leading-7 text-slate-300">{item.description}</p>
                    </div>

                    {item.hints?.length ? (
                      <ul className="fm-home-quick-hints" aria-label={locale === "zh" ? "相关入口提示" : "Related entry hints"}>
                        {item.hints.slice(0, 2).map((hint) => (
                          <li key={hint}>{hint}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  <Link href={withLocale(item.href)} className="fm-home-inline-link mt-6 inline-flex items-center gap-2">
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
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeader kicker={copy.families.kicker} title={copy.families.title} body={copy.families.body} />
            <Link href={withLocale("/tests")} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700">
              {locale === "zh" ? "进入测评入口中心" : "Open the tests hub"}
              <span aria-hidden>+</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {copy.families.items.map((family) => (
              <article key={family.title} className="fm-home-family-panel">
                <div className="space-y-3">
                  <p className="m-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {locale === "zh" ? "家族路径" : "Family path"}
                  </p>
                  <h3 className="m-0 text-[1.45rem] font-semibold tracking-[-0.035em] text-slate-950">{family.title}</h3>
                  <p className="m-0 max-w-[34rem] text-[0.96rem] leading-7 text-slate-600">{family.description}</p>
                </div>

                <div className="fm-home-family-link-stack">
                  {family.links.map((link) => {
                    const linkSlug = extractTestSlugFromHref(link.href);
                    const variantFamily = resolveVariantFamily(linkSlug);

                    return (
                      <div key={`${family.title}-${link.title}`} className="fm-home-family-link-row">
                        <div className="space-y-2">
                          <Link
                            href={withLocale(link.href)}
                            className="inline-flex items-center gap-2 text-[0.98rem] font-medium text-slate-900 transition hover:text-slate-700"
                          >
                            <span>{link.title}</span>
                            <span aria-hidden>+</span>
                          </Link>
                          {link.description ? <p className="m-0 text-xs leading-6 text-slate-500">{link.description}</p> : null}
                          <div className="flex flex-wrap gap-2">
                            {variantFamily === "big5" && linkSlug
                              ? listBig5FormMetas().map((form) => (
                                  <Link
                                    key={form.formCode}
                                    href={buildBig5TakeHref(linkSlug, locale, form.formCode)}
                                    className="fm-home-family-variant-pill"
                                  >
                                    {getBig5VariantLabel(form.formCode, locale)}
                                  </Link>
                                ))
                              : variantFamily === "mbti" && linkSlug
                              ? listMbtiFormMetas().map((form) => (
                                  <Link
                                    key={form.formCode}
                                    href={buildMbtiTakeHref(linkSlug, locale, form.formCode)}
                                    className="fm-home-family-variant-pill"
                                  >
                                    {getMbtiVariantLabel(form.formCode, locale)}
                                  </Link>
                                ))
                              : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link href={withLocale(family.exploreHref)} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-slate-700">
                  {family.exploreLabel}
                  <span aria-hidden>+</span>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#ebe5db] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
            <div className="space-y-8">
              <SectionHeader kicker={copy.results.kicker} title={copy.results.title} body={copy.results.body} />
              <ul className="fm-home-result-points" aria-label={locale === "zh" ? "结果价值" : "Result value"}>
                {copy.results.valuePoints.map((point, index) => (
                  <li key={point} className="fm-home-result-point">
                    <span className="fm-home-result-point-index">0{index + 1}</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {copy.results.previews.map((item) => (
                <article key={item.title} className="fm-home-report-preview" data-tone={item.tone}>
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.eyebrow}</p>
                  <h3 className="m-0 mt-4 text-[1.18rem] font-semibold tracking-[-0.03em] text-slate-950">{item.title}</h3>
                  <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{item.summary}</p>

                  <div className="fm-home-report-preview-graphic" aria-hidden>
                    <div className="fm-home-report-preview-surface">
                      <div className="fm-home-report-preview-bars">
                        {item.metrics.map((metric) => (
                          <div key={metric} className="fm-home-report-preview-bar" />
                        ))}
                      </div>
                      <div className="fm-home-report-preview-chart">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2 p-0 text-sm leading-6 text-slate-700">
                    {item.metrics.map((metric) => (
                      <li key={metric} className="flex list-none items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#6d817b]" aria-hidden />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
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
                    {item.paragraphs.map((paragraph) => (
                      <p key={paragraph} className="m-0 text-sm leading-7 text-slate-300">
                        {paragraph}
                      </p>
                    ))}
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
          <div className="fm-home-final-band flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[38rem] space-y-4">
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
