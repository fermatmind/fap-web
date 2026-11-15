import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import CareerRecommendationsPage, { generateMetadata as generateRecommendationMetadata } from "@/app/(localized)/[locale]/career/recommendations/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export async function generateMetadata() {
  return traditionalSearchMetadata("/zh-TW/career/recommendations", await generateRecommendationMetadata({ params }));
}

export default function TraditionalCareerRecommendationsPage() {
  return CareerRecommendationsPage({ params });
}
