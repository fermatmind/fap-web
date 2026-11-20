import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import manifest from "@/content/career-comparisons/manifest.json";
import originalPreviews from "@/app/(localized)/[locale]/career-compare/[pair]/approvedPreviews.json";
import type { FixedComparisonLocale } from "./fixedComparisonPreview";

export type ComparisonDraft = {
  title: string; description: string; beforeFaq: string; afterFaq: string;
  faq: { question: string; answer: string }[];
  methods?: { label: string; body: string }; sourceSha256: string;
};

export function readFixedComparisonDraft(locale: FixedComparisonLocale, id: string): ComparisonDraft | null {
  const entry = manifest.find(row => row.id === id);
  if (!entry) return (originalPreviews as Record<string, Partial<Record<FixedComparisonLocale, ComparisonDraft>>>)[id]?.[locale] ?? null;
  const fileLocale = locale === "zh" ? "zh-CN" : locale;
  const raw = readFileSync(path.join(process.cwd(), "content/career-comparisons", entry.id, `${fileLocale}.md`));
  const sourceSha256 = createHash("sha256").update(raw).digest("hex");
  if (sourceSha256 !== entry.pages[locale].sha256) throw new Error(`Comparison source digest mismatch: ${entry.id}/${fileLocale}`);
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw.toString("utf8"));
  if (!match) throw new Error(`Invalid comparison draft: ${entry.id}/${fileLocale}`);
  const meta = JSON.parse(match[1]);
  if (meta.pair_id !== id || meta.locale !== fileLocale) throw new Error("Comparison identity mismatch");
  const body = match[2].replace(/^\s*# [^\n]*\n/, "");
  const parts = body.split("<!-- comparison-faq -->");
  if (parts.length !== 2) throw new Error("Comparison FAQ marker mismatch");
  return { title: meta.title, description: meta.description, beforeFaq: parts[0], afterFaq: parts[1], faq: meta.faq_items, sourceSha256 };
}

// Keep first-party navigation inside the preview; source Markdown stays unchanged.
export function comparisonPreviewMarkdown(markdown: string) {
  return markdown.replace(/https:\/\/fermatmind\.com(?=\/)/g, "");
}
