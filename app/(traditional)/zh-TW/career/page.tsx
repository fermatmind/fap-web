import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import CareerPage from "@/app/(localized)/[locale]/career/page";
import { isConfiguredStagingSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "職涯資料庫",
  description: "瀏覽 FermatMind 職涯資料庫，按產業篩選，查看已開放的職業詳情。",
  alternates: { canonical: "/zh-TW/career" },
  robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function TraditionalCareerDirectory({ searchParams }: Props) {
  return (
    <>
      <Container as="nav" aria-label="職涯資源" className="flex flex-wrap gap-5 pt-6 text-sm">
        <Link href="/zh-TW/career/interests/ari" className="min-h-11 py-2 underline">ARI 興趣代碼</Link>
        <Link href="/zh-TW/career/interests/ac" className="min-h-11 py-2 underline">AC 興趣代碼</Link>
        <Link href="/zh-TW/career/recommendations" className="min-h-11 py-2 underline">MBTI 職涯建議</Link>
        <Link href="/zh-TW/career/guides" className="min-h-11 py-2 underline">職涯指南</Link>
      </Container>
      {await CareerPage({ params: Promise.resolve({ locale: "zh-TW" }), searchParams })}
    </>
  );
}
