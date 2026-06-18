import Link from "next/link";
import type { CareerDisplayHeroViewModel } from "@/lib/career/displaySurface";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type CareerDisplayHeroSnapshotItem = {
  label: string;
  value: string;
};

type CareerDisplayHeroBreadcrumbItem = {
  label: string;
  href?: string;
};

type CareerDisplayHeroProps = {
  hero: CareerDisplayHeroViewModel;
  locale: Locale;
  breadcrumbItems?: CareerDisplayHeroBreadcrumbItem[];
  snapshotItems?: CareerDisplayHeroSnapshotItem[];
};

function ctaLabel(locale: Locale, label: string): string {
  if (locale === "zh") {
    return "测我的职业兴趣是否匹配";
  }

  return label;
}

function ctaHref(locale: Locale, href: string): string {
  if (/^\/(en|zh)\/tests\/holland-career-interest-test-riasec$/.test(href)) {
    return localizedPath("/tests/holland-career-interest-test-riasec", locale);
  }

  return href;
}

export function CareerDisplayHero({
  hero,
  locale,
  breadcrumbItems = [],
  snapshotItems = [],
}: CareerDisplayHeroProps) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-8" data-testid="career-display-hero">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <div className="min-w-0">
          {breadcrumbItems.length > 0 ? (
            <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
              <ol className="m-0 flex flex-wrap items-center gap-2 p-0">
                {breadcrumbItems.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden="true">/</span> : null}
                    {item.href ? (
                      <Link href={item.href} className="hover:text-slate-950">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-slate-950">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {hero.subtitle ? <p className="m-0 text-sm font-medium text-slate-500">{hero.subtitle}</p> : null}
          <h1 className="m-0 mt-2 text-4xl font-semibold tracking-normal text-slate-950 md:text-6xl">{hero.h1}</h1>
          <p className="m-0 mt-5 max-w-3xl text-base leading-8 text-slate-700 md:text-lg">{hero.quickAnswer}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={ctaHref(locale, hero.primaryCta.href)}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {ctaLabel(locale, hero.primaryCta.label)}
            </Link>
          </div>
        </div>
        {snapshotItems.length > 0 ? (
          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4" aria-label={locale === "zh" ? "职业快照" : "Career snapshot"}>
            <h2 className="m-0 text-sm font-semibold tracking-normal text-slate-950">{locale === "zh" ? "职业快照" : "Career snapshot"}</h2>
            <dl className="m-0 mt-4 grid gap-3">
              {snapshotItems.slice(0, 5).map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
                  <dd className="m-0 mt-1 text-sm font-semibold leading-6 text-slate-950">{item.value}</dd>
                </div>
              ))}
            </dl>
          </aside>
        ) : null}
      </div>
    </header>
  );
}
