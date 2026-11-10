import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import ResultPage from "@/app/(localized)/[locale]/(app)/result/[id]/page";

export const metadata = { robots: NOINDEX_ROBOTS };
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TraditionalResultPage({ params, searchParams }: Props) {
  const page = await ResultPage({
    params: params.then(({ id }) => ({ locale: "zh-TW", id })),
    searchParams,
  });
  return <LocaleProvider locale="zh">{page}</LocaleProvider>;
}
