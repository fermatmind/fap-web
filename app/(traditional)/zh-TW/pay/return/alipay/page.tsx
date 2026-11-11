import OriginalPage from "@/app/(localized)/[locale]/pay/return/alipay/page";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const dynamic = "force-dynamic";
export const metadata = { robots: NOINDEX_ROBOTS, referrer: "no-referrer" };

export default function TraditionalAlipayReturnPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return OriginalPage({ params: Promise.resolve({ locale: "zh-TW" }), searchParams });
}
