import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPreviewClient } from "@/components/articles/BlogPreviewClient";
import { isSupportedLocale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "CMS blog layout preview",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function BlogPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();
  return <BlogPreviewClient locale={locale} />;
}
