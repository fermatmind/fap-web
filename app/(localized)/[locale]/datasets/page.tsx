import { notFound } from "next/navigation";
import { OpenDatasetsIndex } from "@/components/marketing/OpenDatasetsIndex";

export default async function DatasetsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (locale !== "zh" && locale !== "en") notFound();
  return <OpenDatasetsIndex locale={locale} />;
}
