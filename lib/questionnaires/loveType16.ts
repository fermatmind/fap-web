import type { Questionnaire, Text } from "./types";

export const LOVE_TYPE16_AXES = [
  { id: "pace", sides: ["l", "f"], title: { en: "Opening a direction", zh: "谁先提出方向" } },
  { id: "care", sides: ["c", "a"], title: { en: "Care in the chosen moment", zh: "所选时刻的照顾角色" } },
  { id: "basis", sides: ["r", "p"], title: { en: "First consideration", zh: "首先留意什么" } },
  { id: "approach", sides: ["o", "e"], title: { en: "Defining the arrangement", zh: "怎样说明安排" } },
] as const;
export type LoveType16Result = { status: "invalid" | "incomplete" | "unavailable"; answered: number } | {
  status: "complete"; answered: 32;
  loveType16: { id: string; counts: Record<string, number>; retained: string[] }[];
  compatibleProfileIds: string[];
};
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object"
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const text = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());
const profileIds = LOVE_TYPE16_AXES.reduce<string[]>((codes, axis) => codes.flatMap(code => axis.sides.map(side => code + side)), [""]);
const sectionIds = ["meaning", "example", "tradeoffs", "nearby", "reflection", "arithmetic", "scope"];

/** Independent original four-axis reflection; every tied side remains, with no ranked or random winner. */
export function isLoveType16ConfigurationValid(input: unknown): input is Questionnaire {
  if (!plain(input) || input.kind !== "love-type16" || input.slug !== "love-type-16" || input.code !== "FM_LOVE_TYPE16_32"
    || input.version !== "fm_love_type16_original32_v1" || !text(input.title) || !text(input.description) || !text(input.instructions)
    || !text(input.seoTitle) || !text(input.introduction) || !text(input.resultHeading)
    || !plain(input.source) || input.source.kind !== "fermatmind_original_four_axis_love_reflection"
    || input.source.formCode !== input.version || input.source.itemBankVersion !== input.version
    || input.source.scoringVersion !== "fm_love_type16_four_counts_keep_all_ties_v1"
    || input.source.resultContentVersion !== "fm_love_type16_original16_full_v1" || input.source.psychometricValidationCompleted !== false
    || ![input.source.itemBankSha256, input.source.resultContentSha256].every(h => typeof h === "string" && /^[0-9a-f]{64}$/.test(h))
    || !Array.isArray(input.questions) || input.questions.length !== 32 || !Array.isArray(input.directions) || input.directions.length !== 8
    || !Array.isArray(input.profiles) || input.profiles.length !== 16) return false;
  const directions = LOVE_TYPE16_AXES.flatMap(a => [...a.sides]);
  if (!Array.from(input.directions).every((d, i) => plain(d) && d.id === directions[i] && d.comparisons === 8 && text(d.title))) return false;
  for (let i = 0; i < 32; i++) {
    const q = input.questions[i], axis = LOVE_TYPE16_AXES[Math.floor(i / 8)], n = i % 8;
    if (!plain(q) || q.id !== `LT_${axis.id.toUpperCase()}_${String(n + 1).padStart(2, "0")}` || !text(q.prompt)
      || q.reverse !== undefined || q.correctOptionId !== undefined || !Array.isArray(q.options) || q.options.length !== 2) return false;
    if (!Array.from(q.options).every((o, j) => {
      const side = axis.sides[n % 2 ? 1 - j : j];
      return plain(o) && o.id === side.toUpperCase() && o.directionId === side && text(o.label) && o.score === undefined;
    })) return false;
  }
  return Array.from(input.profiles).every((p, i) => plain(p) && p.id === profileIds[i]
    && Array.isArray(p.directionIds) && p.directionIds.join("") === profileIds[i] && p.directionIds.length === 4
    && [p.title, p.headline, p.summary, p.scoreReading].every(text) && plain(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.sections) && p.sections.length === 7 && Array.from(p.sections).every((s, j) => plain(s)
      && s.id === sectionIds[j] && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length === 2 && Array.from(s.paragraphs).every(text)));
}

export function scoreLoveType16Questionnaire(quiz: Questionnaire, answers: unknown): LoveType16Result {
  if (!isLoveType16ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!plain(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts: Record<string, number> = Object.fromEntries(quiz.directions.map(d => [d.id, 0]));
  let answered = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    counts[option.directionId]++; answered++;
  }
  if (answered !== 32) return { status: "incomplete", answered };
  const loveType16 = LOVE_TYPE16_AXES.map(axis => {
    const maximum = Math.max(...axis.sides.map(side => counts[side]));
    return { id: axis.id, counts: Object.fromEntries(axis.sides.map(side => [side, counts[side]])), retained: axis.sides.filter(side => counts[side] === maximum) };
  });
  // Fixed catalog order is display order only, not a ranking between compatible combinations.
  const compatibleProfileIds = profileIds.filter(code => loveType16.every((axis, i) => axis.retained.some(side => side === code[i])));
  return { status: "complete", answered: 32, loveType16, compatibleProfileIds };
}
