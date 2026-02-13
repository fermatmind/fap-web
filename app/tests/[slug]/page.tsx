import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests, getTestBySlug } from "@/lib/content";

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

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <AnalyticsPageViewTracker
        eventName="view_test_landing"
        properties={{ slug: test.slug }}
      />

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{test.title}</h1>
      <p className="mt-3 text-slate-600">{test.description}</p>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Test Info</h2>
        <dl className="mt-3 grid gap-2 text-sm text-slate-700">
          <div>
            <dt className="font-semibold">Questions</dt>
            <dd>{test.questions_count}</dd>
          </div>
          <div>
            <dt className="font-semibold">Time</dt>
            <dd>{test.time_minutes} minutes</dd>
          </div>
          {test.scale_code ? (
            <div>
              <dt className="font-semibold">Scale</dt>
              <dd>{test.scale_code}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Start</h2>
        <p className="mt-2 text-slate-600">
          Open the take page when you are ready and complete the full questionnaire.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href={`/tests/${test.slug}/take`}
            prefetch
            className="rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Start test
          </Link>
          <Link href="/tests" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
            Back to tests
          </Link>
        </div>
      </section>
    </main>
  );
}
