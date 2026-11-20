import { notFound } from "next/navigation";
import { JungReport } from "@/components/result/jung/JungReportPreview";
import { jungSampleScores } from "@/components/result/jung/jungReportAssets";

export const metadata = {
  title: "荣格十二原型示例报告 | 费马测试",
  robots: { index: false, follow: false },
};

export default async function JungSamplePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "zh") notFound();
  return (
    <JungReport mode="sample" scores={jungSampleScores} referenceId="sage" />
  );
}
