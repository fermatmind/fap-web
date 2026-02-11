// fap-web/app/test/[slug]/take/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/content";
import { getQuestionsForSlug } from "@/lib/quiz/mock";
import QuizTakeClient from "./QuizTakeClient";

// ✅ Step 6: noindex for take page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const test = getTestBySlug(slug);

  return {
    title: test ? `开始测试 - ${test.title}` : `开始测试 - ${slug}`,
    robots: {
      index: false,
      follow: false,
      nocache: true,
    },
    // 可选：把 take 页 canonical 指回落地页（防止产生可收录重复页）
    alternates: {
      canonical: `/test/${slug}`,
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
            {test.category}
          </p>
          <h1 style={{ margin: "6px 0 0" }}>开始测试：{test.title}</h1>
        </div>
        <Link href={`/test/${slug}`} style={{ textDecoration: "none" }}>
          返回落地页
        </Link>
      </div>

      <QuizTakeClient slug={slug} questions={questions} />
    </main>
  );
}
