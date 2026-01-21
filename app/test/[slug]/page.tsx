import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTestBySlug, listTests } from "@/lib/content";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
} from "@/lib/seo/generateSchema";

export function generateStaticParams() {
  return listTests().map((test) => ({ slug: test.slug }));
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

  const title = `${test.title} | FermatMind`;
  const description = test.description;
  const url = `https://www.fermatmind.com/test/${test.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
    },
    twitter: {
      card: "summary",
      title,
      description,
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

  const faqJsonLd = test.faq?.length ? buildFAQPageJsonLd(test) : null;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    slug: test.slug,
    title: test.title,
  });

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      {faqJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqJsonLd),
          }}
        />
      ) : null}
      {test.hero?.title ? (
        <p style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {test.hero.title}
        </p>
      ) : null}

      <h1>{test.title}</h1>
      <p>{test.description}</p>

      <section style={{ marginTop: 16, marginBottom: 24 }}>
        <h2>测试信息</h2>
        <dl style={{ display: "grid", gap: 8 }}>
          <div>
            <dt style={{ fontWeight: 600 }}>分类</dt>
            <dd>{test.category}</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 600 }}>预计用时</dt>
            <dd>{test.estTime}</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 600 }}>题量</dt>
            <dd>{test.questionCount} 题</dd>
          </div>
          <div>
            <dt style={{ fontWeight: 600 }}>最近更新</dt>
            <dd>{test.updatedAt}</dd>
          </div>
          {test.reviewedBy ? (
            <div>
              <dt style={{ fontWeight: 600 }}>审核</dt>
              <dd>{test.reviewedBy}</dd>
            </div>
          ) : null}
        </dl>

        {test.tags?.length ? (
          <p style={{ marginTop: 8 }}>
            <strong>标签：</strong>
            {test.tags.join(" / ")}
          </p>
        ) : null}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>开始测评</h2>
        <p>准备好开始后，进入测评页面完成题目。</p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link
            href={`/test/${test.slug}/take`}
            style={{
              padding: "10px 14px",
              border: "1px solid #111",
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            开始测试
          </Link>
          <Link href="/test" style={{ textDecoration: "none" }}>
            返回测试列表
          </Link>
        </div>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>常见问题</h2>
        {test.faq.map((item, idx) => (
          <section key={idx} style={{ marginBottom: 12 }}>
            <h3>{item.question}</h3>
            <p>{item.answer}</p>
          </section>
        ))}
      </section>

      {test.relatedTests?.length ? (
        <section>
          <h2>相关测评</h2>
          <ul>
            {test.relatedTests.map((slug) => (
              <li key={slug}>
                <Link href={`/test/${slug}`}>{slug}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {test.relatedTypes?.length ? (
        <section style={{ marginTop: 16 }}>
          <h2>相关类型</h2>
          <p>{test.relatedTypes.join(" / ")}</p>
        </section>
      ) : null}
    </main>
  );
}
