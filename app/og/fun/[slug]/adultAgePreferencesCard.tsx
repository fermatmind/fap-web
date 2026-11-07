import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";

const contexts = [
  { id: "OLDER_PARTNER_CONTEXT", label: { zh: "年上", en: "Older" }, color: "#16665e" },
  { id: "SIMILAR_AGE_CONTEXT", label: { zh: "同龄或同阶段", en: "Similar age or stage" }, color: "#4e4880" },
  { id: "YOUNGER_PARTNER_CONTEXT", label: { zh: "年下", en: "Younger" }, color: "#8d442d" },
] as const;

export function adultAgePreferencesCard(locale: Locale, topic: string, leaders: string[] | undefined, font: ArrayBuffer) {
  const zh = locale === "zh";
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 33, width: "100%", height: "100%", padding: 64, background: "#f6f4f0", color: "#1c2633", fontFamily: "FunNoto" }}>
      <div style={{ display: "flex", fontSize: 25, color: "#475569" }}>FermatMind</div>
      <div style={{ display: "flex", fontSize: 58 }}>{topic}</div>
      <div style={{ display: "flex", fontSize: 27, color: "#475569" }}>
        {leaders ? (leaders.length === 3 ? (zh ? "三项并列" : "Three-way tie") : leaders.length === 2 ? (zh ? "两项并列最高" : "Two contexts tied for first") : (zh ? "一项选择最多" : "One context chosen most often")) : (zh ? "18 道成年伴侣情境题" : "18 situations between adult partners")}
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {contexts.map(({ id, label, color }) => {
          const highlighted = !leaders || leaders.includes(id);
          return <div key={id} style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", height: 108, borderRadius: 18, border: `2px solid ${highlighted ? color : "#d5d3cf"}`, background: highlighted ? color : "#fff", color: highlighted ? "#fff" : "#475569", fontSize: 31 }}>
            {label[locale]}
          </div>;
        })}
      </div>
      <div style={{ display: "flex", fontSize: 24, color: "#475569" }}>{leaders ? (zh ? "公开结果类别 · 不含个人答卷" : "Public result category · No personal answers") : (zh ? "免费测试 · 无需注册" : "Free quiz · No sign-up")}</div>
    </div>,
    { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } },
  );
}
