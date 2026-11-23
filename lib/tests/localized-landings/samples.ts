import { hollandReportSamples } from "../hollandLanding";
import { loadTrioSamples, type Sample } from "../trioLanding";
import type { LocalizedLandingKind, LocalizedLandingLocale, LocalizedLandingProfile } from "./types";

const samplePaths: Record<LocalizedLandingKind, string> = {
  mbti: "/reports/samples/mbti", holland: "/reports/samples/holland",
  career: "/reports/samples/career94", big5: "/reports/samples/big5", iq: "/reports/samples/iq30",
  enneagram: "/reports/samples/enneagram", jung: "/reports/samples/archetypes",
  disc: "/reports/samples/disc", eq: "/reports/samples/eq",
};

export const localizedSamplePath = (kind: LocalizedLandingKind, locale: LocalizedLandingLocale) =>
  `/${kind === "career" && locale === "zh-TW" ? "zh" : locale}${samplePaths[kind]}`;

const facetLabels: Record<string, readonly [string, string]> = {
  E2: ["Gregariousness", "合群性"], E3: ["Assertiveness", "主動表達"], E5: ["Excitement-seeking", "尋求刺激"],
  C2: ["Orderliness", "條理性"], C3: ["Dutifulness", "責任感"], C5: ["Self-discipline", "自律"],
};

const archetypeKeys = ["hero", "sage", "explorer", "creator", "ruler", "caregiver", "magician", "lover", "jester", "everyperson", "innocent", "rebel"];

export async function loadLocalizedSamples(kind: LocalizedLandingKind, locale: LocalizedLandingLocale, profile: LocalizedLandingProfile): Promise<Sample[]> {
  const en = locale === "en";
  if (kind === "holland") return hollandReportSamples.map(({code, dimensions, gap}, i) => ({
    label: profile.sampleLabels[i], caption: `${code} · ${en ? "First-to-second gap" : "前兩名分差"} ${gap}`,
    note: profile.sampleNotes[i], rows: dimensions.map(({code, score}) => ({
      key: code, name: profile.cards.find(card => card[0] === code)?.[1] ?? code, value: score,
    })),
  }));
  if (kind === "career" || kind === "mbti") return [];
  const samples = await loadTrioSamples(kind, locale);
  return samples.map((sample, i) => {
    const iqIndex = kind === "iq" ? sample.url?.endsWith("iq40") ? 2 : sample.url ? 1 : 0 : i;
    const url = sample.url
      ? kind === "jung" ? localizedSamplePath(kind, locale) : sample.url.replace(/^\/zh(?=\/)/u, `/${locale}`)
      : undefined;
    const eqFallback = kind === "eq" && i === 0 && !url;
    const label = eqFallback ? (en ? "Awareness example" : "覺察練習示意") : profile.sampleLabels[iqIndex] ?? profile.name;
    const note = eqFallback
      ? (en ? "Illustration. These scores are on a 0–100 scale. The public sample is temporarily unavailable." : "示意資料，採 0–100 量尺。公開報告範例目前無法載入。")
      : profile.sampleNotes[iqIndex] ?? "";
    return {
      ...sample, url, label, caption: label, note,
      rows: sample.rows.map(row => {
        const key = row.key;
        const name = kind === "jung" ? (profile.cards[archetypeKeys.indexOf(key)]?.[1] ?? key)
          : kind === "enneagram" ? (en ? `Type ${key}` : `${key} 型`)
          : facetLabels[key]?.[en ? 0 : 1] ?? profile.cards.find(card => card[0].toUpperCase() === key)?.[1] ?? key;
        return {...row, name};
      }),
    };
  });
}
