import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerAssessmentForm } from "../CareerAssessmentForm";

type Props = { params: Promise<{ locale: string }> };

function title(locale: string) {
  return locale === "zh" ? "费马职业测试（94 题）" : "FermatMind Career Assessment (94 questions)";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: title(locale), robots: { index: false, follow: true } };
}

export default async function CareerAssessmentPage({ params }: Props) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return (
    <main className="mx-auto w-full max-w-5xl px-[var(--fm-container-gutter)] has-[[data-testid=career-assessment-result]]:max-w-none has-[[data-testid=career-assessment-result]]:px-0">
      <CareerAssessmentForm locale={locale} />
    </main>
  );
}
