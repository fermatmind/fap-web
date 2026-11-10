import { ImageResponse } from "next/og";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function auraColorCard(locale: DisplayLocale, title: string, auraColor: string, font: ArrayBuffer) {
  const zh = locale === "zh", traditional = locale === "zh-TW";
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: 60, gap: 44, background: "#161126", color: "#faf5ff", fontFamily: "FunNoto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 26, flex: 1 }}>
        <div style={{ display: "flex", color: "#ddd6fe", fontSize: 27 }}>FermatMind · {traditional ? "光環顏色測驗" : zh ? "光环颜色测试" : "Aura Color Test"}</div>
        <div style={{ display: "flex", fontSize: 51, lineHeight: 1.25 }}>{title}</div>
        <div style={{ display: "flex", color: "#ddd6fe", fontSize: 25 }}>{traditional ? "公開顏色指南" : zh ? "公开颜色指南" : "Public color guide"}</div>
      </div>
      <div style={{ display: "flex", width: 430, height: 430, borderRadius: 215, backgroundImage: `radial-gradient(circle, #fff 0%, ${auraColor} 28%, #2b1b48 60%, #161126 72%)` }} />
    </div>,
    { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", ...(traditional ? { "X-Robots-Tag": "noindex" } : {}) } },
  );
}
