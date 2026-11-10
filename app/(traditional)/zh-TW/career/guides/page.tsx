import CareerGuidesPage, { generateMetadata as generateCareerGuidesMetadata } from "@/app/(localized)/[locale]/career/guides/page";

export const dynamic = "force-dynamic";

const params = Promise.resolve({ locale: "zh-TW" });

export function generateMetadata() {
  return generateCareerGuidesMetadata({ params });
}

export default function TraditionalCareerGuidesPage() {
  return CareerGuidesPage({ params });
}
