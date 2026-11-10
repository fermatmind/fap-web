import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";

/** Only trusted package/profile identities reach local artwork. No answer or personal score is accepted. */
export async function fantasyOpenGraphCard(quiz: Questionnaire, locale: Locale, id: string | undefined, font: ArrayBuffer, traditional = false) {
  const selected = id ? quiz.profiles.filter(p => p.id === id) : quiz.profiles.length <= 4 ? quiz.profiles : quiz.profiles.slice(0, 3);
  const images = await Promise.all(selected.map(async p => `data:image/svg+xml;base64,${(await readFile(path.join(process.cwd(), "public/images/quiz-portraits", quiz.slug, `${p.id}.svg`))).toString("base64")}`));
  return new ImageResponse(<div style={{ display: "flex", flexDirection: "column", padding: 48, width: "100%", height: "100%", background: "#111e30", color: "#f4eee2", fontFamily: "FantasyNoto" }}>
    <div style={{ display: "flex", color: "#dbbf83", fontSize: 26 }}>FermatMind · {traditional ? "原創娛樂測驗" : locale === "zh" ? "原创娱乐测试" : "Original entertainment quiz"}</div>
    <div style={{ display: "flex", marginTop: 24, fontSize: 48 }}>{id ? selected[0].title[locale] : quiz.title[locale]}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 24, flexGrow: 1 }}>{selected.map((p, i) => <div key={p.id} style={{ display: "flex", alignItems: "center", flexDirection: "column", gap: 14 }}>
      {/* Local original vector artwork needs no image optimizer in Satori. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img alt="" src={images[i]} width={id ? 230 : 190} height={id ? 230 : 190} />
      {!id && <div style={{ display: "flex", fontSize: 28 }}>{p.title[locale]}</div>}
    </div>)}{id && <div style={{ display: "flex", fontSize: 36, lineHeight: 1.5, width: 720 }}>{selected[0].headline[locale]}</div>}</div>
    <div style={{ display: "flex", fontSize: 23, marginTop: 20, color: "#dbbf83" }}>{id ? (traditional ? "公開完整指南 · 不含個人答案" : locale === "zh" ? "公开完整指南 · 不含个人答案" : "Complete public guide · No personal answers") : (traditional ? `${quiz.questions.length} 題原創題 · 完整結果免費` : locale === "zh" ? `${quiz.questions.length}道原创题 · 完整结果免费` : `${quiz.questions.length} original questions · Complete results, free`)}</div>
  </div>, { width: 1200, height: 630, fonts: [{ name: "FantasyNoto", data: font, weight: 700, style: "normal" }], headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400", ...(traditional ? { "X-Robots-Tag": "noindex" } : {}) } });
}
