import { notFound } from "next/navigation";
import {
  archetypeAssets,
  commonAssets,
  type PreviewPattern,
} from "@/components/result/jung/jungReportAssets";
import { JungReportPreview } from "@/components/result/jung/JungReportPreview";

export const metadata = {
  title: "荣格报告本地预览 | 费马测试",
  robots: { index: false, follow: false },
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    form?: string;
    archetype?: string;
    pattern?: string;
  }>;
}) {
  if (process.env.NODE_ENV !== "development") notFound();
  const { locale } = await params;
  if (locale !== "zh") notFound();
  const { form, archetype = "sage", pattern = "clear" } = await searchParams;
  if (form && form !== "archetypes") notFound();
  if (
    !archetypeAssets.some((asset) => asset.id === archetype) ||
    !Object.hasOwn(commonAssets.states, pattern)
  )
    notFound();
  return (
    <JungReportPreview
      initialArchetype={archetype}
      initialPattern={pattern as PreviewPattern}
    />
  );
}
