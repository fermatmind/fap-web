import HollandPdfPage, { generateMetadata as worksheetMetadata } from "@/app/(localized)/[locale]/holland-test/pdf-download/page";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return worksheetMetadata({ params });
}

export default function TraditionalHollandPdfPage() {
  return <HollandPdfPage params={params} />;
}
