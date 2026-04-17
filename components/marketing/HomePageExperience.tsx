import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { cn } from "@/lib/utils";

type HomePageContent = ReturnType<typeof getHomePageContent>;
type HomeLink = HomePageContent["quickStart"]["items"][number];
type SecondaryLink = HomePageContent["secondaryExplore"]["items"][number];
type ResultPreview = HomePageContent["results"]["previews"][number];

function withLocale(locale: Locale, path: string): string {
  return localizedPath(path, locale);
}

function HeroCta({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "inline-flex min-h-[46px] items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2",
        variant === "primary"
          ? "bg-orange-600 text-white shadow-sm hover:bg-orange-700"
          : "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-slate-300 hover:shadow-md"
      )}
    >
      {children}
    </Link>
  );
}

function HeroResultStructurePanel({ locale, previews }: { locale: Locale; previews: ResultPreview[] }) {
  const panelLabel = locale === "zh" ? "结果结构" : "Result";

  return (
    <div className="hidden lg:block" aria-hidden="true">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {panelLabel}
          </span>
          <span className="h-2 w-2 rounded-full bg-orange-600" />
        </div>
        <div className="mt-5 space-y-4">
          {previews.slice(0, 3).map((item, index) => (
            <div key={item.title} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
              <span className="font-mono text-xs text-slate-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-slate-950">{item.title}</p>
                <p className="m-0 mt-1 text-xs leading-5 text-slate-500">
                  {item.metrics.join(" / ")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomepageHeroV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pb-4 pt-12 text-slate-950 md:pb-6 md:pt-16">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(234,88,12,0.12),transparent_52%)]"
      />
      <Container className="relative z-10 max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-3xl text-center lg:text-left">
            <p className="m-0 text-sm font-semibold tracking-[0.16em] text-orange-700 uppercase">
              {copy.hero.eyebrow}
            </p>
            <h1 className="m-0 mt-4 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 md:text-6xl lg:text-7xl">
              {copy.hero.title}
            </h1>
            <p className="m-0 mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl lg:mx-0">
              {copy.hero.subhead}
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <HeroCta href={withLocale(locale, copy.hero.primaryHref)}>{copy.hero.primaryCta}</HeroCta>
              <HeroCta href={withLocale(locale, copy.hero.secondaryHref)} variant="secondary">
                {copy.hero.secondaryCta}
              </HeroCta>
            </div>
            <Link
              href={withLocale(locale, copy.hero.tertiaryHref)}
              prefetch={false}
              className="mt-4 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-950"
            >
              {copy.hero.tertiaryCta}
              <span aria-hidden className="ml-1">→</span>
            </Link>
          </div>
          <HeroResultStructurePanel locale={locale} previews={copy.results.previews} />
        </div>
      </Container>
    </section>
  );
}

function HomepageTrustStripV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 py-4 md:py-5" aria-label={copy.trust.title}>
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-5 gap-y-2 border-y border-slate-200 py-4 text-sm text-slate-600 md:gap-x-7">
          {copy.hero.trustRail.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 font-medium"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-orange-600" />
              {item}
            </span>
          ))}
          <Link
            href={withLocale(locale, copy.trust.methodHref)}
            prefetch={false}
            className="font-semibold text-slate-500 hover:text-slate-950"
          >
            {copy.trust.methodLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}

function TestCard({ locale, item, index }: { locale: Locale; item: HomeLink; index: number }) {
  const href = withLocale(locale, item.href);
  const isPrimary = index === 0;

  return (
    <article
      className={cn(
        "group flex h-full min-h-[13rem] flex-col rounded-3xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6",
        isPrimary ? "border-orange-200 bg-orange-50/40" : "border-slate-200"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
          {item.meta}
        </span>
        <span className="font-mono text-xs text-slate-300">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="m-0 mt-5 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
        {item.title}
      </h3>
      <p className="m-0 mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
      <Link
        href={href}
        prefetch={false}
        className="mt-auto inline-flex items-center pt-5 text-sm font-semibold text-orange-700 transition group-hover:text-orange-800"
      >
        {item.label}
        <span aria-hidden className="ml-1">→</span>
      </Link>
    </article>
  );
}

function HomepageCoreTestGridV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-10 pt-5 md:pb-12 md:pt-6" aria-labelledby="homepage-core-tests-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.quickStart.kicker}
          </p>
          <h2
            id="homepage-core-tests-title"
            className="m-0 mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-4xl"
          >
            {copy.quickStart.title}
          </h2>
          <p className="m-0 mt-4 text-base leading-7 text-slate-600">{copy.quickStart.body}</p>
        </div>

        <div className="mt-6 grid gap-4 md:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {copy.quickStart.items.slice(0, 6).map((item, index) => (
            <TestCard key={item.title} locale={locale} item={item} index={index} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function SecondaryExploreCard({ locale, item }: { locale: Locale; item: SecondaryLink }) {
  return (
    <Link
      href={withLocale(locale, item.href)}
      prefetch={false}
      className="inline-flex min-w-0 flex-col border-l border-slate-200 pl-4 transition hover:border-orange-300"
    >
      <span className="block text-base font-semibold tracking-[-0.02em] text-slate-950">{item.title}</span>
      <span className="mt-1 block text-sm leading-6 text-slate-500">{item.description}</span>
    </Link>
  );
}

function HomepageSecondaryExploreRowV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-8 pt-1 md:pb-10" aria-labelledby="homepage-secondary-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="grid gap-5 border-t border-slate-200 pt-5 md:grid-cols-[minmax(0,16rem)_1fr] md:items-start">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {copy.secondaryExplore.kicker}
            </p>
            <h2
              id="homepage-secondary-title"
              className="m-0 mt-2 text-lg font-semibold tracking-[-0.03em] text-slate-950 md:text-xl"
            >
              {copy.secondaryExplore.title}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {copy.secondaryExplore.items.map((item) => (
              <SecondaryExploreCard key={item.title} locale={locale} item={item} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

function HomepageResultPromiseV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-14 pt-2 md:pb-20" aria-labelledby="homepage-result-promise-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="border-t border-slate-200 pt-7 md:flex md:items-end md:justify-between md:gap-8">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
              {copy.results.kicker}
            </p>
            <h2
              id="homepage-result-promise-title"
              className="m-0 mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-3xl"
            >
              {copy.results.title}
            </h2>
            <p className="m-0 mt-3 max-w-2xl text-base leading-7 text-slate-600">{copy.results.body}</p>
          </div>
          <Link
            href={withLocale(locale, copy.results.exampleHref)}
            prefetch={false}
            className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:shadow-sm md:mt-0"
          >
            {copy.results.exampleLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);

  return (
    <div className="bg-slate-50 text-slate-950">
      <HomepageHeroV1 locale={locale} copy={copy} />
      <HomepageTrustStripV1 locale={locale} copy={copy} />
      <HomepageCoreTestGridV1 locale={locale} copy={copy} />
      <HomepageSecondaryExploreRowV1 locale={locale} copy={copy} />
      <HomepageResultPromiseV1 locale={locale} copy={copy} />
    </div>
  );
}
