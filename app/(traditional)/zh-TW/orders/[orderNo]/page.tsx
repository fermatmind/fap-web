import OriginalPage from "@/app/(localized)/[locale]/orders/[orderNo]/page";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "訂單狀態",
  robots: NOINDEX_ROBOTS,
  referrer: "no-referrer",
};

export default function TraditionalOrderPage({ params, searchParams }: {
  params: Promise<{ orderNo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return OriginalPage({ params: params.then(({ orderNo }) => ({ locale: "zh-TW", orderNo })), searchParams });
}
