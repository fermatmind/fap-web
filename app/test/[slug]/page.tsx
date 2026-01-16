// fap-web/app/test/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listLandingSlugs, loadLandingBySlug } from "@/lib/landing";

type Variant = {
  variant_code?: string;
  label_zh?: string;
  question_count?: number;
  test_time_minutes?: string; // e.g. "2–3分钟" / "8–12分钟" / "15–20分钟"
  duration_iso?: string; // ✅ machine-friendly, e.g. "PT2M" / "PT10M" / "PT20M"
};

function absUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return new URL(p, base).toString();
}

function toMaxMinutes(input: string): number | null {
  const nums = (input.match(/\d+/g) || [])
    .map((s) => parseInt(s, 10))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (nums.length === 0) return null;
  return Math.max(...nums);
}

function toIsoDurationPTM(input: string): string {
  // 兜底：不要 throw，避免 SSR 直接炸；schema 宁可保守
  const maxM = toMaxMinutes(input);
  return `PT${maxM && maxM > 0 ? maxM : 1}M`;
}

function isValidIsoDurationPTM(s: string): boolean {
  // strict enough for our use: PT<number>M
  return /^PT([1-9]\d*)M$/.test(s);
}

function normalizeDurationIso(v: Variant): string | undefined {
  // ✅ 优先使用 duration_iso（严格 ISO 8601），否则 fallback 到 test_time_minutes 的 max
  const iso = (v.duration_iso || "").trim();
  if (iso && isValidIsoDurationPTM(iso)) return iso;

  const t = (v.test_time_minutes || "").trim();
  if (!t) return undefined;

  return toIsoDurationPTM(t);
}

