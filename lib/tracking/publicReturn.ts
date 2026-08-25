export type PublicReturnSurface = Readonly<{
  canonicalPath: string;
  locale: "en" | "zh";
  family: "tests" | "articles_topics" | "career" | "personality" | "trust_method_help" | "other_public";
}>;

const RESULT_VIEW_MARKER_KEY = "fm_result_viewed_for_public_return_v1";

const PRIVATE_SEGMENTS = new Set([
  "take",
  "attempt",
  "attempts",
  "result",
  "results",
  "report",
  "reports",
  "order",
  "orders",
  "share",
  "shares",
  "pay",
  "payment",
  "payments",
  "history",
  "account",
  "recovery",
  "admin",
  "ops",
  "dashboard",
]);

const TRUST_METHOD_HELP_SEGMENTS = new Set([
  "about",
  "brand",
  "charter",
  "common-misconceptions",
  "data-privacy",
  "datasets",
  "foundation",
  "help",
  "item-design-notes",
  "method-boundaries",
  "policies",
  "privacy",
  "reliability-validity",
  "research",
  "science",
  "support",
  "terms",
]);

function browserSessionStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function decodeSegments(pathname: string): string[] | null {
  try {
    let decodedPath = pathname;
    for (let pass = 0; pass < 3; pass += 1) {
      const decoded = decodeURIComponent(decodedPath);
      if (decoded === decodedPath) break;
      decodedPath = decoded;
    }
    if (/%[0-9a-f]{2}/i.test(decodedPath) || /[\u0000-\u001f\u007f\\]/.test(decodedPath)) return null;

    return decodedPath
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.trim().toLowerCase());
  } catch {
    return null;
  }
}

export function classifyPublicReturnSurface(path: string): PublicReturnSurface | null {
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return null;

  let pathname: string;
  try {
    pathname = new URL(path, "https://fermatmind.local").pathname.replace(/\/{2,}/g, "/");
  } catch {
    return null;
  }

  const segments = decodeSegments(pathname);
  if (!segments || segments.some((segment) => PRIVATE_SEGMENTS.has(segment))) return null;

  const locale = segments[0] === "zh" ? "zh" : "en";
  const content = segments[0] === "zh" || segments[0] === "en" ? segments.slice(1) : segments;
  const familySegment = content[0];
  let family: PublicReturnSurface["family"] | null = null;

  if (!familySegment) family = "other_public";
  else if (familySegment === "tests") family = "tests";
  else if (familySegment === "articles" || familySegment === "topics") family = "articles_topics";
  else if (familySegment === "career") family = "career";
  else if (familySegment === "personality" || familySegment === "types") family = "personality";
  else if (TRUST_METHOD_HELP_SEGMENTS.has(familySegment)) family = "trust_method_help";
  else if (familySegment === "business") family = "other_public";

  if (!family) return null;

  const canonicalPath = pathname !== "/" ? pathname.replace(/\/$/, "") : pathname;
  return { canonicalPath, locale, family };
}

export function markResultViewedForPublicReturn(): void {
  try {
    browserSessionStorage()?.setItem(RESULT_VIEW_MARKER_KEY, "1");
  } catch {
    // Analytics state must never block product flows.
  }
}

export function claimPublicReturnSurface(path: string): PublicReturnSurface | null {
  const storage = browserSessionStorage();
  if (!storage) return null;

  let marked = false;
  try {
    marked = storage.getItem(RESULT_VIEW_MARKER_KEY) === "1";
  } catch {
    return null;
  }
  if (!marked) return null;

  const surface = classifyPublicReturnSurface(path);
  if (!surface) return null;

  try {
    storage.removeItem(RESULT_VIEW_MARKER_KEY);
  } catch {
    return null;
  }

  return surface;
}
