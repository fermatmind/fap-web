import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/content";
import { getQuestionsForSlug } from "@/lib/quiz/mock";
import QuizTakeClient from "./QuizTakeClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  return {
    title: test ? `Start test - ${test.title}` : `Start test - ${slug}`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
    alternates: {
      canonical: `/tests/${slug}`,
    },
  };
}

export default async function TakePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const test = getTestBySlug(slug);
  if (!test) return notFound();

  const questions = getQuestionsForSlug(slug);

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <p style={{ margin: 0, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Personality Test
          </p>
          <h1 style={{ margin: "6px 0 0" }}>Start: {test.title}</h1>
        </div>
        <Link href={`/tests/${slug}`} style={{ textDecoration: "none" }}>
          Back to landing
        </Link>
      </div>

      <QuizTakeClient slug={slug} questions={questions} />
    </main>
  );
}
