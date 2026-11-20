import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Career94FreeReport } from "../Career94FreeReport";

export const metadata: Metadata = { title: "Career interest report | FermatMind", robots: { index: false, follow: false } };

export default async function Career94FreeReportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return <main><Career94FreeReport locale={locale} /></main>;
}
