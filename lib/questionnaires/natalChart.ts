import type { Questionnaire, QuestionnaireProfile, QuestionnaireSection, Text } from "./types";
import { NATAL_BODIES, NATAL_SIGNS, type NatalBody, type NatalSign } from "./natalChartCoordinates";
import { questionnairePath } from "./paths";
import { NATAL_MAJOR_ASPECTS, NATAL_ASPECT_ORB_DEGREES, type NatalAspectKind } from "./natalChartAspects";

export type NatalReferencePoint = { id: string; name: Text; zone: string; latitude: number; longitude: number };
export type NatalSignProfile = QuestionnaireProfile & {
  id: NatalSign; signName: Text; glyph: string;
  element: "fire" | "earth" | "air" | "water"; modality: "cardinal" | "fixed" | "mutable";
  seo: { title: Text; description: Text };
};
export type NatalBodyRole = { id: NatalBody; name: Text; topic: Text; paragraphs: Text[]; sourceURL: string };
export type NatalAspectReading = { id: NatalAspectKind; targetDegrees: number; name: Text; theme: Text; paragraphs: Text[] };
export type NatalChartConfiguration = {
  version: "fm_natal_known_time_core_v1";
  engine: "astronomy-engine@2.1.19"; timeResolver: "@js-temporal/polyfill@0.5.1";
  zodiac: "apparent-geocentric-tropical-of-date"; houses: "whole-sign";
  display: "unrounded-sector-then-truncate-tenth"; storage: "memory-only"; copy: "public-links-only";
  minLocalDate: "1900-01-01"; minUTC: "1899-12-31T00:00:00Z";
  privacy: Text; knownTimeNotice: Text; inputNotice: Text; readingOrder: Text[];
  boundaries: Record<"calculationVsMeaning" | "rounding" | "timezone" | "referenceLocation" | "limits", Text>;
  bodyRoles: NatalBodyRole[];
  houseContexts: { number: number; topic: Text; reading: Text }[];
  ascendantRole: { topic: Text; paragraphs: Text[] };
  inventoryReading: { definition: Text; zero: Text };
  aspects: { maximumOrbDegrees: 8; introduction: Text; orbExplanation: Text; convention: Text; readings: NatalAspectReading[] };
  referencePoints: NatalReferencePoint[];
};
export type NatalChartQuestionnaire = Omit<Questionnaire, "kind" | "profiles"> & {
  kind: "natal-chart"; natalChart: NatalChartConfiguration; profiles: NatalSignProfile[];
  instructions: Text; resultHeading: Text; references: { title: Text; url: string }[];
};

const plain = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === "object"
  && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
const text = (value: unknown): value is Text => plain(value) && typeof value.en === "string" && Boolean(value.en.trim())
  && typeof value.zh === "string" && Boolean(value.zh.trim());
const texts = (value: unknown, count: number) => Array.isArray(value) && value.length === count && Array.from(value).every(text);
const boundaries = (value: unknown) => plain(value)
  && ["calculationVsMeaning", "rounding", "timezone", "referenceLocation", "limits"].every(key => text(value[key]));
const sections = (value: unknown, ids: readonly string[]): value is QuestionnaireSection[] => Array.isArray(value)
  && value.length === ids.length && Array.from(value).every((section, index) => plain(section)
    && section.id === ids[index] && text(section.title) && texts(section.paragraphs, 1));

