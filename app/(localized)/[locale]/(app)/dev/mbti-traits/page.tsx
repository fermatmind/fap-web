import { notFound } from "next/navigation";
import { parseMbtiTraitCatalog } from "@/lib/cms/mbti-trait-explanations";
import { TraitPreview } from "./trait-preview";

export const metadata = { title: "MBTI 维度文案本地预览", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  if (process.env.NODE_ENV !== "development" || (await params).locale !== "zh") notFound();
  // Loopback only: no user-controlled destination, auth tokens or production report data.
  const catalog = await fetch("http://127.0.0.1:8001/api/v0.5/personality/mbti/trait-explanations?locale=zh-CN", { cache: "no-store" })
    .then(async (response) => response.ok ? parseMbtiTraitCatalog(await response.json()) : null)
    .catch(() => null);
  if (!catalog) return <p role="alert">本地后端内容不可用。请确认本地数据库已导入文案，后端运行在8001端口。</p>;
  return <TraitPreview catalog={catalog} />;
}
