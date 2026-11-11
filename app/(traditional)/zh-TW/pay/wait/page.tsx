import OriginalPage from "@/app/(localized)/[locale]/pay/wait/page";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata = {
  title: "訂單狀態",
  robots: NOINDEX_ROBOTS,
  referrer: "no-referrer",
};

export default function TraditionalOrderPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return OriginalPage({ params: Promise.resolve({ locale: "zh-TW" }), searchParams });
}
