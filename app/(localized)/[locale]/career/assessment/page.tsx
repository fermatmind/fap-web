import { notFound } from "next/navigation";
import { FreeAssessmentLanding, freeAssessmentMetadata } from "@/components/tests/FreeAssessmentLanding";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return freeAssessmentMetadata("career", locale);
}

export default async function CareerAssessmentPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return <FreeAssessmentLanding assessment="career" locale={locale} />;
}
