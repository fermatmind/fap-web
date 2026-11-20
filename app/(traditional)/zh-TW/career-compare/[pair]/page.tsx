export const dynamic = "force-dynamic";
import ComparisonPage, { generateMetadata as comparisonMetadata } from "@/app/(localized)/[locale]/career-compare/[pair]/page";
type Props = { params: Promise<{ pair: string }> };
const withLocale = async (params: Props["params"]) => ({ ...await params, locale: "zh-TW" });
export async function generateMetadata({ params }: Props) { return comparisonMetadata({ params: withLocale(params) }); }
export default async function Page({ params }: Props) { return ComparisonPage({ params: withLocale(params) }); }
