import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { CHANGAN_SLUG, changanPortraitPath } from "@/lib/entertainment/changan";
import { quizPath } from "@/lib/entertainment/guides";
import type { FunResult } from "@/lib/entertainment/types";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { CANONICAL_SITE_URL } from "@/lib/site";

export async function changanCardResponse(portrait: FunResult, displayLocale: DisplayLocale, font: ArrayBuffer, download: boolean) {
  const traditional = displayLocale === "zh-TW";
  const locale = traditional ? "zh" : displayLocale;
  const zh = locale === "zh";
  const [image, qr] = await Promise.all([
    readFile(path.join(process.cwd(), "public", changanPortraitPath(portrait.id))),
    QRCode.toDataURL(`${CANONICAL_SITE_URL}${quizPath(displayLocale, CHANGAN_SLUG)}`, { width: 140, margin: 2, color: { dark: "#322820", light: "#f5ead3" } }),
  ]);
  const headers = new Headers({ "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" });
  if (download) headers.set("Content-Disposition", `attachment; filename="fermatmind-changan-${portrait.id}-${displayLocale}.png"`);

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 48, background: "#f5ead3", color: "#322820", fontFamily: "FunNoto" }}>
      <div style={{ display: "flex", fontSize: 28, color: "#873727", marginBottom: 16 }}>{traditional ? "費馬測試 · 長安卷" : zh ? "费马测试 · 长安卷" : "FERMATMIND · CHANG’AN"}</div>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
      <img src={`data:image/jpeg;base64,${image.toString("base64")}`} alt="" width={720} height={720} style={{ borderRadius: 8 }} />
      <div style={{ display: "flex", fontSize: zh ? 74 : 58, marginTop: 8 }}>{portrait.title[locale]}</div>
      <div style={{ display: "flex", fontSize: 29, color: "#873727" }}>{portrait.epithet?.[locale]}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 720, marginTop: 14, borderTop: "1px solid #b39c75" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 23 }}>
          <span>{traditional ? "你的性格最像哪位歷史人物？" : zh ? "你的性格最像哪位历史人物？" : "Which historical figure are you most like?"}</span>
          <span style={{ color: "#695444", fontSize: 20, marginTop: 8 }}>{traditional ? "掃描 QR Code 開始遊玩 · 僅供娛樂" : zh ? "扫码来玩 · 仅供娱乐" : "Scan to play · Just for fun"} · fermatmind.com</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
        <img src={qr} alt="" width={132} height={132} />
      </div>
    </div>,
    { width: 840, height: 1200, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers },
  );
}
