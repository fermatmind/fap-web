import catalog from "./catalog.json";
import questionnaires from "../questionnaires/catalog.json";

const identities = new Map(catalog.map(quiz => [quiz.slug, quiz.resultSlugs]));
const questionnaireIds = new Map(questionnaires.map(quiz => [quiz.slug, quiz.resultSlugs]));
export function isMissingFunRoute(pathname: string): boolean {
  if (/^\/(?:en|zh)\/tests\/explore(?:\/|$)/.test(pathname)) {
    const match = pathname.match(/^\/(?:en|zh)\/tests\/explore\/([a-z0-9]+(?:-[a-z0-9]+)*)(?:\/results\/([a-z0-9]+(?:-[a-z0-9]+)*))?\/?$/);
    if (!match) return true;
    const profiles = questionnaireIds.get(match[1]);
    return !profiles || Boolean(match[2] && !profiles.includes(match[2]));
  }
  if (!/^\/(?:en|zh)\/tests\/play(?:\/|$)/.test(pathname)) return false;
  const match = pathname.match(/^\/(?:en|zh)\/tests\/play\/([a-z]+(?:-[a-z]+)*)(?:\/results\/([a-z]+(?:-[a-z]+)*))?\/?$/);
  if (!match) return true;
  const results = identities.get(match[1]);
  return !results || Boolean(match[2] && !results.includes(match[2]));
}
