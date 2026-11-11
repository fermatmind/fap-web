import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShareClient from "@/app/(localized)/[locale]/share/[id]/ShareClient";
import { isCoreSharePath } from "@/lib/i18n/coreShareDisplay";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "測評結果分享",
  robots: NOINDEX_ROBOTS,
  referrer: "no-referrer",
  alternates: { canonical: null, languages: {} },
};

export default async function TraditionalSharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isCoreSharePath(`/share/${id}`)) notFound();
  return <ShareClient locale="zh" displayLocale="zh-TW" shareId={id} />;
}
