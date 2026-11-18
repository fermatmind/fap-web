import { FreeAssessmentLanding, freeAssessmentMetadata } from "@/components/tests/FreeAssessmentLanding";

export function generateMetadata() {
  return freeAssessmentMetadata("career", "zh-TW");
}

export default function TraditionalCareerAssessmentPage() {
  return <FreeAssessmentLanding assessment="career" locale="zh-TW" />;
}