/** This birth-time calculator has no questionnaire items, psychological axes or winner. */
export function isNatalChartConfigurationValid(input: unknown): input is NatalChartQuestionnaire {
  if (!plain(input) || input.kind !== "natal-chart" || input.slug !== "natal-chart" || input.code !== "FM_NATAL_CHART_CORE"
    || !text(input.title) || !text(input.description) || !text(input.seoTitle) || !text(input.introduction)
    || !text(input.instructions) || !text(input.resultHeading)
    || !Array.isArray(input.questions) || input.questions.length !== 0 || !Array.isArray(input.directions) || input.directions.length !== 0
    || !plain(input.source) || input.source.kind !== "fermatmind_original_natal_symbolic_reading"
    || input.source.formCode !== "fm_natal_known_time_core_v1" || input.source.itemBankVersion !== "fm_natal_known_time_core_v1"
    || input.source.scoringVersion !== "fm_natal_ae2119_temporal051_whole_sign_aspects8_v2"
    || input.source.resultContentVersion !== "fm_natal_twelve_signs_ten_roles_five_aspects_v2" || input.source.psychometricValidationCompleted !== false
    || typeof input.source.itemBankSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.itemBankSha256)
    || typeof input.source.resultContentSha256 !== "string" || !/^[0-9a-f]{64}$/.test(input.source.resultContentSha256)
    || !plain(input.natalChart)) return false;
  const c = input.natalChart;
  if (c.version !== "fm_natal_known_time_core_v1" || c.engine !== "astronomy-engine@2.1.19" || c.timeResolver !== "@js-temporal/polyfill@0.5.1"
    || c.zodiac !== "apparent-geocentric-tropical-of-date" || c.houses !== "whole-sign"
    || c.display !== "unrounded-sector-then-truncate-tenth" || c.storage !== "memory-only" || c.copy !== "public-links-only"
    || c.minLocalDate !== "1900-01-01" || c.minUTC !== "1899-12-31T00:00:00Z"
    || !text(c.privacy) || !text(c.knownTimeNotice) || !text(c.inputNotice) || !texts(c.readingOrder, 4)
    || !boundaries(c.boundaries)
    || !Array.isArray(c.bodyRoles) || c.bodyRoles.length !== 10 || !Array.from(c.bodyRoles).every((role, index) => plain(role)
      && role.id === NATAL_BODIES[index] && text(role.name) && text(role.topic) && texts(role.paragraphs, 2)
      && role.sourceURL === `https://www.astrology.com/planets/${NATAL_BODIES[index]}`)
    || !Array.isArray(c.houseContexts) || c.houseContexts.length !== 12 || !Array.from(c.houseContexts).every((house, index) => plain(house)
      && house.number === index + 1 && text(house.topic) && text(house.reading))
    || !plain(c.ascendantRole) || !text(c.ascendantRole.topic) || !texts(c.ascendantRole.paragraphs, 2)
    || !plain(c.inventoryReading) || !text(c.inventoryReading.definition) || !text(c.inventoryReading.zero)
    || !plain(c.aspects) || c.aspects.maximumOrbDegrees !== NATAL_ASPECT_ORB_DEGREES
    || !text(c.aspects.introduction) || !text(c.aspects.orbExplanation) || !text(c.aspects.convention)
    || !Array.isArray(c.aspects.readings) || c.aspects.readings.length !== NATAL_MAJOR_ASPECTS.length
    || !Array.from(c.aspects.readings).every((reading, index) => plain(reading)
      && reading.id === NATAL_MAJOR_ASPECTS[index].type && reading.targetDegrees === NATAL_MAJOR_ASPECTS[index].targetDegrees
      && text(reading.name) && text(reading.theme) && texts(reading.paragraphs, 2))
    || !Array.isArray(c.referencePoints) || c.referencePoints.length !== 12 || !Array.from(c.referencePoints).every(point => plain(point)
      && typeof point.id === "string" && Boolean(point.id) && text(point.name) && typeof point.zone === "string" && point.zone.includes("/")
      && typeof point.latitude === "number" && Number.isFinite(point.latitude) && Math.abs(point.latitude) <= 90
      && typeof point.longitude === "number" && Number.isFinite(point.longitude) && Math.abs(point.longitude) <= 180)
    || new Set(c.referencePoints.map(point => point.id)).size !== 12
    || !Array.isArray(input.profiles) || input.profiles.length !== 12) return false;
  if (!Array.from(input.profiles).every((p, index) => plain(p) && p.id === NATAL_SIGNS[index]
    && p.element === ["fire", "earth", "air", "water"][index % 4] && p.modality === ["cardinal", "fixed", "mutable"][index % 3]
    && text(p.signName) && typeof p.glyph === "string" && Boolean(p.glyph)
    && text(p.title) && text(p.headline) && text(p.summary) && text(p.scoreReading)
    && Array.isArray(p.directionIds) && p.directionIds.length === 0
    && plain(p.seo) && text(p.seo.title) && text(p.seo.description)
    && sections(p.sections, ["symbol", "sun", "moon", "ascendant", "otherPlacements", "reflection"]))) return false;
  return sections(input.guide, ["reading-order", "calculation-vs-meaning", "display", "timezone", "reference-points", "range", "privacy", "core-scope"])
    && Array.isArray(input.faq) && input.faq.length === 8 && Array.from(input.faq).every(item => plain(item) && text(item.question) && text(item.answer))
    && Array.isArray(input.references) && input.references.length > 0
    && Array.from(input.references).every(reference => plain(reference) && text(reference.title) && typeof reference.url === "string" && /^https:\/\//.test(reference.url));
}

export function natalPublicLinks(quiz: NatalChartQuestionnaire, locale: "en" | "zh"): string {
  // Only fixed editorial paths. Never accept a user-supplied origin, birth input or result.
  const entryPath = questionnairePath(locale, quiz.slug);
  return [`https://fermatmind.com${entryPath}`, ...quiz.profiles.map(p => `https://fermatmind.com${entryPath}/results/${p.id}`)].join("\n");
}
