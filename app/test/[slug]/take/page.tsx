// fap-web/app/test/[slug]/take/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug } from "@/lib/content";

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

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <h1>开始测试：{test.title}</h1>

      <p>这里是占位答题页（Stage 2）。后续会接入真实答题体验。</p>

      <p style={{ marginTop: 8 }}>
        <strong>题量：</strong>
        {test.questionCount} 题 · <strong>用时：</strong>
        {test.estTime}
      </p>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {/* 先不断链：后续你可以改成跳转到小程序/H5/真实答题页 */}
        <a
          href="/"
          style={{
            padding: "10px 14px",
            border: "1px solid #111",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          进入答题入口（占位）
        </a>

        <Link href={`/test/${slug}`} style={{ textDecoration: "none" }}>
          返回落地页
        </Link>
      </div>
    </main>
  );
}
