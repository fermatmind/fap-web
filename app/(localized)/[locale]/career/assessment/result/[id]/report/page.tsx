import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Career94SavedResult } from "../../../Career94SavedResult";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Career interest report | FermatMind", robots: { index: false, follow: false } };

export default async function Career94SavedReadingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  if ((locale !== "zh" && locale !== "en") || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)) notFound();
  return <main><Career94SavedResult locale={locale} attemptId={id} reading /></main>;
}
