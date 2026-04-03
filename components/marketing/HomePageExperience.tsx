import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { buildBig5TakeHref, getBig5VariantLabel, listBig5FormMetas } from "@/lib/big5/forms";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { buildMbtiTakeHref, getMbtiVariantLabel, listMbtiFormMetas } from "@/lib/mbti/forms";
import { cn } from "@/lib/utils";

function resolveVariantFamily(href: string): "mbti" | "big5" | null {
  const pathname = href.split("?")[0] ?? "";
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized.endsWith("/tests/big-five-personality-test-ocean-model")) {
    return "big5";
  }
  if (normalized.endsWith("/tests/mbti-personality-test-16-personality-types")) {
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

        <Container className="relative z-10 max-w-[110rem] px-5 pb-[var(--fm-space-24)] pt-[calc(var(--fm-space-16)+var(--fm-space-10))] md:px-8 md:pb-[var(--fm-space-30)] md:pt-[calc(var(--fm-space-20)+var(--fm-space-10))] xl:px-12">
          <div className="fm-home-hero-panel">
            <div className="space-y-10">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="fm-home-eyebrow">{copy.hero.eyebrow}</p>
                  <p className="m-0 text-sm font-medium uppercase tracking-[0.22em] text-white/42">{copy.hero.brand}</p>
                </div>

                <div className="space-y-5">
                  <h1 className="m-0 max-w-[13ch] text-balance text-[clamp(2.75rem,5vw,5.35rem)] font-semibold leading-[0.94] tracking-[-0.06em] text-white">
                    {copy.hero.title}
                  </h1>
                  <p className="m-0 max-w-[37rem] text-[1.02rem] leading-8 text-slate-300 md:text-[1.12rem]">
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
                  <span>{locale === "zh" ? "从模糊感受，到可判断结构" : "From vague feeling to usable structure"}</span>
                </div>

                <div className="fm-home-hero-stage-grid">
                  <div className="fm-home-hero-select-panel">
                      <p className="fm-home-hero-map-label">{locale === "zh" ? "先选问题" : "Choose a question"}</p>
                    <div className="fm-home-hero-choice-list">
                      {copy.quickStart.items.slice(0, 5).map((item, index) => (
                        <div key={item.title} className={cn("fm-home-hero-choice-row", index === 1 && "is-emphasis")}>
                          <span className="fm-home-hero-choice-index">0{index + 1}</span>
                          <div className="min-w-0">
                            <p className="m-0 text-sm font-medium text-white">{item.title}</p>
                            {item.hints?.length ? (
                              <p className="m-0 mt-1 text-xs leading-6 text-slate-400">
                                {item.hints.slice(0, 3).join(" · ")}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="fm-home-hero-preview-panel">
                    <div className="fm-home-hero-preview-card">
                      <p className="fm-home-hero-map-label">{locale === "zh" ? "结果界面" : "Result surface"}</p>
                      <p className="m-0 mt-3 text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                        {copy.hero.visualTitle}
                      </p>
                      <p className="m-0 mt-2 text-sm leading-7 text-slate-300">{copy.hero.visualSummary}</p>
                      <div className="fm-home-hero-preview-metrics" aria-hidden>
                        <span className="is-long" />
                        <span className="is-mid" />
                        <span className="is-short" />
                      </div>
                    </div>

                    <div className="fm-home-hero-preview-card">
                      <p className="fm-home-hero-map-label">{locale === "zh" ? "结果会包括" : "What the result includes"}</p>
                      <div className="mt-4 grid gap-2">
                        {copy.hero.visualPoints.map((point) => (
                          <div key={point} className="fm-home-hero-preview-chip">
                            <span className="fm-home-hero-preview-chip-dot" aria-hidden />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="home-quick-start" className="fm-home-quick-start-shell">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeader
                  kicker={copy.quickStart.kicker}
                  title={copy.quickStart.title}
                  body={copy.quickStart.body}
                  invert
                />
                <Link href={withLocale("/tests")} className="fm-home-inline-link inline-flex items-center gap-2">
                  {locale === "zh" ? "查看全部测评" : "View all assessments"}
                  <span aria-hidden>+</span>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 lg:grid-cols-5 lg:gap-4">
                {copy.quickStart.items.map((item) => (
                  <article key={item.title} className="fm-home-quick-card">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="m-0 text-[1.08rem] font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                        <p className="m-0 text-sm leading-7 text-slate-300">{item.description}</p>
                      </div>

                      {item.hints?.length ? (
                        <ul className="fm-home-quick-hints" aria-label={locale === "zh" ? "相关入口提示" : "Related entry hints"}>
                          {item.hints.map((hint) => (
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

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {copy.families.items.map((family, index) => (
              <article key={family.title} className={cn("fm-home-family-panel", index === 0 && "xl:col-span-2")}>
                <div className="space-y-3">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    {locale === "zh" ? "测评家族" : "Test family"}
                  </p>
                  <h3 className="m-0 text-[1.45rem] font-semibold tracking-[-0.035em] text-slate-950">{family.title}</h3>
                  <p className="m-0 max-w-[42rem] text-[0.98rem] leading-7 text-slate-600">{family.description}</p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:max-w-[58rem]">
                  {family.links.map((link) =>
                    resolveVariantFamily(link.href) ? (
                      <div key={`${family.title}-${link.title}`} className="fm-home-subtle-link-card items-start">
                        <div className="w-full space-y-3">
                          <Link
                            href={withLocale(link.href)}
                            className="inline-flex items-center gap-2 font-medium text-slate-900 transition hover:text-slate-700"
                          >
                            <span>{link.title}</span>
                            <span aria-hidden>+</span>
                          </Link>
                          {link.description ? <span className="block text-xs leading-6 text-slate-500">{link.description}</span> : null}
                          <div className="flex flex-wrap gap-2">
                            {resolveVariantFamily(link.href) === "big5"
                              ? listBig5FormMetas().map((form) => (
                                  <Link
                                    key={form.formCode}
                                    href={buildBig5TakeHref("big-five-personality-test-ocean-model", locale, form.formCode)}
                                    className="inline-flex items-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-[rgba(75,108,102,0.36)] hover:bg-[#f5f8f6]"
                                  >
                                    {getBig5VariantLabel(form.formCode, locale)}
                                  </Link>
                                ))
                              : listMbtiFormMetas().map((form) => (
                                  <Link
                                    key={form.formCode}
                                    href={buildMbtiTakeHref("mbti-personality-test-16-personality-types", locale, form.formCode)}
                                    className="inline-flex items-center rounded-full border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-[rgba(75,108,102,0.36)] hover:bg-[#f5f8f6]"
                                  >
                                    {getMbtiVariantLabel(form.formCode, locale)}
                                  </Link>
                                ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link key={`${family.title}-${link.title}`} href={withLocale(link.href)} className="fm-home-subtle-link-card">
                        <div className="space-y-1">
                          <span className="block font-medium">{link.title}</span>
                          {link.description ? <span className="block text-xs leading-6 text-slate-500">{link.description}</span> : null}
                        </div>
                        <span aria-hidden>+</span>
                      </Link>
                    )
                  )}
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
