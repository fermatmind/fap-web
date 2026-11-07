import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import type { Locale } from "@/lib/i18n/locales";
import { philosopherPresentations } from "@/lib/questionnaires/philosopherPresentation";

async function artwork(id: string) {
  const bytes = await readFile(path.join(process.cwd(), "public/images/quiz-portraits/philosopher-personality-test", `${id}.svg`));
  return `data:image/svg+xml;base64,${bytes.toString("base64")}`;
}

/** All inputs are public guide identities; never accepts an answer sheet or private count. */
export async function philosopherOpenGraphCard(locale: Locale, id: string | undefined, font: ArrayBuffer) {
  const zh = locale === "zh", person = id ? philosopherPresentations[id] : undefined;
  const images = await Promise.all(Object.keys(philosopherPresentations).map(async key => [key, await artwork(key)]));
  const sources = Object.fromEntries(images);
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 48, background: "#f5efdf", color: "#30382e", fontFamily: "FunNoto" }}>
    <div style={{ display: "flex", fontSize: 24, color: "#796039" }}>FermatMind · {zh ? "哲学家思考起点" : "Philosopher starting points"}</div>
    {person && id ? <div style={{ display: "flex", alignItems: "center", gap: 44, flexGrow: 1 }}>
      {/* SVGs are original local illustrations, not remote portraits. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sources[id]} width={260} height={312} alt="" />
      <div style={{ display: "flex", flexDirection: "column", gap: 25, width: 780 }}>
        <div style={{ display: "flex", fontSize: 59, lineHeight: 1.15 }}>{person.name[locale]}</div>
        <div style={{ display: "flex", fontSize: 38, lineHeight: 1.3, color: person.accent }}>{person.conclusion[locale]}</div>
        <div style={{ display: "flex", fontSize: 27 }}>{zh ? "公开原典阅读指南 · 完整免费" : "Public primary-text reading guide · Free"}</div>
      </div>
    </div> : <div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
      <div style={{ display: "flex", fontSize: 48, marginTop: 10, marginBottom: 6 }}>{zh ? "哲学家性格测试" : "Which Philosopher Are You?"}</div>
      <div style={{ display: "flex", fontSize: 25, marginBottom: 18 }}>{zh ? "18道日常选择 · 九个阅读联想 · 保留全部并列" : "18 everyday choices · Nine reading associations · Every tie kept"}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {Object.entries(philosopherPresentations).map(([key, item]) => <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, width: 354, height: 104 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={sources[key]} width={80} height={96} alt="" />
          <div style={{ display: "flex", width: 250, fontSize: 25, lineHeight: 1.2 }}>{item.name[locale]}</div>
        </div>)}
      </div>
    </div>}
    <div style={{ display: "flex", fontSize: 21, color: "#796039" }}>{zh ? "阅读联想 · 原创人物意象 · 不鉴定历史人物性格" : "Reading associations · Imagined illustrations · Not a personality assessment"}</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }] });
}
