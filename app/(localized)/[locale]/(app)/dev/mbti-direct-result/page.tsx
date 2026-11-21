import { notFound } from "next/navigation";
import { fetchPersonalityDesktopCloneContent } from "@/lib/cms/personality-desktop-clone";
import { applicationPreview } from "./application-preview";
import { previewStrengths } from "./strengths-preview";
import { FullReportPreview } from "../mbti-influential/FullReportPreview";

export const dynamic = "force-dynamic";
export const metadata = { title: "ISFJ-A · MBTI 直接结果预览", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV !== "development" || (await params).locale !== "zh") notFound();
  const data = await fetchPersonalityDesktopCloneContent("ISFJ-A", "zh");
  if (!data) return <p role="alert">ISFJ-A 已发布内容暂时无法加载，请稍后重试。</p>;
  // Raw first-pole percentages are copied from the user-selected result overview.
  // The report body is the published type content, not a private attempt snapshot.
  const dimensions = [
    { axisCode: "EI", leftCode: "E", rightCode: "I", leftLabel: "外向", rightLabel: "内向", dominantPole: "I", dominantLabel: "内向", rawFirstPolePct: 49, dominantPct: 51 },
    { axisCode: "SN", leftCode: "S", rightCode: "N", leftLabel: "实感", rightLabel: "直觉", dominantPole: "S", dominantLabel: "实感", rawFirstPolePct: 65, dominantPct: 65 },
    { axisCode: "TF", leftCode: "T", rightCode: "F", leftLabel: "思考", rightLabel: "情感", dominantPole: "F", dominantLabel: "情感", rawFirstPolePct: 47, dominantPct: 53 },
    { axisCode: "JP", leftCode: "J", rightCode: "P", leftLabel: "判断", rightLabel: "知觉", dominantPole: "J", dominantLabel: "判断", rawFirstPolePct: 54, dominantPct: 54 },
    { axisCode: "AT", leftCode: "A", rightCode: "T", leftLabel: "坚定", rightLabel: "敏感", dominantPole: "A", dominantLabel: "坚定", rawFirstPolePct: 50, dominantPct: 50 },
  ];
  return <>
    <aside className="bg-emerald-50 px-6 py-3 text-sm text-emerald-950">本地预览 · ISFJ-A · 强项、短板与应用模块为本地改稿，其余为已发布类型内容；分数沿用所选结果概览。</aside>
    <main className="mx-auto max-w-[1320px] px-6 py-8 md:px-10">
      <FullReportPreview data={previewStrengths(data)} dimensions={dimensions} applicationContent={applicationPreview} isUnlocked suppressUnlockSurfaces />
    </main>
  </>;
}
