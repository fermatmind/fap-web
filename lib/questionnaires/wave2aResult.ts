import type { DisplayLocale } from "@/lib/i18n/locales";
import type { DirectionalResult } from "./basicScoring";
import type { Questionnaire } from "./types";

export const wave2aTitles = {
  "adult-age-preferences": { zh: "年上年下恋爱倾向", "zh-TW": "年上年下戀愛傾向", en: "Dating Age Preferences" },
  "response-color": { zh: "色彩性格", "zh-TW": "色彩性格", en: "Response Color" },
  "love-personality": { zh: "恋爱人格", "zh-TW": "戀愛人格", en: "Love Personality" },
  "relationship-values": { zh: "爱情阵营", "zh-TW": "愛情陣營", en: "Relationship Values" },
  "likable-person-test": { zh: "讨人喜欢测试", "zh-TW": "討人喜歡測驗", en: "Likable Person Quiz" },
  "chiikawa": { zh: "吉伊卡哇", "zh-TW": "吉伊卡哇", en: "Chiikawa" },
  "gta-6-character-quiz": { zh: "GTA 6 角色", "zh-TW": "GTA 6 角色", en: "GTA 6 Characters" },
  "philosopher-personality-test": { zh: "哲学家性格", "zh-TW": "哲學家性格", en: "Philosopher Quiz" },
  "love-type-16": { zh: "爱情类型 16", "zh-TW": "愛情類型 16", en: "Love Type 16" },
  "mental-age": { zh: "心理年龄", "zh-TW": "心理年齡", en: "Mental Age" },
} as const;
export type Wave2aSlug = keyof typeof wave2aTitles;

const resultVariants = {
  "adult-age-preferences": { theme: "dusk", target: "EQ_60" },
  "response-color": { theme: "dusk", target: "BIG5_OCEAN" },
  "love-personality": { theme: "dusk", target: "EQ_60" },
  "relationship-values": { theme: "gold", target: "EQ_60" },
  "likable-person-test": { theme: "slate", target: "BIG5_OCEAN" },
  "chiikawa": { theme: "dusk", target: "MBTI" },
  "gta-6-character-quiz": { theme: "neon", target: "MBTI" },
  "philosopher-personality-test": { theme: "gold", target: "BIG5_OCEAN" },
  "love-type-16": { theme: "dusk", target: "EQ_60" },
  "mental-age": { theme: "gold", target: "BIG5_OCEAN" },
} as const satisfies Record<Wave2aSlug, unknown>;

export function wave2aVariant(slug: string, locale: DisplayLocale) {
  if (!Object.hasOwn(resultVariants, slug) || (slug === "chiikawa" && locale !== "zh-TW")) return;
  return resultVariants[slug as Wave2aSlug];
}

export function directionalResultLabels(quiz: Questionnaire, result: Extract<DirectionalResult, { status: "complete" }>, locale: DisplayLocale, translate: (value: string) => string) {
  const adult = quiz.slug === "adult-age-preferences";
  const ageLabels: Record<string, Record<DisplayLocale, string>> = {
    OLDER_PARTNER_CONTEXT: { zh: "年上情境", "zh-TW": "年上情境", en: "Older partner" },
    SIMILAR_AGE_CONTEXT: { zh: "同龄情境", "zh-TW": "同齡情境", en: "Similar life stage" },
    YOUNGER_PARTNER_CONTEXT: { zh: "年下情境", "zh-TW": "年下情境", en: "Younger partner" },
  };
  function label(id: string) {
    if (adult) return ageLabels[id][locale];
    const title = quiz.directions.find(direction => direction.id === id)!.title;
    return locale === "en" ? title.en : translate(title.zh);
  }
  const next = quiz.directions.filter(direction => !result.leaders.includes(direction.id));
  const nextCount = Math.max(...next.map(direction => result.counts[direction.id]));
  const runners = next.filter(direction => result.counts[direction.id] === nextCount);
  const runnerUp = result.leaders.length === 1 && nextCount > 0 && runners.length === 1 ? label(runners[0].id) : undefined;
  return { matches: result.leaders.map(id => ({ id, name: label(id) })), runnerUp };
}

export function ageHonorCopy(locale: DisplayLocale, age: number, gap: number | null) {
  const n = Math.abs(gap ?? 0);
  const younger = (gap ?? 0) < 0;
  const copies = {
    zh: { reading: "娱乐心理年龄", unit: "岁", label: gap === 0 ? "和实际年龄刚好同岁" : younger ? `比实际年龄小 ${n} 岁` : `比实际年龄大 ${n} 岁`,
      share: gap === 0 ? "这回数字居然对上了。" : younger ? "这回是我的轻快版出场。" : "这回是我的慢节奏版出场。" },
    "zh-TW": { reading: "娛樂心理年齡", unit: "歲", label: gap === 0 ? "和實際年齡剛好同歲" : younger ? `比實際年齡小 ${n} 歲` : `比實際年齡大 ${n} 歲`,
      share: gap === 0 ? "這次數字居然對上了。" : younger ? "這次是輕快版的我出場。" : "這次是慢步調版的我出場。" },
    en: { reading: "Playful mental age", unit: "years", label: gap === 0 ? "Same as your actual age" : `${n} ${n === 1 ? "year" : "years"} ${younger ? "younger" : "older"} than your actual age`,
      share: gap === 0 ? "Funny enough, the numbers lined up." : younger ? "Apparently my lighter side showed up today." : "My slow-and-steady side showed up today." },
  }[locale];
  return { reading: copies.reading, unit: copies.unit, name: `${age} ${copies.unit}`, contrast: gap === null ? undefined : copies.label, share: gap === null ? undefined : copies.share };
}
