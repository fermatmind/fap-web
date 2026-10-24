import catalog from "./catalog.json";

const identities = new Map(catalog.map(quiz => [quiz.slug, quiz.resultSlugs]));
export function isMissingFunRoute(pathname: string): boolean {
  if (!/^\/(?:en|zh)\/tests\/play(?:\/|$)/.test(pathname)) return false;
  const match = pathname.match(/^\/(?:en|zh)\/tests\/play\/([a-z]+(?:-[a-z]+)*)(?:\/results\/([a-z]+(?:-[a-z]+)*))?\/?$/);
  if (!match) return true;
  const results = identities.get(match[1]);
  return !results || Boolean(match[2] && !results.includes(match[2]));
}
