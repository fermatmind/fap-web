export function parseQuestionnaireTakePath(pathname: string) {
  const match = pathname.match(/^\/(en|zh)\/tests\/(explore|play)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/take\/?$/);
  return match ? { locale: match[1] as "en" | "zh", collection: match[2] as "explore" | "play", slug: match[3], landing: `/${match[1]}/tests/${match[2]}/${match[3]}` } : null;
}
