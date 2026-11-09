import PersonalityPage, { generateMetadata as generatePersonalityMetadata } from "@/app/(localized)/[locale]/personality/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return generatePersonalityMetadata({ params });
}

export default function TraditionalPersonalityPage() {
  return PersonalityPage({ params });
}
