import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { DisplayLocale } from "@/lib/i18n/locales";

export async function characterPortraitCard(slug: "chiikawa" | "cyberpunk-edgerunners", id: string, title: string, topic: string, locale: DisplayLocale, fontData: ArrayBuffer) {
  const chiikawa = slug === "chiikawa";
  // id was resolved against the published roster above, never from a free-form path.
  const artwork = await readFile(path.join(process.cwd(), "public/images/quiz-portraits", slug, `${id}-og.jpg`));
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, padding: 56, background: chiikawa ? "#eef7ef" : "#111827", color: chiikawa ? "#1d382e" : "#f8fafc", fontFamily: "FunNoto" }}>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 24 }}>
        <div style={{ display: "flex", fontSize: 25, color: chiikawa ? "#326149" : "#c4b5fd" }}>FermatMind · {locale === "zh-TW" ? "公開角色指南" : locale === "zh" ? "公开角色指南" : "Public character guide"}</div>
        <div style={{ display: "flex", fontSize: chiikawa ? 51 : 62, lineHeight: 1.15 }}>{title}</div>
        <div style={{ display: "flex", fontSize: 32, color: chiikawa ? "#326149" : "#cbd5e1" }}>{topic}</div>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders local bytes. */}
      <img src={`data:image/jpeg;base64,${artwork.toString("base64")}`} width={480} height={480} alt="" style={{ borderRadius: 24 }} />
    </div>,
    { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: fontData, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", ...(locale === "zh-TW" ? { "X-Robots-Tag": "noindex" } : {}) } },
  );
}
