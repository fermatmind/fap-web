import type { Metadata } from "next";
import { getDict, resolveLocale } from "@/lib/i18n/getDict";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import RelationshipIndexClient from "./RelationshipIndexClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = await getDict(locale);

  return {
    title: locale === "zh" ? "关系回访入口" : "Relationship hub",
    description: dict.history.mbti.descriptionPrimary,
    robots: NOINDEX_ROBOTS,
  };
}

export default async function RelationshipIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <RelationshipIndexClient locale={locale} />
    </main>
  );
}
