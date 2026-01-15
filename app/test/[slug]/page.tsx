// fap-web/app/test/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listLandingSlugs, loadLandingBySlug } from "@/lib/landing";

// ✅ SSG：构建时为已有 JSON 生成静态页面
export function generateStaticParams() {
  return listLandingSlugs().map((slug) => ({ slug }));
}

// ✅ Step 6：canonical + SEO 基础 meta
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = loadLandingBySlug(slug);

  if (!doc) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = doc.seo?.canonical_path ?? `/test/${slug}`;

  return {
    title: doc.seo?.seo_title ?? doc.h1_title,
    description: doc.seo?.seo_description ?? doc.executive_summary,
    keywords: doc.seo?.seo_keywords,
    alternates: {
      canonical: canonicalPath, // 会基于 layout.tsx 的 metadataBase 变成绝对 URL
    },
    openGraph: {
      title: doc.seo?.og_title ?? doc.seo?.seo_title ?? doc.h1_title,
      description:
        doc.seo?.share_abstract ??
        doc.seo?.seo_description ??
        doc.executive_summary,
      images: doc.seo?.og_image ? [doc.seo.og_image] : undefined,
      type: "website",
    },
  };
}

export default async function TestLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const doc = loadLandingBySlug(slug);
  if (!doc) return notFound();

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      {/* 1) 唯一 H1 */}
      <h1>{doc.h1_title}</h1>

      {/* 2) Quick Answer Block（紧跟 H1） */}
      <p>
        <strong>导读：</strong>
        {doc.executive_summary}
      </p>

      {/* 3) 简介 */}
      <h2>测试简介与理论背景</h2>
      <p>{doc.intro}</p>

      {/* 4) FAQ（每问 H3） */}
      <h2>常见问题</h2>
      {doc.faq_list.map((item, idx) => (
        <section key={idx} style={{ marginBottom: 12 }}>
          <h3>{item.q}</h3>
          <p>{item.a}</p>
        </section>
      ))}

      {/* 5) 原生 table */}
      <h2>测试信息一览</h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: 8,
          marginBottom: 16,
        }}
      >
        <caption style={{ textAlign: "left", marginBottom: 8 }}>
          {doc.table.caption}
        </caption>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
              {doc.table.columns[0]}
            </th>
            <th style={{ borderBottom: "1px solid #ddd", textAlign: "left" }}>
              {doc.table.columns[1]}
            </th>
          </tr>
        </thead>
        <tbody>
          {doc.table.rows.map(([k, v], i) => (
            <tr key={i}>
              <td style={{ padding: "8px 0", verticalAlign: "top" }}>
                <strong>{k}</strong>
              </td>
              <td style={{ padding: "8px 0" }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 6) CTA */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <Link
          href={doc.cta.primary.href}
          style={{
            padding: "10px 14px",
            border: "1px solid #111",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          {doc.cta.primary.text}
        </Link>

        {doc.cta.secondary?.href ? (
          <Link href={doc.cta.secondary.href} style={{ textDecoration: "none" }}>
            {doc.cta.secondary.text}
          </Link>
        ) : null}
      </div>
    </main>
  );
}