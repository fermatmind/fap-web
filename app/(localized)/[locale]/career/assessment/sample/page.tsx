import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Career94FreeReport } from "../Career94FreeReport";

export const metadata: Metadata = { title: "Career interest report sample | FermatMind", robots: { index: false, follow: true } };

export default async function Career94SamplePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return <main><Career94FreeReport locale={locale} sample /></main>;
}
