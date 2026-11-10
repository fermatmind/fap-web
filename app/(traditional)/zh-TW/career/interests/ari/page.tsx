import { TraditionalCareerInterestPage, taiwanCareerInterestMetadata } from "@/components/career/TraditionalCareerInterestPage";

export function generateMetadata() {
  return taiwanCareerInterestMetadata("ari");
}

export default function Page() {
  return <TraditionalCareerInterestPage code="ari" />;
}
