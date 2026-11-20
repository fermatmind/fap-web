export const dynamic = "force-dynamic";
import ComparisonIndex from "@/app/(localized)/[locale]/career-compare/page";
export { metadata } from "@/app/(localized)/[locale]/career-compare/page";
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  return ComparisonIndex({ params: Promise.resolve({ locale: "zh-TW" }), searchParams });
}
