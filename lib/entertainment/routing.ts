import catalog from "./catalog.json";
import questionnaires from "../questionnaires/catalog.json";
import { PUBLIC_PATH, RESOURCE_PATHS } from "../friendship/core";
import { hasQuestionnaireTake } from "../questionnaires/take";
import { parseQuestionnaireTakePath } from "../questionnaires/takePath";

const identities = new Map(catalog.map(quiz => [quiz.slug, quiz.resultSlugs]));
const questionnaireIds = new Map(questionnaires.map(quiz => [`${quiz.collection}/${quiz.slug}`, quiz.resultSlugs]));
export function isMissingFunRoute(pathname: string): boolean {
  const take = parseQuestionnaireTakePath(pathname);
  if (take) {
    if (take.collection === "play" && take.slug === "friendship-quiz") return false;
    if (questionnaireIds.has(`${take.collection}/${take.slug}`)) return !hasQuestionnaireTake(take.slug);
    return take.collection !== "play" || !identities.has(take.slug);
  }
  const localized = pathname.match(/^\/(?:en|zh)(\/.*)$/);
  const path = localized?.[1].replace(/\/$/, "");
  if (path === PUBLIC_PATH || path?.startsWith(`${PUBLIC_PATH}/`)) {
    return !RESOURCE_PATHS.some(suffix => path === `${PUBLIC_PATH}${suffix}`);
  }
  if (/^\/(?:en|zh)\/tests\/explore(?:\/|$)/.test(pathname)) {
    const match = pathname.match(/^\/(?:en|zh)\/tests\/explore\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/results\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/);
    if (!match) return true;
    const profiles = questionnaireIds.get(`explore/${match[1]}`);
    return !profiles || Boolean(match[2] && !profiles.includes(match[2]));
  }
  if (!/^\/(?:en|zh)\/tests\/play(?:\/|$)/.test(pathname)) return false;
  const match = pathname.match(/^\/(?:en|zh)\/tests\/play\/([a-z]+(?:-[a-z]+)*)(?:\/results\/([a-z]+(?:-[a-z]+)*))?\/?$/);
  if (!match) return true;
  const results = questionnaireIds.get(`play/${match[1]}`) ?? identities.get(match[1]);
  return !results || Boolean(match[2] && !results.includes(match[2]));
}
