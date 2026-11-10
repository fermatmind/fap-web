import Link from "next/link";
import CareerGuidesPage, { generateMetadata as generateCareerGuidesMetadata } from "@/app/(localized)/[locale]/career/guides/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return generateCareerGuidesMetadata({ params });
}

export default async function TraditionalCareerGuidesPage() {
  return <>
    <Link href="/zh-TW/career" className="inline-flex min-h-11 items-center underline">瀏覽職涯資料庫</Link>
    {await CareerGuidesPage({ params })}
  </>;
}
