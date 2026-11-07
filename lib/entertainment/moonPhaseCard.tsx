import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";
import { moonPhasePresentations, moonPhasePresentation, moonPhaseImage } from "@/lib/questionnaires/moonPhasePresentation";

/** Public phase identities only. Answers, dates and counts are never accepted. */
export async function moonPhaseOpenGraphCard(locale: Locale, id: string | undefined, font: ArrayBuffer) {
  const zh = locale === "zh", phase = id ? moonPhasePresentation(id) : undefined;
  const selected = phase && id ? [id] : Object.keys(moonPhasePresentations);
  const sources = Object.fromEntries(await Promise.all(selected.map(async key => [key, `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public", moonPhaseImage(key)))).toString("base64")}`])));
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 46, background: "#101d36", color: "#f3e6bb", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", fontSize: 25 }}>FermatMind · {zh ? "月相测试" : "Moon Phase Personality Test"}</div>
    {phase && id ? <div style={{ display: "flex", alignItems: "center", gap: 44, flexGrow: 1 }}>
      {/* Original local phase diagram, Northern Hemisphere convention. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sources[id]} width={270} height={270} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 740 }}>
        <div style={{ display: "flex", fontSize: 60, lineHeight: 1.2 }}>{phase.name[locale]}</div>
        <div style={{ display: "flex", fontSize: 36, lineHeight: 1.4 }}>{phase.conclusion[locale]}</div>
        <div style={{ display: "flex", fontSize: 25, color: "#c1cbd5" }}>{zh ? "公开月相意象指南 · 完整免费" : "Public phase metaphor guide · Free"}</div>
      </div>
    </div> : <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div style={{ display: "flex", fontSize: 48, marginTop: 18, marginBottom: 12 }}>{zh ? "你是哪种月相？" : "What moon phase are you?"}</div>
      <div style={{ display: "flex", fontSize: 25, color: "#c1cbd5", marginBottom: 24 }}>{zh ? "24道情境题 · 八种活动节奏意象 · 保留全部最高并列" : "24 scenarios · Eight activity-pace metaphors · Every highest tie kept"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>{selected.map(key => <div key={key} style={{ display: "flex", alignItems: "center", gap: 14, width: 258, height: 132 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sources[key]} width={82} height={82} alt="" />
        <div style={{ display: "flex", width: 162, fontSize: 26, lineHeight: 1.25 }}>{moonPhasePresentation(key)!.name[locale]}</div>
      </div>)}</div>
    </div>}
    <div style={{ display: "flex", fontSize: 22, color: "#c1cbd5" }}>{zh ? "趣味意象 · 非出生月相计算 · 北半球示意方向" : "For fun · Not a birth moon calculation · Northern Hemisphere diagrams"}</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
