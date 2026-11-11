import CareerMbtiRecommendationPage, { generateMetadata as generateRecommendationMetadata } from "@/app/(localized)/[locale]/career/recommendations/mbti/[type]/page";

export const dynamic = "force-dynamic";

type Params = Promise<{ type: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({ params }: { params: Params }) {
  const { type } = await params;
  return generateRecommendationMetadata({ params: Promise.resolve({ locale: "zh-TW", type }) });
}

export default async function TraditionalCareerMbtiRecommendationPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { type } = await params;
  return CareerMbtiRecommendationPage({ params: Promise.resolve({ locale: "zh-TW", type }), searchParams });
}
