import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { cn } from "@/lib/utils";

type HomePageContent = ReturnType<typeof getHomePageContent>;
type HomeLink = HomePageContent["quickStart"]["items"][number];
type SecondaryLink = HomePageContent["secondaryExplore"]["items"][number];

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

function HomepageHeroV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="relative overflow-hidden bg-slate-50 pb-8 pt-14 text-slate-950 md:pb-10 md:pt-20">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_50%_0%,rgba(234,88,12,0.12),transparent_52%)]"
      />
      <Container className="relative z-10 max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="m-0 text-sm font-semibold tracking-[0.16em] text-orange-700 uppercase">
            {copy.hero.eyebrow}
          </p>
          <h1 className="m-0 mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-slate-950 md:text-7xl">
            {copy.hero.title}
          </h1>
          <p className="m-0 mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
            {copy.hero.subhead}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <HeroCta href={withLocale(locale, copy.hero.primaryHref)}>{copy.hero.primaryCta}</HeroCta>
            <HeroCta href={withLocale(locale, copy.hero.secondaryHref)} variant="secondary">
              {copy.hero.secondaryCta}
            </HeroCta>
          </div>
          <Link
            href={withLocale(locale, copy.hero.tertiaryHref)}
            prefetch={false}
            className="mt-5 inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-slate-950"
          >
            {copy.hero.tertiaryCta}
            <span aria-hidden className="ml-1">→</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}

function HomepageTrustStripV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-6 md:pb-8" aria-label={copy.trust.title}>
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {copy.hero.trustRail.map((item) => (
            <span
              key={item}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
            >
              {item}
            </span>
          ))}
          <Link href={withLocale(locale, copy.trust.methodHref)} prefetch={false} className="text-sm font-semibold text-slate-500 hover:text-slate-950">
            {copy.trust.methodLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}

function TestCard({ locale, item, index }: { locale: Locale; item: HomeLink; index: number }) {
  const href = withLocale(locale, item.href);

  return (
    <article className="group flex h-full min-h-[13rem] flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-6">
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
    <section className="bg-slate-50 pb-10 pt-6 md:pb-12 md:pt-8" aria-labelledby="homepage-core-tests-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="max-w-2xl">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {copy.quickStart.kicker}
          </p>
          <h2
            id="homepage-core-tests-title"
            className="m-0 mt-3 text-3xl font-semibold tracking-[-0.045em] text-slate-950 md:text-5xl"
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
      className="rounded-3xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm"
    >
      <span className="block text-base font-semibold tracking-[-0.02em] text-slate-950">{item.title}</span>
      <span className="mt-1 block text-sm leading-6 text-slate-500">{item.description}</span>
    </Link>
  );
}

function HomepageSecondaryExploreRowV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-8 pt-2 md:pb-10 md:pt-4" aria-labelledby="homepage-secondary-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {copy.secondaryExplore.kicker}
            </p>
            <h2 id="homepage-secondary-title" className="m-0 mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              {copy.secondaryExplore.title}
            </h2>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {copy.secondaryExplore.items.map((item) => (
            <SecondaryExploreCard key={item.title} locale={locale} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function HomepageResultPromiseV1({ locale, copy }: { locale: Locale; copy: HomePageContent }) {
  return (
    <section className="bg-slate-50 pb-14 pt-2 md:pb-20 md:pt-4" aria-labelledby="homepage-result-promise-title">
      <Container className="max-w-6xl px-6 md:px-8 lg:px-10">
        <div className="border-t border-slate-200 pt-7 md:pt-8">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div className="max-w-2xl">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                {copy.results.kicker}
              </p>
              <h2
                id="homepage-result-promise-title"
                className="m-0 mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-3xl"
              >
                {copy.results.title}
              </h2>
              <p className="m-0 mt-3 text-base leading-7 text-slate-600">{copy.results.body}</p>
            </div>
            <Link
              href={withLocale(locale, copy.results.exampleHref)}
              prefetch={false}
              className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:shadow-sm"
            >
              {copy.results.exampleLabel}
            </Link>
          </div>
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
