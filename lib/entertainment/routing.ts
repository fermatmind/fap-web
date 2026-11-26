import { entertainmentReaderPath } from "./playRoutes.mjs";
import catalog from "./catalog.json";
import questionnaires from "../questionnaires/catalog.json";
import { PUBLIC_PATH, RESOURCE_PATHS } from "../friendship/core";
import { hasQuestionnaireTake } from "../questionnaires/take";
import { gta6Profile, gta6Slug } from "../questionnaires/gta6CharacterQuiz";
import { parseQuestionnaireTakePath } from "../questionnaires/takePath";
import { GLOBAL_HISTORY_ATLAS_SLUGS, GLOBAL_HISTORY_SLUG } from "./global-history/config";
import { findHistoryPerson } from "./global-history/people";

const identities = new Map(catalog.map(quiz => [quiz.slug, quiz.resultSlugs]));
const questionnaireIds = new Map(questionnaires.map(quiz => [`${quiz.collection}/${quiz.slug}`, quiz.resultSlugs]));
export function isMissingFunRoute(publicPath: string): boolean {
  const pathname = entertainmentReaderPath(publicPath);
  const historyAtlas = pathname.match(/^\/(?:en|zh|zh-TW)\/tests\/play\/global-history-quiz\/([^/]+)\/?$/u);
  if (historyAtlas && GLOBAL_HISTORY_ATLAS_SLUGS.some(atlas => atlas === historyAtlas[1])) return false;
  const take = parseQuestionnaireTakePath(pathname);
  if (take) {
    if (take.collection === "explore" && take.slug === gta6Slug) return false;
    if (take.collection === "play" && (take.slug === "friendship-quiz" || take.slug === GLOBAL_HISTORY_SLUG)) return false;
    if (questionnaireIds.has(`${take.collection}/${take.slug}`)) return !hasQuestionnaireTake(take.slug);
    return take.collection !== "play" || !identities.has(take.slug);
  }
  const localized = pathname.match(/^\/(?:en|zh)(\/.*)$/);
  const path = localized?.[1].replace(/\/$/, "");
  const friendshipPath = entertainmentReaderPath(PUBLIC_PATH);
  if (path === friendshipPath || path?.startsWith(`${friendshipPath}/`)) {
    return !RESOURCE_PATHS.some(suffix => path === `${friendshipPath}${suffix}`);
  }
  if (/^\/(?:en|zh)\/tests\/explore(?:\/|$)/.test(pathname)) {
    const match = pathname.match(/^\/(?:en|zh)\/tests\/explore\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/results\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/);
    if (!match) return true;
    if (match[1] === gta6Slug) return Boolean(match[2] && !gta6Profile(match[2]));
    const profiles = questionnaireIds.get(`explore/${match[1]}`);
    return !profiles || Boolean(match[2] && !profiles.includes(match[2]));
  }
  if (!/^\/(?:en|zh)\/tests\/play(?:\/|$)/.test(pathname)) return false;
  const match = pathname.match(/^\/(?:en|zh)\/tests\/play\/([a-z]+(?:-[a-z]+)*)(?:\/results\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/);
  if (!match) return true;
  if (match[1] === GLOBAL_HISTORY_SLUG) return Boolean(match[2] && !findHistoryPerson(match[2]));
  const results = questionnaireIds.get(`play/${match[1]}`) ?? identities.get(match[1]);
  return !results || Boolean(match[2] && !results.includes(match[2]));
}
