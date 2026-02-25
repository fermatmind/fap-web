import type { Metadata } from "next";
import Link from "next/link";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { canonicalUrl } from "@/lib/site";
import { formatCardTitleForUi } from "@/lib/ui/testTitleDisplay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";

  return {
    title: isZh ? "测评列表" : "Tests",
    description: isZh ? "浏览所有可用测评。" : "Browse all available tests.",
    alternates: {
      canonical: canonicalUrl(isZh ? "/zh/tests" : "/en/tests"),
      languages: {
        en: canonicalUrl("/en/tests"),
        zh: canonicalUrl("/zh/tests"),
        "x-default": canonicalUrl("/en/tests"),
      },
    },
  };
}

export default async function TestsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const tests = getAllTests().sort((a, b) => (b.highlight_priority ?? 0) - (a.highlight_priority ?? 0));
  const topTests = tests.slice(0, 3);

  return (
    <main>
      <section
        data-testid="tests-list-hero-section"
        className="fm-section-white border-b border-[var(--fm-border)] py-[var(--fm-section-y-sm)]"
      >
        <Container className="space-y-[var(--fm-space-5)]">
          <div className="space-y-[var(--fm-gap-xs)]">
            <h1 className="m-0 font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)]">{dict.tests.title}</h1>
          </div>
          <div className="flex flex-wrap gap-[var(--fm-gap-sm)]">
            {topTests.map((item) => {
              const localizedTitle = resolveTestTitleByLocale(item, locale);
              const titleDisplay = formatCardTitleForUi({
                title: localizedTitle,
                slug: item.slug,
                locale,
                surface: "tests_top_chip",
              });

              return (
                <Link
                  key={item.slug}
                  href={withLocale(`/tests/${item.slug}/take`)}
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
        <Container className="py-[var(--fm-space-10)]">
          <div className="grid gap-[var(--fm-space-5)] md:grid-cols-2 xl:grid-cols-3">
            {tests.map((test) => (
              <TestCard
                key={test.slug}
                slug={test.slug}
                title={resolveTestTitleByLocale(test, locale)}
                description={test.description}
                coverImage={test.cover_image}
                questions={test.questions_count}
                timeMinutes={test.time_minutes}
                scaleCode={test.scale_code}
                locale={locale}
                cardVisual={test.card_visual}
                cardTone={test.card_tone}
                cardSeed={test.card_seed}
                cardDensity={test.card_density}
                cardTaglineI18n={test.card_tagline_i18n}
                highlightRating={test.highlight_rating}
              />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
