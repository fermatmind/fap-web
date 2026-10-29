import type { Questionnaire, Text } from "./types";

export const wetonWeekdays = ["senin", "selasa", "rabu", "kamis", "jumat", "sabtu", "minggu"] as const;
export const wetonPasaran = ["legi", "pahing", "pon", "wage", "kliwon"] as const;
export type WetonDay = typeof wetonWeekdays[number];
export type WetonPasaran = typeof wetonPasaran[number];
export type WetonStoryResult = { status: "unavailable" | "invalid" | "incomplete"; answered: number } | {
  status: "complete"; answered: 35; unscored: number;
  counts: Record<WetonDay | WetonPasaran, number> | null;
  weekdayLeaders: WetonDay[]; pasaranLeaders: WetonPasaran[]; profileIds: string[];
};
const object = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => object(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());

export function isWetonStory35ConfigurationValid(quiz: Questionnaire): boolean {
  if (!object(quiz) || quiz.kind !== "weton-story35" || quiz.slug !== "weton-story-preferences"
    || quiz.code !== "FM_WETON_STORY35" || quiz.version !== "fm_weton_story35_v1"
    || !object(quiz.source) || quiz.source.kind !== "fermatmind-original-weton-inspired-story-and-separate-calendar"
    || quiz.source.formCode !== quiz.version || quiz.source.itemBankVersion !== "fm-weton35-bilingual-v1"
    || quiz.source.scoringVersion !== "separate21-role14-lens-all-top-cartesian-any-na-withhold-v1"
    || quiz.source.resultContentVersion !== "fm-weton35-full8-v1"
    || quiz.source.itemBankSha256 !== "910b30264d8433aea5a760fe07f031f3f9317c4d4157f767d0e2d3f26dc970ec"
    || quiz.source.resultContentSha256 !== "c6e33215ce1b19e03ec39fb3fd62ed1c87da008f077f1e657986fcd0d30cb06d"
    || quiz.source.psychometricValidationCompleted !== false || quiz.minimumRatedItems !== undefined
    || !text(quiz.title) || !text(quiz.instructions) || !Array.isArray(quiz.questions) || quiz.questions.length !== 35
    || !Array.isArray(quiz.directions) || quiz.directions.length !== 12 || !Array.isArray(quiz.profiles) || quiz.profiles.length !== 35) return false;
  const keys = [...wetonWeekdays, ...wetonPasaran];
  if (!Array.from(quiz.directions).every((d, i) => object(d) && d.id === keys[i] && d.itemCount === (i < 7 ? 9 : 14) && text(d.title))) return false;
  if (!Array.from(quiz.questions).every((q, i) => {
    const round = Math.floor(i / 7), offset = i % 7;
    const offered: string[] = i < 21 ? [0, 1, 3].map(n => wetonWeekdays[(offset + n) % 7]) : [...wetonPasaran];
    const rotation = i < 21 ? round : (i - 21) % 5;
    const expected = [...offered.slice(rotation), ...offered.slice(0, rotation), "na"];
    return object(q) && q.id === `WETON35_${String(i + 1).padStart(3, "0")}` && text(q.prompt)
      && q.reverse === undefined && q.correctOptionId === undefined && q.explanation === undefined
      && Array.isArray(q.options) && q.options.length === expected.length && Array.from(q.options).every((o, j) => object(o)
        && o.id === expected[j] && o.directionId === (o.id === "na" ? "unscored" : o.id) && o.score === undefined && text(o.label));
  })) return false;
  return Array.from(quiz.profiles).every((p, i) => {
    const day = wetonWeekdays[Math.floor(i / 5)], pasaran = wetonPasaran[i % 5];
    return object(p) && p.id === `${day}-${pasaran}` && Array.isArray(p.directionIds) && p.directionIds.length === 2
      && p.directionIds[0] === day && p.directionIds[1] === pasaran && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
      && object(p.seo) && text(p.seo.title) && text(p.seo.description) && Array.isArray(p.sections) && p.sections.length === 8
      && Array.from(p.sections).every((s, j) => object(s) && s.id === `reading-${j + 1}` && text(s.title)
        && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text));
  });
}

