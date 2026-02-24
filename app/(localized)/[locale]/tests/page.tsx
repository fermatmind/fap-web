import type { Metadata } from "next";
import Link from "next/link";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { canonicalUrl } from "@/lib/site";

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
      <section className="fm-section-white border-b border-[var(--fm-border)] py-12">
        <Container className="space-y-5">
          <div className="space-y-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--fm-trust-blue)]">
              {locale === "zh" ? "测试库" : "Assessment Library"}
            </p>
            <h1 className="m-0 font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)]">{dict.tests.title}</h1>
            <p className="m-0 max-w-3xl text-[var(--fm-text-muted)]">{dict.tests.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {topTests.map((item) => (
              <Link
                key={item.slug}
                href={withLocale(`/tests/${item.slug}/take`)}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {resolveTestTitleByLocale(item, locale)}
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
    </main>
  );
}
