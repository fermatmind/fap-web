import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { chapterHobbyLens, chapterHobbyLenses } from "@/lib/questionnaires/spaceMarineChapters";

/** Public source profile only; personal counts are never accepted by this endpoint. */
export async function spaceMarineChapterCard(profiles: QuestionnaireProfile[], locale: Locale, font: ArrayBuffer, id?: string, traditional = false) {
  const profile = id ? profiles.find(p => p.id === id) : undefined;
  if (id && (!profile || !chapterHobbyLens(id))) return new Response("Image unavailable", {status: 404});
  const selected = profile ? [profile] : profiles.filter(p => Object.hasOwn(chapterHobbyLenses, p.id));
  const pictures = await Promise.all(selected.map(async p => {
    const bytes = await readFile(path.join(process.cwd(), "public/images/quiz-portraits/space-marine-chapter", `${p.id}-studio.jpg`));
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  }));
  const zh = locale === "zh";
  return new ImageResponse(<div style={{display: "flex", width: "100%", height: "100%", background: "#0f172a", color: "#f8fafc", padding: 48, gap: 36, fontFamily: "FunNoto"}}>
    <div style={{display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640}}>
      <div style={{display: "flex", fontSize: 24, color: "#cbd5e1"}}>FermatMind · {traditional ? "星際戰士戰團測驗" : zh ? "星际战士战团测试" : "Space Marine Chapter Test"}</div>
      <div style={{display: "flex", fontSize: 50, lineHeight: 1.2}}>{profile?.title[locale] ?? (traditional ? "六個戰團主題，你最常選擇哪種愛好視角？" : zh ? "六个战团主题，哪种爱好视角选得最多？" : "Which Chapter hobby lens do you choose most?")}</div>
      <div style={{display: "flex", fontSize: 31, lineHeight: 1.4}}>{profile?.headline[locale] ?? (traditional ? "18 道紙模型情境 · 保留最高並列 · 免費完整指南" : zh ? "18道纸模情境 · 所有最高并列 · 免费完整指南" : "18 paper-model choices · Every highest tie · Full guides free")}</div>
      <div style={{display: "flex", fontSize: 24, color: "#cbd5e1"}}>{traditional ? "公開紙模型愛好指南 · 非官方原創" : zh ? "公开纸模爱好指南 · 非官方原创" : "Public paper-model hobby guide · Unofficial"}</div>
      <div style={{display: "flex", fontSize: 21, color: "#94a3b8"}}>fermatmind.com</div>
    </div>
    {/* Original generated illustration. The identity is resolved from the fixed public roster. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    {profile ? <img src={pictures[0]} width={420} height={420} alt="" style={{alignSelf: "center", borderRadius: 20}} /> : <div style={{display: "flex", flexWrap: "wrap", gap: 12, width: 420, alignSelf: "center"}}>{pictures.map((src, i) =>
      // eslint-disable-next-line @next/next/no-img-element
      <img key={selected[i].id} src={src} width={132} height={132} alt="" style={{borderRadius: 10}} />
    )}</div>}
  </div>, {width: 1200, height: 630, fonts: [{name: "FunNoto", data: font, weight: 700, style: "normal"}], headers: {"Cache-Control": "public, max-age=3600, s-maxage=86400", ...(traditional ? {"X-Robots-Tag": "noindex"} : {})}});
}
