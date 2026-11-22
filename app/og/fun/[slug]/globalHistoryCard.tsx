import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { globalHistoryFilename, globalHistoryPath, globalHistoryPortraitPath } from "@/lib/entertainment/global-history/config";
import type { HistoryPerson } from "@/lib/entertainment/global-history/people";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { getHistoryResult, historyPosterCopy } from "@/lib/entertainment/global-history/result-v2";
import { CANONICAL_SITE_URL } from "@/lib/site";

export const globalHistoryCardCopy = {
  zh: { label: "费马测试 · 全球历史人物", footer: "扫码来玩 · 仅供娱乐" },
  "zh-TW": { label: "費馬測試 · 全球歷史人物", footer: "掃碼來玩 · 僅供娛樂" },
  en: { label: "FERMATMIND · HISTORICAL FIGURES", footer: "Scan to play · Just for fun" },
};

const posterFonts = new Map<string, Promise<ArrayBuffer>>();
function loadPosterFont(locale: DisplayLocale) {
  const family = locale === "zh-TW" ? "noto-sans-tc" : "noto-sans-sc";
  let font = posterFonts.get(family);
  if (!font) {
    font = readFile(path.join(process.cwd(), "public/fonts", family, "global-history-poster-700.ttf"))
      .then(bytes => Uint8Array.from(bytes).buffer);
    posterFonts.set(family, font);
  }
  return font;
}

export async function globalHistoryCard(source: HistoryPerson, locale: DisplayLocale, font: ArrayBuffer, download: boolean, poster: boolean) {
  const person = displayHistoryPerson(source, locale);
  const contentLocale = locale === "zh-TW" ? "zh" : locale;
  const result = poster ? getHistoryResult(person) : undefined;
  const [image, qr] = await Promise.all([
    readFile(path.join(process.cwd(), "public", globalHistoryPortraitPath(person.id))),
    QRCode.toDataURL(`${CANONICAL_SITE_URL}${globalHistoryPath(locale)}`, { width: result ? 192 : 136, margin: result ? 4 : 2, color: { dark: "#30251f", light: "#f8efdf" } }),
  ]);
  const name = person.name[contentLocale];
  const size = contentLocale === "zh" ? Math.min(64, Math.floor(700 / name.length)) : Math.min(57, Math.floor(1280 / name.length));
  const headers = new Headers({ "Cache-Control": "public, max-age=3600, s-maxage=86400", "X-Robots-Tag": "noindex" });
  if (download) headers.set("Content-Disposition", `attachment; filename="${globalHistoryFilename(locale, person.id)}"`);

  if (result) {
    const english = locale === "en";
    const headline = result.archetype_title[locale].replaceAll("’", "'");
    const era = `#${result.number}  /  ${result.era[locale]}`;
    const hook = result.one_line_hook[locale];
    const headlineSize = english ? Math.min(48, 2800 / headline.length) : Math.min(68, 840 / headline.length);
    const nameSize = english ? Math.min(40, 1350 / name.length) : Math.min(43, 780 / name.length);
    const personality = result.personality_benchmark;
    const iq = result.iq_benchmark;
    const accent = result.accent;
    const dark = "#101715";
    const body = "#f5eee0";
    const img = `data:image/jpeg;base64,${image.toString("base64")}`;
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", flexDirection: "column", backgroundColor: dark, color: body, fontFamily: "FunNoto" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
        <img src={img} alt="" width={900} height={900} style={{ position: "absolute", top: result.portrait ? 0 : -64, left: 0, objectFit: "cover", objectPosition: result.portrait ? "center top" : "center" }} />
        <div style={{ display: "flex", position: "absolute", top: 0, left: 0, width: 900, height: 1200, backgroundImage: "linear-gradient(180deg, rgba(16,23,21,.9) 0%, rgba(16,23,21,0) 18%, rgba(16,23,21,0) 32%, rgba(16,23,21,.87) 49%, #101715 68%)" }} />
        <div style={{ display: "flex", position: "absolute", top: 35, left: 42, right: 42, justifyContent: "space-between", alignItems: "flex-start", gap: 16, paddingBottom: 18, borderBottom: "2px solid rgba(255,255,255,.52)", fontSize: english ? 21 : 23 }}>
          <span style={{ color: accent, flexShrink: 0 }}>{historyPosterCopy.series[locale]}</span>
          <span style={{ width: english ? 418 : 458, minWidth: 0, textAlign: "right", lineHeight: 1.2 }}>{era}</span>
        </div>
        <div style={{ display: "flex", position: "absolute", top: 505, left: 52, right: 52, flexDirection: "column" }}>
          <span style={{ fontSize: headlineSize, color: accent, lineHeight: 1.07, maxWidth: 796 }}>{headline}</span>
          <span style={{ fontSize: nameSize, marginTop: 10, lineHeight: 1.16 }}>{name}</span>
          <div style={{ display: "flex", gap: 16, marginTop: 13 }}>
            {[
              [iq.has_cox_data ? historyPosterCopy.cox[locale] : historyPosterCopy.gift[locale],
                iq.has_cox_data ? String(iq.estimate.youth_corrected) : iq.cognitive_gift_tag[locale]],
              [historyPosterCopy.personality[locale], `${personality.inferred_mbti} · ${personality.title[locale]}`],
            ].map(([label, value]) => <div key={label} style={{ display: "flex", flexDirection: "column", justifyContent: "center", width: 390, minHeight: 80, padding: "8px 13px", border: "1px solid #89918a", backgroundColor: "#202a25" }}>
              <span style={{ color: accent, fontSize: 20 }}>{label}</span>
              <span style={{ fontSize: english ? 19 : 27, lineHeight: 1.18 }}>{value}</span>
            </div>)}
          </div>
          <span style={{ fontSize: english ? Math.min(27, 2750 / hook.length) : Math.min(33, 1120 / hook.length), marginTop: 14, lineHeight: 1.25 }}>{`“${hook}”`}</span>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 13, marginTop: 12, color: accent, fontSize: english ? 20 : 22 }}>
            {result.tags[locale].map(tag => <span key={tag}>{`#${tag.replaceAll(" ", "")}`}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", left: 52, right: 52, bottom: 34, justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #89918a", paddingTop: 15 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse consumes embedded images. */}
          <img src={qr} alt="" width={146} height={146} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
            <span style={{ fontSize: 22 }}>{historyPosterCopy.scan[locale]}</span>
            <span style={{ fontSize: 32, color: accent }}>FermatMind.com</span>
          </div>
        </div>
      </div>,
      { width: 900, height: 1200, fonts: [{ name: "FunNoto", data: await loadPosterFont(locale), weight: 700, style: "normal" }], headers },
    );
  }

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
