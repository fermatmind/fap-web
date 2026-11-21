import Preview from "@/app/(localized)/[locale]/(app)/dev/mainstream-unlock/page";
import { generateMetadata as metadataForLocale } from "@/app/(localized)/[locale]/(app)/dev/mainstream-unlock/page";
export const dynamic = "force-dynamic";
export function generateMetadata() { return metadataForLocale({ params: Promise.resolve({ locale: "zh-TW" }) }); }
export default function TraditionalPreview({ searchParams }: { searchParams: Promise<{ form?: string; lang?: string; result?: string }> }) {
  return Preview({ params: Promise.resolve({ locale: "zh-TW" }), searchParams });
}
