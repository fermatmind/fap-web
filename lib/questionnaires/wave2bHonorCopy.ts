import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ArchetypeHonorCopy } from "./archetypeHonorCardCopy";
import { dimensions } from "./wave2b-copy/dimensions";
import { relationships } from "./wave2b-copy/relationships";
import { traits } from "./wave2b-copy/traits";
import { scalars } from "./wave2b-copy/scalars";
import { getWave2bPracticeCopy, practiceCopy } from "./wave2b-copy/practice";
import { wave2bPracticeBands } from "./wave2bResult";
import { wave2bMultidimensional } from "./wave2bScope";

type LocalRow = readonly [string, string, string];
const tie: LocalRow = ["多面向/有层次/并列感|你这轮有几个面向同分，各自都能说明你这次选择的一部分。", "多面向/有層次/並列感|你這次有幾個面向同分，各自都說明了這次選擇的一部分。", "Equal Scores/Several Angles/Mixed Signals|You gave more than one dimension the same score, so each stays in view."];
const missing: LocalRow = ["资料留白/空白读数/保留选择|你这轮有效作答不足以给出读数，仍可以照自己的节奏看看解读。", "資料留白/空白分數/保留選擇|你這次的有效作答不足以產生分數，仍然能照自己的步調閱讀解說。", "Score Unavailable/Room to Pause/Optional Review|You can leave the reading blank and browse the guides at your own pace."];
const rows: Record<string, Readonly<Record<string, LocalRow>>> = { ...dimensions, ...relationships, ...traits, ...scalars };
const table = new Map(Object.entries(rows));
for (const slug of wave2bMultidimensional) {
  const authored = rows[slug];
  table.set(slug, { tied: tie, missing, ...authored });
}
for (const slug of Object.keys(scalars)) table.set(slug, { missing, ...rows[slug] });

export function getWave2bHonorCopy(slug: string, id: string, locale: DisplayLocale): ArchetypeHonorCopy {
  if (Object.hasOwn(practiceCopy, slug) && wave2bPracticeBands.some(band => band === id)) {
    return getWave2bPracticeCopy(slug as keyof typeof practiceCopy, id as (typeof wave2bPracticeBands)[number], locale);
  }
  const entries = table.get(slug);
  if (!entries || !Object.hasOwn(entries, id)) throw new Error(`Missing wave 2B honor copy: ${slug}/${id}/${locale}`);
  const [tags, soulVerdict] = entries[id][locale === "en" ? 2 : locale === "zh-TW" ? 1 : 0].split("|");
  const [first, second, third, extra] = tags.split("/");
  if (!first || !second || !third || extra !== undefined || !soulVerdict) {
    throw new Error(`Invalid wave 2B honor copy: ${slug}/${id}/${locale}`);
  }
  return { personalityTags: [first, second, third], soulVerdict };
}
