import CareerRecommendationsPage, { generateMetadata as generateRecommendationMetadata } from "@/app/(localized)/[locale]/career/recommendations/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return generateRecommendationMetadata({ params });
}

export default function TraditionalCareerRecommendationsPage() {
  return CareerRecommendationsPage({ params });
}
