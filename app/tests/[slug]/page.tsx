import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import * as runtime from "react/jsx-runtime";
import { getAllTests, getTestBySlug } from "@/lib/content";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";

function getMDXComponent(code: string) {
  const fn = new Function(code);
  return fn(runtime).default;
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

  const MDXContent = getMDXComponent(test.body);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <AnalyticsPageViewTracker
        eventName="view_test_landing"
        properties={{ slug: test.slug }}
      />
      <h1>{test.title}</h1>
      <p>{test.description}</p>

      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <h2>Test Info</h2>
        <dl style={{ display: "grid", gap: 8 }}>
          <div>
            <dt style={{ fontWeight: 600 }}>Questions</dt>
            <dd>{test.questions_count}</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 600 }}>Time</dt>
            <dd>{test.time_minutes} minutes</dd>
          </div>
        </dl>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>Start</h2>
        <p>When you're ready, open the take page and complete the assessment.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href={`/tests/${test.slug}/take`}
            prefetch
            style={{
              padding: "10px 14px",
              border: "1px solid #111",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            Start test
          </Link>
          <Link href="/tests" style={{ textDecoration: "none" }}>
            Back to tests
          </Link>
        </div>
      </section>

      <article
        style={{ display: "grid", gap: 12, lineHeight: 1.7 }}
        className="test-mdx-content"
      >
        <MDXContent />
      </article>
    </main>
  );
}
