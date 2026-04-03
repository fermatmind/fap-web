import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { buildBig5TakeHref, getBig5StartLabel, listBig5FormMetas } from "@/lib/big5/forms";
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
    <div className="max-w-[44rem] space-y-4">
      <p className={cn("fm-home-section-kicker", invert && "text-white/72")}>{kicker}</p>
      <h2 className={cn("m-0 text-[clamp(2rem,4vw,3.45rem)] font-semibold tracking-[-0.04em]", invert ? "text-white" : "text-slate-950")}>
        {title}
      </h2>
      <p className={cn("m-0 max-w-[40rem] text-[1rem] leading-7 md:text-[1.06rem]", invert ? "text-slate-300" : "text-slate-600")}>
        {body}
      </p>
    </div>
  );
}

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <>
      <section className="fm-home-hero-surface relative overflow-hidden">
        <div aria-hidden className="fm-home-ambient fm-home-ambient--left" />
        <div aria-hidden className="fm-home-ambient fm-home-ambient--right" />
        <Container className="relative z-10 max-w-[110rem] px-5 pb-[var(--fm-space-24)] pt-[calc(var(--fm-space-16)+var(--fm-space-10))] md:px-8 md:pb-[var(--fm-space-30)] md:pt-[calc(var(--fm-space-20)+var(--fm-space-10))] xl:px-12">
          <div className="fm-home-hero-panel space-y-8 px-5 py-6 md:px-8 md:py-8 xl:space-y-10 xl:px-12 xl:py-12">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.08fr)_minmax(18rem,0.72fr)] xl:items-end">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="fm-home-eyebrow">{copy.hero.eyebrow}</p>
                  <p className="m-0 text-sm font-medium uppercase tracking-[0.24em] text-white/42">{copy.hero.brand}</p>
                </div>

                <div className="max-w-[48rem] space-y-5">
                  <h1 className="m-0 max-w-[16ch] text-balance text-[clamp(2.5rem,5vw,5.1rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white md:max-w-[14ch]">
                    {copy.hero.title}
                  </h1>
                  <p className="m-0 max-w-[38rem] text-[1.03rem] leading-8 text-slate-300 md:text-[1.12rem]">
                    {copy.hero.body}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={withLocale(copy.hero.primaryHref)} className={buttonVariants({ size: "lg", className: "px-7" })}>
                    {copy.hero.primaryCta}
                  </Link>
                  <Link
                    href={copy.hero.secondaryHref.startsWith("#") ? copy.hero.secondaryHref : withLocale(copy.hero.secondaryHref)}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "border-white/16 bg-white/6 px-7 text-white hover:border-white/28 hover:bg-white/10 hover:text-white",
                    })}
                  >
                    {copy.hero.secondaryCta}
                  </Link>
                </div>
              </div>

              <div className="space-y-4 rounded-[1.65rem] border border-white/10 bg-white/[0.035] p-5">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
                  {locale === "zh" ? "为什么从这里开始" : "Why start here"}
                </p>
                <p className="m-0 text-[1.05rem] font-semibold tracking-[-0.03em] text-white">
                  {copy.hero.visualTitle}
                </p>
                <p className="m-0 text-sm leading-7 text-slate-300">{copy.hero.visualSummary}</p>
                <ul className="fm-home-trust-rail" aria-label={locale === "zh" ? "信任说明" : "Trust rail"}>
                  {copy.hero.trustRail.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="fm-home-hero-visual">
              <div className="fm-home-hero-visual-header">
                <span>{copy.hero.visualEyebrow}</span>
                <span>{locale === "zh" ? "结构化启动地图" : "Structured launch map"}</span>
              </div>

              <div className="fm-home-hero-visual-body">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)]">
                  <div className="fm-home-hero-map-card fm-home-hero-map-card--primary">
                    <p className="fm-home-hero-map-label">{locale === "zh" ? "起点问题" : "Starting question"}</p>
                    <div className="fm-home-hero-map-list">
                      {copy.quickStart.items.slice(0, 4).map((item, index) => (
                        <div key={item.title} className="fm-home-hero-map-row">
                          <span className="fm-home-hero-map-index">0{index + 1}</span>
                          <div>
                            <p className="m-0 text-sm font-medium text-white">{item.title}</p>
                            <p className="m-0 mt-1 text-xs leading-6 text-slate-400">{item.label}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="fm-home-hero-map-card">
                      <p className="fm-home-hero-map-label">{locale === "zh" ? "结果组织" : "Result structure"}</p>
                      <div className="fm-home-signal-stack" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </div>
                      <ul className="m-0 space-y-2 p-0 text-sm leading-6 text-slate-300">
                        {copy.hero.visualPoints.map((point) => (
                          <li key={point} className="list-none border-t border-white/10 pt-2 first:border-t-0 first:pt-0">
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="fm-home-hero-map-card">
                      <p className="fm-home-hero-map-label">{locale === "zh" ? "继续方式" : "Next move"}</p>
                      <div className="mt-4 grid gap-2">
                        {copy.quickStart.items.slice(0, 3).map((item) => (
                          <Link
                            key={`${item.title}-hero-link`}
                            href={withLocale(item.href)}
                            className="rounded-[0.95rem] border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white no-underline transition hover:border-white/20 hover:bg-white/[0.05]"
                          >
                            <span className="block font-medium">{item.label ?? item.title}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-400">{item.meta ?? item.description}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="home-quick-start" className="fm-home-quick-start-shell mt-6 md:mt-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeader
                kicker={copy.quickStart.kicker}
                title={copy.quickStart.title}
                body={copy.quickStart.body}
                invert
              />
              <Link
                href={withLocale("/tests")}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition hover:text-white"
              >
                {locale === "zh" ? "查看全部测评" : "View all assessments"}
                <span aria-hidden>+</span>
              </Link>
            </div>

            <div className="mt-8 grid gap-3 lg:grid-cols-5 lg:gap-4">
              {copy.quickStart.items.map((item, index) => (
                <article key={item.title} className={cn("fm-home-quick-card", index === 0 && "lg:col-span-2") }>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="fm-home-quick-card-index">0{index + 1}</span>
                      {item.meta ? <span className="fm-home-quick-card-meta">{item.meta}</span> : null}
                    </div>
                    <div className="space-y-2">
                      <h3 className="m-0 text-[1.1rem] font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                      <p className="m-0 text-sm leading-7 text-slate-300">{item.description}</p>
                    </div>
                  </div>
                  <Link href={withLocale(item.href)} className="fm-home-inline-link mt-6 inline-flex items-center gap-2">
                    {item.label ?? (locale === "zh" ? "查看入口" : "Open entry")}
                    <span aria-hidden>+</span>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="home-test-families" className="bg-[#f4f1ea] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeader kicker={copy.families.kicker} title={copy.families.title} body={copy.families.body} />

          <div className="mt-10 grid gap-5 xl:grid-cols-2">
            {copy.families.items.map((family) => (
              <article key={family.title} className="fm-home-family-panel">
                <div className="space-y-3">
                  <h3 className="m-0 text-[1.45rem] font-semibold tracking-[-0.035em] text-slate-950">{family.title}</h3>
                  <p className="m-0 max-w-[38rem] text-[0.98rem] leading-7 text-slate-600">{family.description}</p>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {family.links.map((link) => (
                    /\/tests\/big-five-personality-test-ocean-model\/take$/.test(link.href) ? (
                      <div key={`${family.title}-${link.title}`} className="fm-home-subtle-link-card items-start">
                        <div className="w-full space-y-3">
                          <span className="block font-medium text-slate-900">{link.title}</span>
                          <div className="flex flex-wrap gap-2">
                            {listBig5FormMetas().map((form) => (
                              <Link
                                key={form.formCode}
                                href={buildBig5TakeHref("big-five-personality-test-ocean-model", locale, form.formCode)}
                                className="inline-flex items-center rounded-lg border border-[rgba(15,23,42,0.12)] bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition hover:border-[rgba(234,88,12,0.4)] hover:text-[var(--fm-cta-orange)]"
                              >
                                {getBig5StartLabel(form.formCode, locale)}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link key={`${family.title}-${link.title}`} href={withLocale(link.href)} className="fm-home-subtle-link-card">
                        <span>{link.title}</span>
                        <span aria-hidden>+</span>
                      </Link>
                    )
                  ))}
                </div>
                <Link href={withLocale(family.exploreHref)} className="fm-home-inline-link mt-6 inline-flex items-center gap-2 text-slate-900">
                  {family.exploreLabel}
                  <span aria-hidden>+</span>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#e9e5dd] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] xl:items-start">
            <SectionHeader kicker={copy.results.kicker} title={copy.results.title} body={copy.results.body} />
            <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
              {copy.results.items.map((item) => (
                <article key={item.title} className="fm-home-value-panel">
                  <h3 className="m-0 text-[1.24rem] font-semibold tracking-[-0.03em] text-slate-950">{item.title}</h3>
                  <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                  <ul className="mt-5 space-y-2 p-0 text-sm leading-6 text-slate-700">
                    {item.bullets.map((bullet) => (
                      <li key={bullet} className="flex list-none items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-[var(--fm-cta-orange)]" aria-hidden />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-[#0f1720] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
            <SectionHeader kicker={copy.trust.kicker} title={copy.trust.title} body={copy.trust.body} invert />
            <div className="space-y-3">
              {copy.trust.items.map((item) => (
                <details key={item.title} className="fm-home-trust-item group" name="home-trust">
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

      <section className="bg-[#f8f6f1] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeader kicker={copy.resources.kicker} title={copy.resources.title} body={copy.resources.body} />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {copy.resources.items.map((resource) => (
              <article key={resource.title} className="fm-home-resource-panel">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{resource.typeLabel}</p>
                <h3 className="m-0 mt-4 text-[1.16rem] font-semibold tracking-[-0.03em] text-slate-950">{resource.title}</h3>
                <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{resource.description}</p>
                <Link href={withLocale(resource.href)} className="fm-home-inline-link mt-6 inline-flex items-center gap-2 text-slate-900">
                  {locale === "zh" ? "打开入口" : "Open resource"}
                  <span aria-hidden>+</span>
                </Link>
              </article>
            ))}
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
              <Link href={withLocale(copy.finalCta.primaryHref)} className={buttonVariants({ size: "lg", className: "px-7" })}>
                {copy.finalCta.primaryCta}
              </Link>
              <Link
                href={withLocale(copy.finalCta.secondaryHref)}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "border-white/16 bg-white/6 px-7 text-white hover:border-white/28 hover:bg-white/10 hover:text-white",
                })}
              >
                {copy.finalCta.secondaryCta}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
