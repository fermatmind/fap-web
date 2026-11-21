import { notFound } from "next/navigation";
import { EQResultRedesign } from "@/components/result/eq/preview/EQResultRedesign";
import { eqPreviewResultIds, type EqRedesignCandidate, type EqRedesignLibrary } from "@/lib/eq/redesignPreview";

import { loadEqRedesignPreview } from "@/lib/eq/loadRedesignPreview";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return { title: locale === "en" ? "EQ result · Local preview" : locale === "zh-TW" ? "情商結果頁 · 本機預覽" : "情商结果页 · 本地预览", robots: { index: false, follow: false } };
}
export const dynamic = "force-dynamic";

export default async function Page({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ result?: string }> }) {
  const { locale } = await params;
  if (process.env.NODE_ENV !== "development" || !["zh", "en", "zh-TW"].includes(locale)) notFound();
  // Development-only, server-side read from the canonical backend source.
  // No report, user, release, entitlement or score API is read or modified.
  let candidate: EqRedesignCandidate | null = null;
  let library: EqRedesignLibrary | null = null;
  const requested = (await searchParams).result;
  if (requested && !eqPreviewResultIds.some(id => id === requested)) notFound();
  try {
    ({ library, candidate } = await loadEqRedesignPreview(requested));
  } catch {
    candidate = null;
  }
  const contentLocale = locale === "en" ? "en" : locale === "zh-TW" ? "zh-TW" : "zh-CN";
  if (!candidate || !library) return <main className="mx-auto max-w-3xl p-8"><p role="alert">{locale === "en" ? "Local EQ content is unavailable. Check the local content source and its schema validation." : locale === "zh-TW" ? "本機情商內容候選無法使用。請檢查本機內容來源及其結構驗證。" : "本地情商内容候选不可用。请检查本地内容源及其结构校验。"}</p></main>;
  return <EQResultRedesign candidate={candidate} locale={contentLocale} quality={candidate.sample.formulation_id === "low_confidence_result" ? library.quality_result[contentLocale] : undefined} />;
}
