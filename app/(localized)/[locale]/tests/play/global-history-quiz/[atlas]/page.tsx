import { notFound } from "next/navigation";
import { GlobalHistoryAtlas } from "@/components/entertainment/GlobalHistoryAtlas";
import { historyAtlasMetadata, isHistoryAtlas, type AtlasQuery } from "@/lib/entertainment/global-history/atlas";
import { resolveLocale } from "@/lib/i18n/getDict";

type Props = {
  params: Promise<{ locale: string; atlas: string }>;
  searchParams: Promise<AtlasQuery>;
};

async function resolveAtlas(props: Props) {
  const { locale, atlas } = await props.params;
  if (!isHistoryAtlas(atlas)) notFound();
  return { locale: locale === "zh-TW" ? locale : resolveLocale(locale), atlas, query: await props.searchParams } as const;
}

export async function generateMetadata(props: Props) {
  const { locale, atlas, query } = await resolveAtlas(props);
  return historyAtlasMetadata(locale, atlas, query);
}

export default async function Page(props: Props) {
  return <GlobalHistoryAtlas {...await resolveAtlas(props)} />;
}
