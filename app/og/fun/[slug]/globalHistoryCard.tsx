import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { globalHistoryFilename, globalHistoryPath, globalHistoryPortraitPath } from "@/lib/entertainment/global-history/config";
import type { HistoryPerson } from "@/lib/entertainment/global-history/people";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { CANONICAL_SITE_URL } from "@/lib/site";

export const globalHistoryCardCopy = {
  zh: { label: "费马测试 · 全球历史人物", footer: "扫码来玩 · 仅供娱乐" },
  "zh-TW": { label: "費馬測試 · 全球歷史人物", footer: "掃碼來玩 · 僅供娛樂" },
  en: { label: "FERMATMIND · HISTORICAL FIGURES", footer: "Scan to play · Just for fun" },
};

export async function globalHistoryCard(source: HistoryPerson, locale: DisplayLocale, font: ArrayBuffer, download: boolean) {
  const person = displayHistoryPerson(source, locale);
  const contentLocale = locale === "zh-TW" ? "zh" : locale;
  const [image, qr] = await Promise.all([
    readFile(path.join(process.cwd(), "public", globalHistoryPortraitPath(person.id))),
    QRCode.toDataURL(`${CANONICAL_SITE_URL}${globalHistoryPath(locale)}`, { width: 136, margin: 2, color: { dark: "#30251f", light: "#f8efdf" } }),
  ]);
  const name = person.name[contentLocale];
  const size = contentLocale === "zh" ? Math.min(64, Math.floor(700 / name.length)) : Math.min(57, Math.floor(1280 / name.length));
  const headers = new Headers({ "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" });
  if (download) headers.set("Content-Disposition", `attachment; filename="${globalHistoryFilename(locale, person.id)}"`);

  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 52, background: "#f8efdf", color: "#30251f", fontFamily: "FunNoto" }}>
      <div style={{ display: "flex", fontSize: 25, color: "#8a3828", marginBottom: 20, letterSpacing: 1 }}>{globalHistoryCardCopy[locale].label}</div>
      {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
      <img src={`data:image/jpeg;base64,${image.toString("base64")}`} alt="" width={720} height={720} style={{ borderRadius: 10 }} />
      <div style={{ display: "flex", marginTop: 12, fontSize: size, textAlign: "center" }}>{name}</div>
      <div style={{ display: "flex", fontSize: 24, textAlign: "center", color: "#8a3828", marginBottom: 14 }}>
        {`${person.region[contentLocale]} · ${person.field[contentLocale]}`}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 720, borderTop: "1px solid #c7ae8b", paddingTop: 13 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 26 }}>{globalHistoryCardCopy[locale].footer}</span>
          <span style={{ fontSize: 20, color: "#675445" }}>fermatmind.com</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
        <img src={qr} alt="" width={120} height={120} />
      </div>
    </div>,
    { width: 840, height: 1200, fonts: [{ name: "FunNoto", data: font, weight: 700, style: "normal" }], headers },
  );
}
