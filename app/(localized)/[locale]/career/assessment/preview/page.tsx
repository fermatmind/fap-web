import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Career94FreeReport } from "../Career94FreeReport";

export const metadata: Metadata = { title: "Local career result preview", robots: { index: false, follow: false } };

export default async function Career94DesignPreview({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (process.env.NODE_ENV !== "development" || (locale !== "zh" && locale !== "en")) notFound();
  return <main><Career94FreeReport locale={locale} sample overview /></main>;
}
