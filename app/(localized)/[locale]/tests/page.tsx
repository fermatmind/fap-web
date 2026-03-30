import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getTestsGatewaySurface } from "@/lib/publicGateway";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";
import { formatCardTitleForUi } from "@/lib/ui/testTitleDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/zh/tests" : "/en/tests";

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname,
    title: isZh ? "测评列表" : "Tests",
    description: isZh ? "浏览所有可用测评。" : "Browse all available tests.",
    alternatesByLocale: {
      en: "/en/tests",
      zh: "/zh/tests",
      xDefault: "/",
    },
  });
}

export default async function TestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const dict = await getDict(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const gatewaySurface = await getTestsGatewaySurface(locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
  const gatewayItems = landingSurface?.discoverabilityItems ?? [];
  const gatewayOrder = new Map(gatewayItems.map((item, index) => [item.key, index]));
  const gatewayItemsBySlug = new Map(gatewayItems.map((item) => [item.key, item]));
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "tests-index",
    pageType: "hub",
    locale,
    canonicalPath: withLocale("/tests"),
    title: isZh ? "测评列表" : "Tests",
    description: isZh ? "浏览所有可用测评。" : "Browse all available tests.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: withLocale("/") },
      { name: isZh ? "测评" : "Tests", path: withLocale("/tests") },
    ],
  });
  const tests = getAllTests()
    .sort((a, b) => {
      const aIndex = gatewayOrder.get(a.slug);
      const bIndex = gatewayOrder.get(b.slug);

      if (aIndex !== undefined && bIndex !== undefined) {
        return aIndex - bIndex;
      }
      if (aIndex !== undefined) {
        return -1;
      }
      if (bIndex !== undefined) {
        return 1;
      }

      return (b.highlight_priority ?? 0) - (a.highlight_priority ?? 0);
    });
  const topGatewayItems = gatewayItems.slice(0, 3);
  const topTests = topGatewayItems.length > 0
    ? topGatewayItems
    : tests.slice(0, 3).map((item) => ({
        key: item.slug,
        title: resolveTestTitleByLocale(item, locale),
        summary: item.description,
        href: withLocale(`/tests/${item.slug}/take`),
        kind: "test_detail",
        badgeLabel: item.scale_code ?? null,
      }));
  const heroTitle = landingSurface?.summaryBlocks[0]?.title || dict.tests.title;
  const heroSummary = landingSurface?.summaryBlocks[0]?.body || "";

  return (
    <main>
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Container className="pt-6">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
            { label: locale === "zh" ? "测评" : "Tests" },
          ]}
        />
      </Container>
      <section
        data-testid="tests-list-hero-section"
        className="fm-section-white border-b border-[var(--fm-border)] py-[var(--fm-section-y-sm)]"
      >
        <Container className="space-y-[var(--fm-space-5)]">
          <div className="space-y-[var(--fm-gap-xs)]">
            <h1 className="m-0 font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)]">{heroTitle}</h1>
            {heroSummary ? <p className="m-0 text-[var(--fm-text-muted)]">{heroSummary}</p> : null}
          </div>
          <div className="flex flex-wrap gap-[var(--fm-gap-sm)]">
            {topTests.map((item) => {
              const titleDisplay = formatCardTitleForUi({
                title: item.title,
                slug: item.key,
                locale,
                surface: "tests_top_chip",
              });

              return (
                <Link
                  key={item.key}
                  href={normalizePublicHref(item.href, locale)}
                  title={titleDisplay.plain}
                  className={buttonVariants({
                    variant: "outline",
                    size: "sm",
                    className:
                      "h-auto min-h-[var(--fm-touch-target-min)] px-[var(--fm-pad-btn-sm-x)] py-[var(--fm-pad-btn-sm-y)] text-center leading-tight",
                  })}
                >
                  {titleDisplay.multilineFallback ? (
                    <span className="inline-flex flex-col items-center text-[0.82rem] md:text-[0.86rem]">
                      <span>{titleDisplay.line1}</span>
                      <span className="mt-[var(--fm-space-1)]">{titleDisplay.line2}</span>
                    </span>
                  ) : (
                    <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-[0.82rem] md:text-[0.86rem]">
                      {titleDisplay.line1}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      <section data-testid="tests-list-grid-section">
        <Container className="max-w-[76rem] py-[var(--fm-space-10)]">
          <div className="grid gap-[var(--fm-space-5)] md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => (
              <TestCard
                key={test.slug}
                slug={test.slug}
                title={gatewayItemsBySlug.get(test.slug)?.title ?? resolveTestTitleByLocale(test, locale)}
                description={gatewayItemsBySlug.get(test.slug)?.summary ?? test.description}
                coverImage={test.cover_image}
                questions={test.questions_count}
                timeMinutes={test.time_minutes}
                scaleCode={test.scale_code}
                locale={locale}
                cardVisual={test.card_visual}
                cardTone={test.card_tone}
                cardSeed={test.card_seed}
                cardDensity={test.card_density}
                highlightRating={test.highlight_rating}
              />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
