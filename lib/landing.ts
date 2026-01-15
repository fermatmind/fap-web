// fap-web/lib/landing.ts
import fs from "node:fs";
import path from "node:path";

export type LandingFAQ = { q: string; a: string };

export type LandingTable = {
  caption: string;
  columns: [string, string];
  rows: [string, string][];
};

export type LandingCTA = {
  primary: { text: string; href: string };
  secondary?: { text: string; href: string };
};

export type LandingSEO = {
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  canonical_path?: string;
  og_title?: string;
  og_image?: string;
  share_abstract?: string;
};

export type LandingDoc = {
  slug: string;
  locale?: string;
  region?: string;
  last_updated?: string;
  h1_title: string;
  executive_summary: string;
  intro: string;
  faq_list: LandingFAQ[];
  table: LandingTable;
  cta: LandingCTA;
  seo?: LandingSEO;
};

function landingDir(): string {
  // fap-web/content/landing
  return path.join(process.cwd(), "content", "landing");
}

export function listLandingSlugs(): string[] {
  const dir = landingDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

export function loadLandingBySlug(slug: string): LandingDoc | null {
  const file = path.join(landingDir(), `${slug}.json`);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf-8");
  const doc = JSON.parse(raw) as LandingDoc;

  // 最小保护：确保 slug 一致，避免文件名/内容不一致导致歧义
  if (doc.slug && doc.slug !== slug) {
    // 允许你未来把 doc.slug 留空；现在先严格一点
    throw new Error(
      `Landing slug mismatch: filename="${slug}" but json.slug="${doc.slug}"`
    );
  }

  // 最小字段校验（Step 5 够用；更严格校验留给 Task 2 self-check）
  if (!doc.h1_title || !doc.executive_summary || !doc.intro) return null;
  if (!Array.isArray(doc.faq_list) || doc.faq_list.length < 3) return null;
  if (!doc.table?.rows?.length) return null;
  if (!doc.cta?.primary?.href) return null;

  return doc;
}