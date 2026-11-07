import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";
import { bleachPresentations, bleachPresentation, bleachPortraitPath } from "@/lib/questionnaires/bleachPresentation";

/** Validated public identities only; personal answers and counts are never accepted. */
export async function bleachOpenGraphCard(locale: Locale, id: string | undefined, font: ArrayBuffer) {
  const zh = locale === "zh", person = id ? bleachPresentation(id) : undefined;
  const selected = person && id ? [id] : Object.keys(bleachPresentations);
  const sources = Object.fromEntries(await Promise.all(selected.map(async key => [key, `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public", bleachPortraitPath(key)))).toString("base64")}`])));
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 48, background: "#f4eee5", color: "#202d38", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", fontSize: 25, color: "#356d70" }}>FermatMind · {zh ? "《死神》角色测试" : "BLEACH Character Quiz"}</div>
    {person && id ? <div style={{ display: "flex", alignItems: "center", gap: 44, flexGrow: 1 }}>
      {/* Original local fan illustration. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sources[id]} width={260} height={300} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 26, width: 750 }}>
        <div style={{ display: "flex", fontSize: 57, lineHeight: 1.2 }}>{person.name[locale]}</div>
        <div style={{ display: "flex", fontSize: 36, lineHeight: 1.4, color: person.accent }}>{person.conclusion[locale]}</div>
        <div style={{ display: "flex", fontSize: 25 }}>{zh ? "公开人物指南 · 完整免费" : "Public character guide · Free"}</div>
      </div>
    </div> : <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div style={{ display: "flex", fontSize: 47, marginTop: 16, marginBottom: 12 }}>{zh ? "你是《死神》中的哪个角色？" : "Which BLEACH character are you?"}</div>
      <div style={{ display: "flex", fontSize: 25, marginBottom: 22 }}>{zh ? "21道日常选择 · 七位角色 · 保留全部最高并列" : "21 everyday choices · Seven characters · Every tie kept"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>{selected.map(key => <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, width: 354, height: 104 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sources[key]} width={80} height={92} alt="" />
        <div style={{ display: "flex", width: 250, fontSize: 25, lineHeight: 1.2 }}>{bleachPresentation(key)!.name[locale]}</div>
      </div>)}</div>
    </div>}
    <div style={{ display: "flex", fontSize: 22, color: "#356d70" }}>{zh ? "非官方趣味联想 · 原创人物意象" : "Unofficial fan reading · Original fan art · For fun"}</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
