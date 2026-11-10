import legacy from "./catalog.json";
import native from "@/lib/questionnaires/catalog.json";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS } from "@/lib/tracking/privacy";

export const AD_PLACEMENT_SEGMENT = "/ad-placement/";
export const AD_PLACEMENT_HEADER = "x-fermat-entertainment-ad";

const privatePaths = new Set<string>(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS);
const storySlugs = new Set([...legacy.map(({ slug }) => slug), "global-history-quiz", "friendship-quiz"]);
const nonQuizMetaphors = new Set([
  "chakra", "inkblot-personality-quiz", "inner-child-personality-test", "sake-type",
]);
const playfulExploreSlugs = new Set([
  "apocalypse-survival-type-test", "arabic-personality-compass", "color-season",
  "decade-aesthetic-test", "delulu-test", "egen-teto", "energy-flow", "eras-of-you-test",
  "feminine-energy", "food-choice", "food-disgust", "friendship-compatibility", "humor-style-test",
  "jungian-archetype", "likable-person-test", "love-personality", "love-type-16",
  "male-archetype-test", "mental-age", "moral-alignment", "mote-type", "music-taste-test",
  "philosopher-personality-test", "rizz-test", "social-battery-test", "stupidity-test",
  "travel-personality-test", "villain-era-archetype-test", "wholesome-partner",
]);
const exploreSlugs = new Set(native.filter(({ slug, collection, category, questionCount }) =>
  collection === "explore" && questionCount > 0 && !privatePaths.has(`/tests/explore/${slug}`)
  && (category === "fantasy" || (category === "metaphor" && !nonQuizMetaphors.has(slug))
    || playfulExploreSlugs.has(slug))
).map(({ slug }) => slug));

// Only public quiz entry and answer URLs are eligible. Editorial portraits and
// private result, invitation and management URLs use their original documents.
export function entertainmentAdPlacement(pathname: string, query: URLSearchParams) {
  const match = /^\/(en|zh|zh-TW)\/tests\/(play|explore)\/([a-z0-9-]+)(\/take)?\/?$/.exec(pathname);
  if (!match) return null;
  const [, locale, collection, slug, takeSegment] = match;
  const take = Boolean(takeSegment);
  const eligible = locale === "zh-TW"
    ? collection === "explore" && (slug === "chiikawa" || slug === "seven-sins-virtues-test")
    : (collection === "play" ? storySlugs : exploreSlugs).has(slug);
  // This take flow includes an optional actual-age field and optional demographic screens.
  if (!eligible || (take && slug === "mental-age")) return null;

  const consentPreview = query.size === 2 && query.get("fc") === "alwaysshow"
    && ["gdpr", "ccpa"].includes(query.get("fctype") ?? "");
  const startsQuiz = take && query.size === 1 && query.get("start") === "1";
  if (query.size > 0 && !startsQuiz && !consentPreview) return null;
  return { take, consentPreview };
}
