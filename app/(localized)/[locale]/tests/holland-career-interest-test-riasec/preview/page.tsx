import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Riasec60PaymentPreview } from "@/components/result/riasec/Riasec60PaymentPreview";

export const metadata: Metadata = { title: "Local Holland 60 payment preview", robots: { index: false, follow: false } };

export default async function Holland60PaymentPreviewPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ view?: string; profile?: string }>;
}) {
  const { locale } = await params;
  if (process.env.NODE_ENV !== "development" || (locale !== "zh" && locale !== "en")) notFound();
  const query = await searchParams;
  return <Riasec60PaymentPreview locale={locale} full={query.view === "report"} reading={query.view === "reading"} profile={query.profile} />;
}
