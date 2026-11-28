export const dynamic = "force-dynamic";
import ComparisonPage, { generateMetadata as comparisonMetadata } from "@/app/(localized)/[locale]/career-compare/[pair]/page";
type Props = {
  params: Promise<{ pair: string }>;
  searchParams?: Parameters<typeof ComparisonPage>[0]["searchParams"];
};
const withLocale = async (params: Props["params"]) => ({ ...await params, locale: "zh-TW" });
export async function generateMetadata({ params }: Props) { return comparisonMetadata({ params: withLocale(params) }); }
export default async function Page({ params, searchParams }: Props) {
  return ComparisonPage({ params: withLocale(params), searchParams });
}
