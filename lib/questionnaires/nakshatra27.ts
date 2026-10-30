import type { Questionnaire, Text } from "./types";
import { questionnairePath } from "./paths";

export const NAKSHATRA_IDS = ["ashwini", "bharani", "krittika", "rohini", "mrigashira", "ardra", "punarvasu", "pushya", "ashlesha", "magha", "purva-phalguni", "uttara-phalguni", "hasta", "chitra", "swati", "vishakha", "anuradha", "jyeshtha", "mula", "purva-ashadha", "uttara-ashadha", "shravana", "dhanishta", "shatabhisha", "purva-bhadrapada", "uttara-bhadrapada", "revati"] as const;
export type NakshatraId = typeof NAKSHATRA_IDS[number];
export const NAKSHATRA_SECTOR_DEGREES = 360 / 27;
export const NAKSHATRA_COMPARISON_WINDOW_DEGREES = 0.25;
export const NAKSHATRA_METHOD = "geometric-moon-fixed-FK5-J2000-Spica-180-ECT-v1";
export const NAKSHATRA_SPICA_J2000 = { raHours: 13 + 25 / 60 + 11.58118 / 3600, decDegrees: -(11 + 9 / 60 + 40.7514 / 3600) } as const;
export const NAKSHATRA_INPUT_CONTRACT = {
  inputFields: ["date", "time", "zone", "knownTime", "placeConfirmed", "occurrence"],
  engine: "astronomy-engine@2.1.19", timeResolver: "@js-temporal/polyfill@0.5.1", method: NAKSHATRA_METHOD,
  localMinDate: "1900-01-01", maxInstant: "device-now", knownTimeRequired: true, placeZoneConfirmed: true,
  spicaRaHours: NAKSHATRA_SPICA_J2000.raHours, spicaDecDegrees: NAKSHATRA_SPICA_J2000.decDegrees,
  comparisonWindowDegrees: NAKSHATRA_COMPARISON_WINDOW_DEGREES, storage: "memory-only", analytics: "disabled",
} as const;
const plain = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && [Object.prototype, null].includes(Object.getPrototypeOf(v));
const text = (v: unknown): v is Text => plain(v) && typeof v.en === "string" && Boolean(v.en.trim()) && typeof v.zh === "string" && Boolean(v.zh.trim());

/** A known-time astronomical reference calculator; no questionnaire items or personality axes. */
export function isNakshatra27ConfigurationValid(q: unknown): q is Questionnaire {
  if (!plain(q) || q.kind !== "nakshatra27" || q.slug !== "nakshatra-spica-reference" || q.code !== "FM_NAKSHATRA_SPICA27"
    || q.version !== "fm_nakshatra_spica27_v1" || !text(q.title) || !text(q.description) || !text(q.seoTitle)
    || !text(q.introduction) || !text(q.instructions) || !text(q.resultHeading)
    || !Array.isArray(q.questions) || q.questions.length !== 0 || !Array.isArray(q.directions) || q.directions.length !== 0
    || !plain(q.source) || q.source.kind !== "fermatmind-original-nakshatra-cultural-reading-and-explicit-spica-calculation"
    || q.source.formCode !== q.version || q.source.itemBankVersion !== "fm-known-time-place-zone-input-v1"
    || q.source.scoringVersion !== NAKSHATRA_METHOD || q.source.resultContentVersion !== "fm-nakshatra27-full8-v1"
    || q.source.psychometricValidationCompleted !== false
    || q.source.itemBankSha256 !== "284c87008575781a45a839fa593ce8e2fa61aac9474d2920df6defd056f788fe"
    || q.source.resultContentSha256 !== "fa578c69d29cd2dd4df48aff63efcdc2e74ba3369b39ac75c236a98f474b530a"
    || q.minimumRatedItems !== undefined || !Array.isArray(q.profiles) || q.profiles.length !== 27) return false;
  if (!Array.from(q.profiles).every((p, i) => plain(p) && p.id === NAKSHATRA_IDS[i] && text(p.title) && text(p.headline)
    && text(p.summary) && text(p.scoreReading) && plain(p.seo) && text(p.seo.title) && text(p.seo.description)
    && Array.isArray(p.directionIds) && p.directionIds.length === 0 && Array.isArray(p.sections) && p.sections.length === 8
    && Array.from(p.sections).every((s, j) => plain(s) && s.id === `reading-${j + 1}` && text(s.title)
      && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text)))) return false;
  return Array.isArray(q.guide) && q.guide.length === 8 && Array.from(q.guide).every((s, i) => plain(s)
    && s.id === `method-${i + 1}` && text(s.title) && Array.isArray(s.paragraphs) && s.paragraphs.length > 0 && Array.from(s.paragraphs).every(text))
    && Array.isArray(q.faq) && q.faq.length === 8 && Array.from(q.faq).every(f => plain(f) && text(f.question) && text(f.answer))
    && Array.isArray(q.references) && q.references.length === 7 && Array.from(q.references).every(r => plain(r) && text(r.title)
      && typeof r.url === "string" && r.url.startsWith("https://"));
}

export type NakshatraSector = { index: number; id: NakshatraId; degreeWithin: number; pada: number; boundaryDistance: number; comparison: boolean; profileIds: NakshatraId[] };
/** Assign before formatting. The 0.25° window is a comparison policy, not an accuracy estimate. */
export function classifyNakshatraLongitude(longitude: unknown): NakshatraSector | null {
  if (typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < 0 || longitude >= 360) return null;
  // Compare identical representable boundary values directly; division may turn i*width into i-epsilon.
  let index = 26;
  for (let edge = 1; edge < 27; edge++) { if (longitude < edge * NAKSHATRA_SECTOR_DEGREES) { index = edge - 1; break; } }
  const degreeWithin = longitude - index * NAKSHATRA_SECTOR_DEGREES;
  const toUpper = NAKSHATRA_SECTOR_DEGREES - degreeWithin;
  const boundaryDistance = Math.min(degreeWithin, toUpper);
  const comparison = boundaryDistance <= NAKSHATRA_COMPARISON_WINDOW_DEGREES;
  const adjacent = degreeWithin <= toUpper ? (index + 26) % 27 : (index + 1) % 27;
  let pada = 1;
  for (let quarter = 1; quarter < 4; quarter++) { if (longitude >= index * NAKSHATRA_SECTOR_DEGREES + quarter * (NAKSHATRA_SECTOR_DEGREES / 4)) pada = quarter + 1; }
  return { index, id: NAKSHATRA_IDS[index], degreeWithin, pada, boundaryDistance,
    comparison, profileIds: comparison ? [NAKSHATRA_IDS[index], NAKSHATRA_IDS[adjacent]] : [NAKSHATRA_IDS[index]] };
}

export function nakshatraPublicLinks(q: Questionnaire, locale: "en" | "zh") {
  const entry = `https://fermatmind.com${questionnairePath(locale, q.slug)}`;
  return [entry, ...NAKSHATRA_IDS.map(id => `${entry}/results/${id}`)].join("\n");
}
