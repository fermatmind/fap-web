import { TraditionalCareerInterestPage, taiwanCareerInterestMetadata } from "@/components/career/TraditionalCareerInterestPage";

export function generateMetadata() {
  return taiwanCareerInterestMetadata("ac");
}

export default function Page() {
  return <TraditionalCareerInterestPage code="ac" />;
}
