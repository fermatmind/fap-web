import type { Metadata } from "next";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { getAllTests } from "@/lib/content";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
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
  const tests = getAllTests();

  return (
    <Container as="main" className="py-10">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-[var(--fm-text)]">{dict.tests.title}</h1>
        <p className="text-[var(--fm-text-muted)]">{dict.tests.subtitle}</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {tests.map((test) => (
          <TestCard
            key={test.slug}
            slug={test.slug}
            title={test.title}
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
          />
        ))}
      </div>
    </Container>
  );
}
