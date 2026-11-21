export const PRIVATE_FLOW_ROUTE_EXCLUDES = [
  "/email/*",
  "/account",
  "/account/*",
  "/result/*",
  "/orders/*",
  "/share/*",
  "/pay/*",
  "/payment/*",
  "/history/*",
  "/tests/*/take",
  "/career/assessment/take",
  "/tests/explore/*/take",
  "/tests/play/*/take",
] as const;

export const SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS: readonly RegExp[] = [
  /^\/tests\/(?:jung-cognitive-functions|(?:explore|play)\/cognitive-functions-test)(?:\/|$)/i,
  /^\/email(\/|$)/i,
  /^\/account(\/|$)/i,
  /^\/cms-preview(\/|$)/i,
  /^\/api(\/|$)/i,
  /^\/career\/recommendations\/mbti(?:\/|$)/i,
  /^\/og(\/|$)/i,
  /^\/history(\/|$)/i,
  /^\/result(\/|$)/i,
  /^\/results(\/|$)/i,
  /^\/orders(\/|$)/i,
  /^\/share(\/|$)/i,
  /^\/payment(\/|$)/i,
  /^\/pay(\/|$)/i,
  /^\/career\/assessment\/take(\/|$)/i,
  /^\/tests\/[^/]+\/take(\/|$)/i,
  /^\/tests\/(?:explore|play)\/[^/]+\/take(\/|$)/i,
  /^\/test\/[^/]+\/take(\/|$)/i,
];

const LOCALE_PREFIX_RE = /^\/(en|zh|zh-TW)(?=\/|$)/i;

// ENT-PRUNE-01. These public pages remain routable for existing shares.
const archivedEntertainmentEntries = new Set([
  "/tests/explore/number-context-reflection",
  "/tests/explore/spatial-thinking-reflection",
  "/tests/explore/time-of-year-context-reflection",
  "/tests/play/beachcomber",
  "/tests/play/birdwatching-companion",
  "/tests/play/board-game-table",
  "/tests/play/borrowed-book",
  "/tests/play/browser-tabs",
  "/tests/play/camera-roll",
  "/tests/play/campfire-storyteller",
  "/tests/play/celebrating-a-friend",
  "/tests/play/celebration-planner",
  "/tests/play/changan-history-quiz",
  "/tests/play/choosing-together",
  "/tests/play/city-wanderer",
  "/tests/play/cloud-drift",
  "/tests/play/coffee-break",
  "/tests/play/comfort-offer",
  "/tests/play/community-fair",
  "/tests/play/compliment-style",
  "/tests/play/cozy-object",
  "/tests/play/creative-spark",
  "/tests/play/date-plan-detour",
  "/tests/play/desert-oasis",
  "/tests/play/desk-reset",
  "/tests/play/dinner-host",
  "/tests/play/dragon-housemate",
  "/tests/play/dream-train",
  "/tests/play/enchanted-library",
  "/tests/play/escape-room-role",
  "/tests/play/fantasy-party-role",
  "/tests/play/festival-companion",
  "/tests/play/festival-mask",
  "/tests/play/fictional-cafe",
  "/tests/play/firefly-evening",
  "/tests/play/floating-house",
  "/tests/play/forest-soundtrack",
  "/tests/play/friendship-invitation",
  "/tests/play/game-night-reset",
  "/tests/play/garden-season",
  "/tests/play/gift-note",
  "/tests/play/global-history-quiz",
  "/tests/play/group-chat-role",
  "/tests/play/group-project-finale",
  "/tests/play/group-trip-seatmate",
  "/tests/play/harbor-light",
  "/tests/play/hosting-a-guest",
  "/tests/play/house-of-doors",
  "/tests/play/inside-joke",
  "/tests/play/island-day",
  "/tests/play/kitchen-improviser",
  "/tests/play/long-distance-postcard",
  "/tests/play/lost-key-search",
  "/tests/play/lost-letter-adventure",
  "/tests/play/magic-shopkeeper",
  "/tests/play/message-tone",
  "/tests/play/moon-market",
  "/tests/play/mountain-cabin",
  "/tests/play/museum-of-tomorrow",
  "/tests/play/museum-visitor",
  "/tests/play/new-club-member",
  "/tests/play/night-garden",
  "/tests/play/note-taking-doodles",
  "/tests/play/paper-creature-language",
  "/tests/play/paper-world",
  "/tests/play/party-arrival",
  "/tests/play/personal-museum",
  "/tests/play/photo-group-role",
  "/tests/play/playlist-maker",
  "/tests/play/pocket-map",
  "/tests/play/portal-choice",
  "/tests/play/potluck-contribution",
  "/tests/play/quest-reward",
  "/tests/play/quiet-company",
  "/tests/play/rainy-window",
  "/tests/play/reading-ritual",
  "/tests/play/reunion-style",
  "/tests/play/river-crossing",
  "/tests/play/road-trip-dj",
  "/tests/play/room-atmosphere",
  "/tests/play/saying-goodbye",
  "/tests/play/seasonal-table",
  "/tests/play/secret-door",
  "/tests/play/secret-garden-gate",
  "/tests/play/shared-hobby",
  "/tests/play/shared-ritual",
  "/tests/play/shared-workspace",
  "/tests/play/small-apology",
  "/tests/play/snow-day",
  "/tests/play/souvenir-story",
  "/tests/play/spell-school-elective",
  "/tests/play/stargazing-role",
  "/tests/play/story-ending",
  "/tests/play/storybook-narrator",
  "/tests/play/team-name-maker",
  "/tests/play/thrift-shop-find",
  "/tests/play/tide-pool-creature",
  "/tests/play/time-capsule",
  "/tests/play/tiny-kingdom",
  "/tests/play/tiny-superpower",
  "/tests/play/tiny-treat",
  "/tests/play/weather-in-a-bottle",
  "/tests/play/woodland-animal",
]);

export function normalizeDiscoverabilityPath(pathname: string): string {
  const raw = String(pathname || "").trim();
  if (!raw) return "/";
  const withoutQuery = raw.split("?")[0]?.split("#")[0] ?? raw;
  const withLeadingSlash = withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

export function stripDiscoverabilityLocalePrefix(pathname: string): string {
  const normalized = normalizeDiscoverabilityPath(pathname);
  const stripped = normalized.replace(LOCALE_PREFIX_RE, "");
  return stripped.length > 0 ? stripped : "/";
}

export function hasDiscoverabilityLocalePrefix(pathname: string): boolean {
  return LOCALE_PREFIX_RE.test(normalizeDiscoverabilityPath(pathname));
}

export function isSharedDiscoverabilityDeniedPath(pathname: string): boolean {
  const stripped = stripDiscoverabilityLocalePrefix(pathname);
  return isArchivedEntertainmentPath(stripped)
    || SHARED_DISCOVERABILITY_DENY_PATH_PATTERNS.some((pattern) => pattern.test(stripped));
}

export function isArchivedEntertainmentPath(pathname: string): boolean {
  const path = stripDiscoverabilityLocalePrefix(pathname).replace(/\/+$/, "");
  const entry = path.replace(/\/results\/[^/]+$/, "");
  return archivedEntertainmentEntries.has(entry);
}
