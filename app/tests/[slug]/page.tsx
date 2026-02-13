import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CTASticky } from "@/components/business/CTASticky";
import { FAQAccordion, type FAQItem } from "@/components/business/FAQAccordion";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests, getTestBySlug } from "@/lib/content";

function buildFaqItems(testTitle: string, minutes: number, questions: number): FAQItem[] {
  return [
    {
      q: `How long does ${testTitle} take?`,
      a: `Most people finish this test in about ${minutes} minutes.`,
    },
    {
      q: "Do I need to answer every question?",
      a: `Yes. This assessment uses all ${questions} items for a complete result profile.`,
    },
    {
      q: "Can I retake the test?",
      a: "Yes. You can retake any test if you want to compare results over time.",
    },
    {
      q: "Is this a medical diagnosis?",
      a: "No. The result is for self-discovery and does not replace professional clinical advice.",
    },
  ];
}

export function generateStaticParams() {
  return getAllTests().map((test) => ({ slug: test.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  if (!test) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = test.title;
  const description = test.description;
  const url = `/tests/${test.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [test.cover_image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [test.cover_image],
    },
  };
}

export default async function TestLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const test = getTestBySlug(slug);
  if (!test) return notFound();

  const faqItems = buildFaqItems(test.title, test.time_minutes, test.questions_count);

  return (
    <Container as="main" className="pb-28 pt-10 lg:pb-10">
      <AnalyticsPageViewTracker eventName="view_test" properties={{ slug: test.slug }} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-700">
              Personality Assessment
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {test.title}
            </h1>
            <p className="max-w-3xl text-slate-600">{test.description}</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>{test.questions_count} questions</span>
              <span>•</span>
              <span>{test.time_minutes} minutes</span>
              {test.scale_code ? (
                <>
                  <span>•</span>
                  <span>{test.scale_code}</span>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={`/tests/${test.slug}/take`}
                prefetch
                className={buttonVariants({ size: "lg" })}
              >
                Start test
              </Link>
              <Link
                href="/tests"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Back to tests
              </Link>
            </div>
          </section>

          <Card>
            <CardHeader>
              <CardTitle>What to expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>1. Complete the questionnaire in one focused sitting.</p>
              <p>2. Submit your answers and review the generated result summary.</p>
              <p>3. Optionally load the full report for deeper interpretation.</p>
            </CardContent>
          </Card>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">FAQ</h2>
            <FAQAccordion items={faqItems} />
          </section>
        </div>

        <aside>
          <CTASticky
            slug={test.slug}
            title={test.title}
            questions={test.questions_count}
            minutes={test.time_minutes}
          />
        </aside>
      </div>
    </Container>
  );
}