/** The two nominal banks have different exposure totals; rank each separately. */
export function scoreWetonStory35(quiz: Questionnaire, answers: unknown): WetonStoryResult {
  if (!isWetonStory35ConfigurationValid(quiz)) return { status: "unavailable", answered: 0 };
  if (!object(answers)) return { status: "invalid", answered: 0 };
  const questions = new Map(quiz.questions.map(q => [q.id, q]));
  const counts = Object.fromEntries([...wetonWeekdays, ...wetonPasaran].map(k => [k, 0])) as Record<WetonDay | WetonPasaran, number>;
  let answered = 0, unscored = 0;
  for (const [id, value] of Object.entries(answers)) {
    const option = questions.get(id)?.options.find(o => o.id === value);
    if (!option) return { status: "invalid", answered };
    if (option.id === "na") unscored++; else counts[option.directionId as WetonDay | WetonPasaran]++;
    answered++;
  }
  if (answered !== 35) return { status: "incomplete", answered };
  const weekdayLeaders = unscored ? [] : wetonWeekdays.filter(k => counts[k] === Math.max(...wetonWeekdays.map(d => counts[d])));
  const pasaranLeaders = unscored ? [] : wetonPasaran.filter(k => counts[k] === Math.max(...wetonPasaran.map(d => counts[d])));
  return { status: "complete", answered: 35, unscored, counts: unscored ? null : counts, weekdayLeaders, pasaranLeaders,
    profileIds: weekdayLeaders.flatMap(day => pasaranLeaders.map(p => `${day}-${p}`)) };
}

/** Create only after Start. Stable source keys survive back edits; NA stays last. */
export function createWetonStory35OptionOrder(quiz: Questionnaire, random: () => number = Math.random): Record<string, string[]> {
  if (!isWetonStory35ConfigurationValid(quiz)) return {};
  return Object.fromEntries(quiz.questions.map(q => {
    const keys = q.options.filter(o => o.id !== "na").map(o => o.id);
    for (let i = keys.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [keys[i], keys[j]] = [keys[j], keys[i]]; }
    return [q.id, [...keys, "na"]];
  }));
}

export type SunsetRelation = "before" | "after" | "unknown";
export type WetonCalendarReference = { civilDate: string; weekday: WetonDay; pasaran: WetonPasaran; weekdayNeptu: number; pasaranNeptu: number; neptu: number };
export type WetonCalendarResult = { status: "invalid" } | { status: "complete"; relation: SunsetRelation; references: WetonCalendarReference[] };
const DAY = 86400000, ANCHOR = Date.UTC(1945, 7, 17);
const weekdayNeptu: Record<WetonDay, number> = { senin: 4, selasa: 3, rabu: 7, kamis: 8, jumat: 6, sabtu: 9, minggu: 5 };
const pasaranNeptu: Record<WetonPasaran, number> = { legi: 5, pahing: 9, pon: 7, wage: 4, kliwon: 8 };
/** Civil-date arithmetic only. No clock time, timezone or astronomical sunset is inferred. */
export function calculateWetonCalendar(date: unknown, relation: unknown): WetonCalendarResult {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof relation !== "string" || !["before", "after", "unknown"].includes(relation)) return { status: "invalid" };
  const [year, month, day] = date.split("-").map(Number), instant = Date.UTC(year, month - 1, day), parsed = new Date(instant);
  if (year < 1900 || year > 2099 || parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) return { status: "invalid" };
  const offsets = relation === "before" ? [0] : relation === "after" ? [1] : [0, 1];
  const references = offsets.map(offset => {
    const value = new Date(instant + offset * DAY), weekday = wetonWeekdays[(value.getUTCDay() + 6) % 7];
    const pasaran = wetonPasaran[((Math.round((value.getTime() - ANCHOR) / DAY) % 5) + 5) % 5];
    return { civilDate: value.toISOString().slice(0, 10), weekday, pasaran, weekdayNeptu: weekdayNeptu[weekday], pasaranNeptu: pasaranNeptu[pasaran], neptu: weekdayNeptu[weekday] + pasaranNeptu[pasaran] };
  });
  return { status: "complete", relation: relation as SunsetRelation, references };
}
