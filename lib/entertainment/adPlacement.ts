import legacy from "./catalog.json";
import native from "@/lib/questionnaires/catalog.json";
import { ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS } from "@/lib/tracking/privacy";

export const AD_PLACEMENT_SEGMENT = "/ad-placement/";
export const AD_PLACEMENT_HEADER = "x-fermat-entertainment-ad";

const privatePaths = new Set<string>(ANALYTICS_DISABLED_QUESTIONNAIRE_PATHS);
const storySlugs = new Set([...legacy.map(({ slug }) => slug), "global-history-quiz", "friendship-quiz"]);
const questionnairePaths = new Set(native
  .filter(({ questionCount }) => questionCount > 0)
  .map(({ slug, collection }) => `/tests/${collection}/${slug}`));
// These take documents collect sensitive answers, demographics, or create a private challenge.
const privateTakeSlugs = new Set(["8-values-political", "friendship-quiz", "mental-age", "political-coordinates"]);

export function entertainmentAdPlacement(pathname: string, query: URLSearchParams) {
  const match = /^\/(?:en|zh|zh-TW)(\/tests\/(play|explore)\/([a-z0-9-]+))(\/take|\/results\/[a-z0-9-]+)?\/?$/.exec(pathname);
  if (!match) return null;
  const [, testPath, collection, slug, suffix] = match;
  const take = suffix === "/take";
  const isEntertainment = questionnairePaths.has(testPath)
    || (collection === "play" && storySlugs.has(slug))
    || testPath === "/tests/explore/gta-6-character-quiz";
  if (!isEntertainment || slug === "disc" || privatePaths.has(testPath) || (take && privateTakeSlugs.has(slug))) return null;

  const consentPreview = query.size === 2 && query.get("fc") === "alwaysshow"
    && ["gdpr", "ccpa"].includes(query.get("fctype") ?? "");
  const startsQuiz = take && query.size === 1 && query.get("start") === "1";
  if (query.size > 0 && !startsQuiz && !consentPreview) return null;
  return { take, consentPreview };
}
