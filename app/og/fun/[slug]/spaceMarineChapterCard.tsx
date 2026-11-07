import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { chapterHobbyLens } from "@/lib/questionnaires/spaceMarineChapters";

export function spaceMarineChapterCard(profile: QuestionnaireProfile, locale: Locale, font: ArrayBuffer) {
  const lens = chapterHobbyLens(profile.id)!;
  const zh = locale === "zh";
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", background: "#0f172a", color: "#f8fafc", padding: 60, gap: 48, fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", fontSize: 25, color: "#cbd5e1" }}>FermatMind · {zh ? "星际战士战团测试" : "Space Marine Chapter Test"}</div>
      <div style={{ display: "flex", fontSize: 58, lineHeight: 1.2 }}>{profile.title[locale]}</div>
      <div style={{ display: "flex", fontSize: 32, lineHeight: 1.4 }}>{profile.headline[locale]}</div>
      <div style={{ display: "flex", fontSize: 23, color: "#cbd5e1" }}>{zh ? "非官方原创娱乐测验" : "Unofficial original hobby quiz"}</div>
      <div style={{ display: "flex", fontSize: 21, color: "#94a3b8" }}>fermatmind.com</div>
    </div>
    <div style={{ display: "flex", width: 300, height: 400, alignSelf: "center", alignItems: "center", justifyContent: "center", background: "#e2e8f0", borderRadius: 24, borderBottom: `18px solid ${lens.color}` }}>
      <svg width="260" height="290" viewBox="0 0 260 290" fill="none" stroke={lens.color} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round">
        {lens.mark === "plan" && <><path d="M50 35h160v220H50Z" /><path d="m75 85 12 12 24-25m13 18h60M75 140h110M75 185h110M75 220h65" /></>}
        {lens.mark === "base" && <><path d="m30 235 100-30 100 30-100 25ZM65 223V115l65-25 65 25v108M65 115l65 25 65-25M130 140v65M90 105V65l40-15 40 15v40" /></>}
        {lens.mark === "joint" && <><path d="M30 90h90v40h40v-40h70v110h-70v-40h-40v40H30ZM75 60v-20m110 20v-20M75 230v20m110-20v20" /><path d="M130 110v70" strokeDasharray="8 12" /></>}
        {lens.mark === "texture" && <><path d="m35 75 160-30 30 170-160 30Z" /><path d="m75 100 35-7m20-4 35-7m-80 55 35-7m20-4 35-7m-80 55 35-7m20-4 35-7m-80 55 35-7m20-4 35-7" /></>}
        {lens.mark === "detail" && <><circle cx="110" cy="120" r="65" /><path d="m160 170 65 65M85 120h50m-25-25v50M30 225h80m-60 25h60" /><circle cx="110" cy="120" r="30" strokeDasharray="5 12" /></>}
        {lens.mark === "route" && <><path d="m35 80 65-30 60 30 65-30v190l-65 30-60-30-65 30ZM100 50v190m60-160v190" /><path d="M55 190c80-10 45-100 140-75m-20-20 25 20-25 20" /></>}
      </svg>
    </div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
