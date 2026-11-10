import Link from "next/link";
import HollandPdfPage, { generateMetadata as worksheetMetadata } from "@/app/(localized)/[locale]/holland-test/pdf-download/page";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return worksheetMetadata({ params });
}

export default function TraditionalHollandPdfPage() {
  return <>
    <nav aria-label="工作表頁面語言" className="flex flex-wrap gap-4 text-sm">
      <Link href="/zh/holland-test/pdf-download" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/holland-test/pdf-download" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <HollandPdfPage params={params} />
  </>;
}
