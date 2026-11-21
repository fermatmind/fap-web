import { notFound } from "next/navigation";
import { fetchPersonalityDesktopCloneContent } from "@/lib/cms/personality-desktop-clone";
import { applyChinesePreview, previewCodes, previewDimensions } from "./content-preview";
import { FullReportPreview } from "../mbti-influential/FullReportPreview";
import { ResultEvidenceAndPrompts } from "./ResultEvidenceAndPrompts";
import styles from "./ai-conversation.module.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "MBTI 简体中文结果内容预览", robots: { index: false, follow: false } };

export default async function Page({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  if (process.env.NODE_ENV !== "development" || (await params).locale !== "zh") notFound();
  const requested = (await searchParams).type;
  const fullCode = typeof requested === "string" ? requested.toUpperCase() : "ISFJ-A";
  if (Array.isArray(requested) || !previewCodes.includes(fullCode)) notFound();
  const published = await fetchPersonalityDesktopCloneContent(fullCode, "zh");
  if (!published) return <p role="alert">{fullCode} 已发布内容暂时无法加载，请稍后重试。</p>;
  const candidate = applyChinesePreview(published);
  return <>
    <aside className="bg-emerald-50 px-6 py-3 text-sm text-emerald-950">
      本地预览 · {fullCode} · 简体中文三章内容候选；前部为已发布类型内容。分数仅作展示示例，不代表真实测评结果。
      <details className="mt-2"><summary className="cursor-pointer">切换预览类型（32 个变体）</summary>
        <nav aria-label="本地预览类型" className="mt-2 flex flex-wrap gap-3">{previewCodes.map((code) => <a key={code} href={`?type=${code}`} aria-current={code === fullCode ? "page" : undefined}>{code}</a>)}</nav>
      </details>
    </aside>
    <main className={`${styles.report} mx-auto max-w-[1320px] px-6 py-8 md:px-10`}>
      <FullReportPreview data={candidate.data} dimensions={previewDimensions(fullCode)} applicationContent={candidate.applications} faqReplacementNode={false} fullWidthFooterNode={<ResultEvidenceAndPrompts fullCode={fullCode} />} referenceRail isUnlocked suppressUnlockSurfaces />
    </main>
  </>;
}