function splitBySlash(s: string): string[] {
  return s
    .split("/")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseVariantsFromTable(table: any): Variant[] {
  if (!table?.rows || !Array.isArray(table.rows)) return [];

  const rows: Array<[string, string]> = table.rows;
  const qRow = rows.find(
    ([k]) => typeof k === "string" && k.includes("题量（3档）")
  );
  const tRow = rows.find(
    ([k]) => typeof k === "string" && k.includes("预计用时（3档）")
  );
  if (!qRow || !tRow) return [];

  const qText = typeof qRow[1] === "string" ? qRow[1] : "";
  const tText = typeof tRow[1] === "string" ? tRow[1] : "";

  // 题量：抓取 "24题（简易版） / 93题（标准版） / 144题（专业版）"
  const qParts = splitBySlash(qText);
  const parsedQ = qParts
    .map((part) => {
      const m = part.match(/(\d+)\s*题(?:（([^）]+)）)?/);
      if (!m) return null;
      const n = parseInt(m[1], 10);
      if (!Number.isFinite(n) || n <= 0) return null;
      const label = (m[2] || "").trim();
      return { n, label };
    })
    .filter(Boolean) as Array<{ n: number; label: string }>;

  const tParts = splitBySlash(tText);

  // zip：按 index 对齐
  const len = Math.max(parsedQ.length, tParts.length);
  const variants: Variant[] = [];

  const inferCode = (n: number): string => {
    if (n === 24) return "quick_24";
    if (n === 93) return "standard_93";
    if (n === 144) return "pro_144";
    return `v_${n}`;
  };

  for (let i = 0; i < len; i++) {
    const q = parsedQ[i];
    const t = tParts[i];

    if (!q && !t) continue;

    const question_count = q?.n;
    const label_zh =
      q?.label && q.label.length > 0
        ? `${q.label}`
        : question_count
          ? `${question_count}题版本`
          : `版本${i + 1}`;

    const test_time_minutes = typeof t === "string" && t.length > 0 ? t : undefined;

    variants.push({
      variant_code: question_count ? inferCode(question_count) : `v_${i + 1}`,
      label_zh,
      question_count,
      test_time_minutes,
    });
  }

  return variants.filter(
    (v) =>
      (typeof v.question_count === "number" && v.question_count > 0) ||
      (typeof v.test_time_minutes === "string" && v.test_time_minutes.length > 0) ||
      (typeof v.duration_iso === "string" && v.duration_iso.length > 0)
  );
}

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
    alternates: { canonical: canonicalPath },
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

  // =========================================================
  // ✅ Task 3: JSON-LD (Quiz + BreadcrumbList + Dataset)
  // 目标：补齐 timeRequired(ISO8601) + hasPart（三档）
  // 关键：优先读 variants[].duration_iso（PT2M/PT10M/PT20M）
  // =========================================================

  // 1) 站点绝对域名（你域名）
  //    建议在 fap-web/.env.local 配置：NEXT_PUBLIC_SITE_URL=https://fermatmind.com
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fermatmind.com";

  // 2) canonical / landing url / take url
  const canonicalPathRaw = doc.seo?.canonical_path ?? `/test/${slug}`;
  const canonicalPath = canonicalPathRaw.startsWith("/")
    ? canonicalPathRaw
    : `/${canonicalPathRaw}`;

  const landingUrl = absUrl(siteUrl, canonicalPath);
  const takeUrl = absUrl(siteUrl, `${canonicalPath}/take`);

  // 3) variants：优先 doc.variants（你已在 landing.json 增加 variants + duration_iso）
  const variantsFromDoc: Variant[] = Array.isArray((doc as any).variants)
    ? ((doc as any).variants as Variant[])
    : [];

  const variants: Variant[] =
    variantsFromDoc.length > 0
      ? variantsFromDoc
      : parseVariantsFromTable((doc as any).table);

  // 4) Dataset @id（Quiz.mainEntity 关联 Dataset）
  const datasetId = `${landingUrl}#dataset`;

  // 5) Quiz JSON-LD
  const quizLd: any = {
    "@context": "https://schema.org",
    "@type": "Quiz",
    "@id": `${landingUrl}#quiz`,
    name: doc.h1_title,
    description: doc.executive_summary ?? doc.seo?.seo_description ?? "",
    inLanguage: (doc as any).locale ?? "zh-CN",
    url: landingUrl,
    isAccessibleForFree: true,

    // ✅ potentialAction + EntryPoint（Gemini 建议）
    potentialAction: {
      "@type": "StartAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: takeUrl,
        actionPlatform: [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform",
        ],
      },
    },

    // ✅ assesses：用 keywords 表达（如果有）
    ...(Array.isArray(doc.seo?.seo_keywords) && doc.seo?.seo_keywords.length > 0
      ? { assesses: doc.seo.seo_keywords }
      : {}),

    // ✅ Quiz -> Dataset 关联（Gemini 建议）
    mainEntity: { "@id": datasetId },
  };

  // ✅ timeRequired（顶层总时长）/ hasPart（三档拆分）
  // - 顶层 timeRequired：取三档 duration_iso 的最大分钟（一般 PT20M）
  // - 子项 timeRequired：严格使用 duration_iso（否则 fallback）
  if (variants.length > 0) {
    const partIso = variants
      .map((v) => normalizeDurationIso(v))
      .filter((x): x is string => typeof x === "string" && x.length > 0);

    // 顶层 timeRequired：取 max minutes
    if (partIso.length > 0) {
      const mins = partIso
        .map((d) => {
          const m = d.match(/^PT(\d+)M$/);
          return m ? parseInt(m[1], 10) : null;
        })
        .filter((n): n is number => typeof n === "number" && Number.isFinite(n) && n > 0);

      if (mins.length > 0) {
        quizLd.timeRequired = `PT${Math.max(...mins)}M`;
      }
    }

    // hasPart：对标 Truity，多版本显式拆分
    const parts = variants
      .map((v) => {
        const qc = typeof v.question_count === "number" ? v.question_count : null;
        const label = (v.label_zh || "").trim();
        const iso = normalizeDurationIso(v);

        if (!qc && !label && !iso) return null;

        // ✅ 命名更“实体化”（Gemini 建议 + SEO 点击率）
        // 费马测试 MBTI 24题简易版
        const name = qc
          ? `费马测试 MBTI ${qc}题${label ? label : "版本"}`
          : `费马测试 MBTI ${label || "版本"}`;

        return {
          "@type": "Quiz",
          name,
          ...(iso ? { timeRequired: iso } : {}),
          url: landingUrl,
        };
      })
      .filter(Boolean);

    if (parts.length > 0) quizLd.hasPart = parts;
  }

  // 6) BreadcrumbList JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "首页", item: absUrl(siteUrl, "/") },
      // 你未来有 /tests 聚合页就改这里；暂时用 /test
      { "@type": "ListItem", position: 2, name: "测评", item: absUrl(siteUrl, "/test") },
      { "@type": "ListItem", position: 3, name: doc.h1_title, item: landingUrl },
    ],
  };

  // 7) Dataset JSON-LD（对标 123test 的“常模/数据”权威感）
  const datasetLd: any = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": datasetId,
    name: `${doc.h1_title} norms & report dataset`,
    description: `${doc.intro ?? doc.executive_summary ?? doc.h1_title}（内容包版本化更新、脱敏统计，用于生成结构化报告）`,
    inLanguage: (doc as any).locale ?? "zh-CN",
    isAccessibleForFree: true,
    dateModified: (doc as any).last_updated ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Fermat Mind / 费马测试",
    },
    url: landingUrl,
  };

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      {/* ✅ JSON-LD 必须随 HTML 源码直出：放在 <h1> 之前 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetLd) }}
      />

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
      {doc.faq_list.map((item: any, idx: number) => (
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
          {doc.table.rows.map(([k, v]: [string, string], i: number) => (
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