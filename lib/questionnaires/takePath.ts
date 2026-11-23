import { entertainmentReaderPath } from "@/lib/entertainment/playRoutes.mjs";

export function parseQuestionnaireTakePath(pathname: string) {
  const match = entertainmentReaderPath(pathname).match(/^\/(en|zh)\/tests\/(explore|play)\/([a-z0-9]+(?:-[a-z0-9]+)*)\/take\/?$/);
  return match ? { locale: match[1] as "en" | "zh", collection: match[2] as "explore" | "play", slug: match[3], landing: `/${match[1]}/tests/explore/${match[3]}` } : null;
}
