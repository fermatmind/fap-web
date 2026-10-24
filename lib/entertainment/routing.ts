import catalog from "./catalog.json";

const slugs = new Set(catalog.map(quiz => quiz.slug));
export function isMissingFunRoute(pathname: string): boolean {
  if (!/^\/(?:en|zh)\/tests\/play(?:\/|$)/.test(pathname)) return false;
  const match = pathname.match(/^\/(?:en|zh)\/tests\/play\/([a-z]+(?:-[a-z]+)*)\/?$/);
  return !match || !slugs.has(match[1]);
}
