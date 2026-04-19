import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getCareerCenterContent } from "@/lib/marketing/careerCenterContent";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const content = await getCareerCenterContent(locale);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career" : "/en/career",
    title: content.seo.title,
    description: content.seo.description,
    alternatesByLocale: {
      en: "/en/career",
      zh: "/zh/career",
      xDefault: "/",
    },
  });
}

export default async function CareerCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const content = await getCareerCenterContent(locale);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const landingPath = withLocale("/career");
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = content.seo.title;
  const pageDescription = content.seo.description;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: pageTitle,
    description: pageDescription,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.landingView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_landing",
          sourcePageType: "career_landing",
          targetAction: "view_surface",
          landingPath,
          routeFamily: "landing",
        })}
      />
      <JsonLd id="career-center-webpage" data={webPageJsonLd} />
      <JsonLd id="career-center-breadcrumb" data={breadcrumbJsonLd} />
      <Container as="div" className="space-y-10 pb-16 pt-8 md:space-y-12 md:pb-20 md:pt-12">
        <Breadcrumb
          items={[
            { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
            { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
          ].map((item, index) => ({
            label: item.name,
            href: index === 0 ? item.path : undefined,
          }))}
        />

        <section className="mx-auto max-w-4xl space-y-4 pt-4 text-center md:pt-8" data-testid="career-landing-hero" data-authority-owner="editorial_local_wrapper">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {content.hero.title}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="career-explorer-pathways" data-authority-owner="editorial_ia_shell">
          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-jobs">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{content.pathways[0]?.eyebrow}</p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {content.pathways[0]?.title}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {content.pathways[0]?.description}
            </p>
            <form action={withLocale(content.pathways[0]?.href ?? "/career/jobs")} method="get" className="mt-auto space-y-3 pt-9" data-testid="career-landing-search-entry">
              <input
                type="search"
                name="q"
                placeholder={content.pathways[0]?.searchPlaceholder}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              />
              <button type="submit" className={buttonVariants({ className: "w-full justify-center" })}>
                {content.pathways[0]?.ctaLabel}
              </button>
            </form>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-recommendation">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{content.pathways[1]?.eyebrow}</p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {content.pathways[1]?.title}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {content.pathways[1]?.description}
            </p>
            <Link href={withLocale(content.pathways[1]?.href ?? "/career/industries")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {content.pathways[1]?.ctaLabel}
            </Link>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-tests">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">{content.pathways[2]?.eyebrow}</p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {content.pathways[2]?.title}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {content.pathways[2]?.description}
            </p>
            <Link href={withLocale(content.pathways[2]?.href ?? "/career/recommendations")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {content.pathways[2]?.ctaLabel}
            </Link>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-sm shadow-sm md:p-6" data-testid="career-quiet-library" data-authority-owner="editorial_support_links">
          <div className="space-y-5 text-center">
            <h2 className="m-0 text-lg font-semibold tracking-tight text-slate-950">
              {content.support.title}
            </h2>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3">
            {content.support.links.map((item) => (
              <Link key={item.href} href={withLocale(item.href)} className="font-medium text-slate-500 underline underline-offset-4 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
