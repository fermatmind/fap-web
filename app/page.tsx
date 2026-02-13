import Link from "next/link";
import { TestCard } from "@/components/business/TestCard";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests } from "@/lib/content";

export default function Home() {
  const featuredTests = getAllTests().slice(0, 6);

  return (
    <main>
      <AnalyticsPageViewTracker eventName="view_landing" />

      <section className="border-b border-slate-200 bg-white">
        <Container className="grid gap-8 py-14 md:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
              Evidence-informed personality assessments
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Free Personality Tests With Actionable Insights
            </h1>
            <p className="max-w-2xl text-lg text-slate-600">
              Take research-backed tests, get clear results, and choose the next assessment that fits your goals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/tests/personality-mbti-test/take"
                className={buttonVariants({ size: "lg" })}
              >
                Start free test
              </Link>
              <Link
                href="/tests"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Browse tests
              </Link>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Why FermatMind</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Transparent scoring and methodology-first product design.</p>
              <p>Structured flow with progress visibility and clear summaries.</p>
              <p>Privacy-conscious defaults for sensitive assessment sessions.</p>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="py-14">
        <Container className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Featured Tests</h2>
              <p className="mt-1 text-sm text-slate-600">Choose a test and start immediately.</p>
            </div>
            <Link href="/tests" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
              View all
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
              />
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
