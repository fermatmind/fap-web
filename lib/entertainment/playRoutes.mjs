import stories from "./catalog.json" with { type: "json" };

export const migratedPlaySlugs = [...new Set([
  ...stories.map(({ slug }) => slug),
  "friendship-quiz",
  "global-history-quiz",
])];

const playSlugs = new Set(migratedPlaySlugs);

export function entertainmentReaderPath(pathname) {
  const match = /^(\/(?:(?:en|zh|zh-TW)\/)?)tests\/explore\/([a-z0-9-]+)(?=\/|$)/u.exec(pathname);
  if (!match || !playSlugs.has(match[2])) return pathname;
  return `${match[1]}tests/play/${match[2]}${pathname.slice(match[0].length)}`;
}
