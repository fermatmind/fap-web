import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Riasec60PaymentPreview } from "@/components/result/riasec/Riasec60PaymentPreview";

export const metadata: Metadata = { title: "霍蘭德 60 題付費方案預覽", robots: { index: false, follow: false } };

export default async function TraditionalHolland60PaymentPreviewPage({ searchParams }: { searchParams: Promise<{ view?: string; profile?: string }> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const query = await searchParams;
  return <Riasec60PaymentPreview locale="zh-TW" full={query.view === "report"} reading={query.view === "reading"} profile={query.profile} />;
}
