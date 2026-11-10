export const FRIENDSHIP_PATH = "/tests/play/friendship-quiz";
export const FRIENDSHIP_ID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const publicPaths = ["", "/take", "/questions", "/how-to-play", "/scores"].map(path => FRIENDSHIP_PATH + path);

export function isFriendshipDisplayPath(path: string): boolean {
  if (publicPaths.includes(path)) return true;
  const invite = /^\/share\/friendship\/([^/]+)(?:\/manage)?$/.exec(path);
  return Boolean(invite && FRIENDSHIP_ID.test(invite[1]));
}
