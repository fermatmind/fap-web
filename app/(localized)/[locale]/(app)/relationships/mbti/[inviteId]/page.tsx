import type { Metadata } from "next";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import PrivateRelationshipClient from "./PrivateRelationshipClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);

  return {
    title: locale === "zh" ? "私密关系洞察" : "Private relationship sync",
    description: dict.history.mbti.descriptionPrimary,
    robots: NOINDEX_ROBOTS,
  };
}

export default async function PrivateRelationshipPage({
  params,
}: {
  params: Promise<{ locale: string; inviteId: string }>;
}) {
  const { locale: localeParam, inviteId } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <PrivateRelationshipClient locale={locale} inviteId={inviteId} />
    </main>
  );
}
