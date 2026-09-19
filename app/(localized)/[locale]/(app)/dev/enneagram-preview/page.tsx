import { notFound } from "next/navigation";
import { EnneagramPreview } from "./EnneagramPreview";

export const metadata = {
  title: "九型人格完整结果页 · 本地前端预览",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function EnneagramPreviewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (process.env.NODE_ENV !== "development" || locale !== "zh") notFound();
  return <EnneagramPreview />;
}
