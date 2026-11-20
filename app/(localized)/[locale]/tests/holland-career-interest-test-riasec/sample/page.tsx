import { notFound } from "next/navigation";
import { RiasecReportSample } from "@/components/result/riasec/RiasecReportSample";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };
export default async function SamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return <RiasecReportSample locale={locale} />;
}
