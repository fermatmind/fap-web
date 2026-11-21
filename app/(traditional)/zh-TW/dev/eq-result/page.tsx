import Preview from "@/app/(localized)/[locale]/(app)/dev/eq-result/page";
import { generateMetadata as metadataForLocale } from "@/app/(localized)/[locale]/(app)/dev/eq-result/page";
export const dynamic = "force-dynamic";
export function generateMetadata() { return metadataForLocale({ params: Promise.resolve({ locale: "zh-TW" }) }); }
export default function TraditionalPreview({ searchParams }: { searchParams: Promise<{ result?: string }> }) {
  return Preview({ params: Promise.resolve({ locale: "zh-TW" }), searchParams });
}
