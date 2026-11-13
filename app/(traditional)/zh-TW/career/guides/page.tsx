import { Container } from "@/components/layout/Container";
import Link from "next/link";
import CareerGuidesPage, { generateMetadata as generateCareerGuidesMetadata } from "@/app/(localized)/[locale]/career/guides/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return generateCareerGuidesMetadata({ params });
}

export default async function TraditionalCareerGuidesPage() {
  return <>
    <Container>
      <Link href="/zh-TW/career" className="inline-flex min-h-11 items-center underline">瀏覽職涯資料庫</Link>
    </Container>
    {await CareerGuidesPage({ params })}
  </>;
}
