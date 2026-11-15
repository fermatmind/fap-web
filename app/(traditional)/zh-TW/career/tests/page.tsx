import CareerTestsPage, { generateMetadata as careerTestsMetadata } from "@/app/(localized)/[locale]/career/tests/page";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return careerTestsMetadata({ params });
}

export default function TraditionalCareerTestsPage() {
  return CareerTestsPage({ params });
}
