import { Suspense } from "react";
import type { Metadata } from "next";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import MbtiHistoryClient from "./MbtiHistoryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);

  return {
    title: dict.history.mbti.metadataTitle,
    description: dict.history.mbti.descriptionPrimary,
    robots: NOINDEX_ROBOTS,
  };
}

export default function MbtiHistoryPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <Suspense fallback={null}>
        <MbtiHistoryClient />
      </Suspense>
    </main>
  );
}
