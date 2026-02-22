import Link from "next/link";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests } from "@/lib/content";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const featuredTests = getAllTests().slice(0, 6);
  const heroSpec = resolveCardSpec({
    slug: "home-hero",
    scale_code: "BIG5_OCEAN",
    card_visual: "bars_ocean",
    card_tone: "editorial",
    card_density: "regular",
    card_seed: "hero",
  });

  return (
    <main>
      <AnalyticsPageViewTracker eventName="view_landing" />

      <section className="border-b border-[var(--fm-border)] bg-transparent">
        <Container className="grid gap-8 py-14 md:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[var(--fm-accent)]">
              Evidence informed assessments
            </p>
            <h1 className="max-w-3xl font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)] md:text-5xl">
              Structured personality insights, rendered as code-first experience.
            </h1>
            <p className="max-w-2xl text-lg text-[var(--fm-text-muted)]">
              No decorative image wall. FermatMind now uses data-driven cards and deliberate typography for a faster,
              clearer, and more trusted assessment workflow.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={withLocale("/tests/personality-mbti-test/take")}
                className={buttonVariants({ size: "lg" })}
              >
                {locale === "zh" ? "开始免费测试" : "Start free test"}
              </Link>
              <Link
                href={withLocale("/tests")}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                {locale === "zh" ? "浏览测试" : "Browse tests"}
              </Link>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>Code-driven Visual Language</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <DataGlyph
                kind={heroSpec.visual}
                tone={heroSpec.tone}
                ariaLabel={dict.card.a11yVisualDescriptions[heroSpec.visual]}
                fallbackAriaLabel={dict.card.a11yVisualFallback}
                className="h-24"
              />
              <p>Token-based typography, spacing, and color cadence for consistent trust and readability.</p>
              <p>Reduced image payload and motion-safe interactions across desktop and mobile.</p>
              <p>Aligned with existing API contracts, clinical guardrails, and reporting workflows.</p>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="py-14">
        <Container className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold tracking-tight text-[var(--fm-text)]">Featured Tests</h2>
              <p className="mt-1 text-sm text-[var(--fm-text-muted)]">Choose a test and start immediately.</p>
            </div>
            <Link href={withLocale("/tests")} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
              {locale === "zh" ? "查看全部" : "View all"}
            </Link>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredTests.map((test) => (
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
      </section>
    </main>
  );
}
