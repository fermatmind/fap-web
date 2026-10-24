import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadFunQuiz } from "@/lib/entertainment/loaders";
import { findPublicPortrait } from "@/lib/entertainment/guides";

let font: Promise<ArrayBuffer> | undefined;
const localFont = () => font ??= readFile(path.join(process.cwd(), "public/fonts/noto-sans-sc/fun-700.ttf")).then(bytes => Uint8Array.from(bytes).buffer);
const colors: Record<string, string> = { nature: "#166534", fantasy: "#6d28d9", social: "#9a3412", everyday: "#155e75", relationships: "#9f1239", metaphor: "#3730a3" };

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const query = new URL(request.url).searchParams, locale = query.get("locale") ?? "en";
  if (locale !== "en" && locale !== "zh") return new Response("Image unavailable", { status: 404 });
  const quiz = await loadFunQuiz(slug);
  if (!quiz) return new Response("Image unavailable", { status: 404 });
  const portrait = query.get("portrait"), result = portrait ? findPublicPortrait(quiz, portrait) : undefined;
  if (portrait && !result) return new Response("Image unavailable", { status: 404 });
  const title = result?.title[locale] ?? quiz.seo.topic[locale], zh = locale === "zh";
  const color = colors[quiz.category] ?? colors.metaphor;
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 60, background: "#f8fafc", color: "#0f172a", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color, fontSize: 28 }}><span>FermatMind</span><span>{zh ? (result ? "公开画像指南" : "原创趣味测试") : (result ? "Public result guide" : "Original quiz")}</span></div>
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {result && <div style={{ display: "flex", fontSize: 27, color }}>{quiz.seo.topic[locale]}</div>}
      <div style={{ display: "flex", fontSize: title.length > 65 ? 48 : 60, lineHeight: 1.25 }}>{title}</div>
      <div style={{ display: "flex", gap: 12 }}><div style={{ width: 110, height: 8, background: color, borderRadius: 4 }} /><div style={{ width: 36, height: 8, background: "#cbd5e1", borderRadius: 4 }} /><div style={{ width: 16, height: 8, background: "#cbd5e1", borderRadius: 4 }} /></div>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 25, color: "#475569" }}><span>fermatmind.com</span><span>{zh ? "完整内容免费 · 仅供娱乐" : "Full content free · Just for fun"}</span></div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: await localFont(), weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
