import { apiClient } from "@/lib/api-client";

export const MBTI_TRAIT_AXES = ["EI", "SN", "TF", "JP", "AT"] as const;
export type MbtiTraitAxis = typeof MBTI_TRAIT_AXES[number];
export type MbtiTraitEntry = {
  axis_code: MbtiTraitAxis;
  pole: string;
  min: number;
  max: number;
  a: string;
  b: string;
};
export type MbtiTraitCatalog = {
  schema: "mbti_trait_explanations.v1";
  locale: "zh-CN";
  revision: number;
  content_hash: string;
  entries: MbtiTraitEntry[];
  overviews: Array<{ full_code: string; paragraphs: [string, string] }>;
};

export function parseMbtiTraitCatalog(value: unknown): MbtiTraitCatalog | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  if (input.ok !== true || input.schema !== "mbti_trait_explanations.v1" || input.locale !== "zh-CN"
    || input.revision !== 1 || typeof input.content_hash !== "string" || !/^[a-f0-9]{64}$/.test(input.content_hash)
    || !Array.isArray(input.entries) || input.entries.length !== 55) return null;
  const entries: MbtiTraitEntry[] = [];
  for (const raw of input.entries) {
    if (!raw || typeof raw !== "object") return null;
    const entry = raw as Record<string, unknown>;
    if (!MBTI_TRAIT_AXES.includes(entry.axis_code as MbtiTraitAxis)
      || typeof entry.pole !== "string" || typeof entry.min !== "number" || typeof entry.max !== "number"
      || !Number.isInteger(entry.min) || !Number.isInteger(entry.max) || entry.min > entry.max
      || typeof entry.a !== "string" || !entry.a.trim() || typeof entry.b !== "string" || !entry.b.trim()) return null;
    entries.push({ axis_code: entry.axis_code as MbtiTraitAxis, pole: entry.pole, min: entry.min, max: entry.max, a: entry.a, b: entry.b });
  }
  // Validate complete, non-overlapping coverage; the backend owns the actual cut points.
  for (const axis of MBTI_TRAIT_AXES) {
    const axisEntries = entries.filter((entry) => entry.axis_code === axis);
    const balanced = axisEntries.filter((entry) => entry.pole === "balanced");
    if (axisEntries.length !== 11 || balanced.length !== 1 || balanced[0].min !== 50 || balanced[0].max !== 50) return null;
    for (const pole of axis) {
      const bands = axisEntries.filter((entry) => entry.pole === pole).sort((a, b) => a.min - b.min);
      let next = 51;
      if (bands.length !== 5) return null;
      for (const band of bands) {
        if (band.min !== next || band.max > 100) return null;
        next = band.max + 1;
      }
      if (next !== 101) return null;
    }
  }
  if (!Array.isArray(input.overviews) || input.overviews.length !== 32) return null;
  const seen = new Set<string>();
  const overviews: MbtiTraitCatalog["overviews"] = [];
  for (const row of input.overviews) {
    if (!row || typeof row.full_code !== "string" || !/^[EI][SN][TF][JP]-[AT]$/.test(row.full_code)
      || seen.has(row.full_code) || !Array.isArray(row.paragraphs) || row.paragraphs.length !== 2
      || !row.paragraphs.every((text: unknown) => typeof text === "string" && text.trim())) return null;
    seen.add(row.full_code);
    overviews.push({ full_code: row.full_code, paragraphs: row.paragraphs as [string, string] });
  }
  return { schema: input.schema, locale: input.locale, revision: input.revision, content_hash: input.content_hash, entries, overviews };
}

export function selectMbtiTraitEntry(catalog: MbtiTraitCatalog | null, axis: string, pole: string, score: unknown): MbtiTraitEntry | null {
  if (!catalog || !MBTI_TRAIT_AXES.includes(axis as MbtiTraitAxis) || !axis.includes(pole) || pole.length !== 1
    || typeof score !== "number" || !Number.isFinite(score) || score < 50 || score > 100) return null;
  // This is the displayed dominant-side percentage, never a percentile or raw first-pole score.
  const percent = Math.round(score);
  return catalog.entries.find((entry) => entry.axis_code === axis && entry.pole === (percent === 50 ? "balanced" : pole)
    && percent >= entry.min && percent <= entry.max) ?? null;
}

export async function fetchMbtiTraitCatalog(signal?: AbortSignal): Promise<MbtiTraitCatalog | null> {
  const value = await apiClient.get<unknown>("/v0.5/personality/mbti/trait-explanations?locale=zh-CN", {
    locale: "zh", skipAuth: true, cache: "no-store", signal,
  });
  return parseMbtiTraitCatalog(value);
}
