// fap-web/app/share/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadLandingBySlug } from "@/lib/landing";

// ✅ 改成你真实存在的路径（你说要放这里）
import wechatDefault from "@/content/share_templates/personality-mbti-test/wechat_default.json";

import {
  buildSocialProofSchema,
  renderPlaceholders,
  toSafeCount,
} from "@/lib/shareTemplate";

function absUrl(base: string, path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return new URL(p, base).toString();
}

function normalizePublicPath(p: string): string {
  // 把 "share/x.png" 或 "/share/x.png" 统一成 "/share/x.png"
  const s = (p || "").trim();
  if (!s) return "";
  return s.startsWith("/") ? s : `/${s}`;
}

async function buildRendered(slug: string) {
  const tpl: any = wechatDefault;

  // 最小闭环：只支持这一个 slug
  if (slug !== String(tpl.scale_slug || "")) return null;

  const doc = loadLandingBySlug(slug);
  if (!doc) return null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fermatmind.com";

  const rawPH = (tpl.placeholders ?? {}) as Record<string, any>;

  // 模拟“动态 count”（未来替换为真实统计）
  const count = toSafeCount(rawPH.count ?? "0", 0);

  const placeholders = {
    ...rawPH,
    count,
    year: rawPH.year ?? "2026",
    scale_name: rawPH.scale_name ?? doc.h1_title,
    is_free: rawPH.is_free ?? "免费",
  };

  const title = renderPlaceholders(tpl.title ?? "", placeholders);
  const abstract = renderPlaceholders(tpl.abstract ?? "", placeholders);
  const tagline = renderPlaceholders(tpl.tagline ?? "", placeholders);

  // 图片：你现在放在 fap-web/public/share/... 里，所以这里用相对 public path
  // 例如 tpl.cover_image_wide = "share/mbti_wide_1200x630.png"
  const ogImage = absUrl(siteUrl, normalizePublicPath(tpl.cover_image_wide));

  const socialProof = buildSocialProofSchema(tpl.social_proof_schema, placeholders);

  return { tpl, doc, siteUrl, placeholders, title, abstract, tagline, ogImage, socialProof };
}

// ✅ 用 Metadata API 生成 head（不要在 page 里写 <html><head>）
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await buildRendered(slug);
  if (!r) return { title: "Not Found", robots: { index: false, follow: false } };

  const syncToMeta = Boolean(r.tpl?.sync_to_meta);

  // 规范：分享页默认 noindex（你自己 spec 也写了）
  const robots = { index: false, follow: false };

  // sync_to_meta=true：title/description 强制用模板
  const title = syncToMeta ? r.title : (r.doc.seo?.seo_title ?? r.doc.h1_title);
  const description = syncToMeta ? r.abstract : (r.doc.seo?.seo_description ?? r.doc.executive_summary);

  return {
    title,
    description,
    robots,
    openGraph: {
      title,
      description,
      images: r.ogImage ? [r.ogImage] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: r.ogImage ? [r.ogImage] : undefined,
    },
  };
}

export default async function SharePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await buildRendered(slug);
  if (!r) return notFound();

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      {/* JSON-LD 放在 body 也可以被抓取；关键是 SSR 直出 */}
      {r.socialProof ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(r.socialProof) }}
        />
      ) : null}

      <h1>Share Preview: {r.doc.h1_title}</h1>
      <p>用于验证模板字段是否正确渲染到 head（通过 generateMetadata）以及 JSON-LD 是否直出。</p>

      <h2>Rendered</h2>
      <ul>
        <li><strong>title</strong>: {r.title}</li>
        <li><strong>abstract</strong>: {r.abstract}</li>
        <li><strong>tagline</strong>: {r.tagline}</li>
        <li><strong>count</strong>: {r.placeholders.count}</li>
        <li><strong>og:image</strong>: {r.ogImage}</li>
      </ul>

      <p>打开 <code>view-source:http://localhost:3000/share/personality-mbti-test</code>，检查 head 里 OG/Twitter，以及 JSON-LD 的 userInteractionCount 是否为数字。</p>
    </main>
  );
}