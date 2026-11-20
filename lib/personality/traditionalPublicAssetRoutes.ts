import { normalizePersonalityComparisonSlug } from "@/lib/mbti/personalityComparison";
import { BIG_FIVE_PUBLIC_ROUTE_ENTRIES, buildBigFivePublicContentPath } from "@/lib/personality/bigFivePublicRoutes";
import { ENNEAGRAM_PUBLIC_ROUTE_ENTRIES, buildEnneagramPublicContentPath } from "@/lib/personality/enneagramPublicRoutes";

type TraditionalPublicAssetRoute =
  | { framework: "big_five"; entry: (typeof BIG_FIVE_PUBLIC_ROUTE_ENTRIES)[number] }
  | { framework: "enneagram"; entry: (typeof ENNEAGRAM_PUBLIC_ROUTE_ENTRIES)[number] };

const assetRoutes = new Map<string, TraditionalPublicAssetRoute>([
  ...BIG_FIVE_PUBLIC_ROUTE_ENTRIES.map(entry => [
    "/zh-TW" + buildBigFivePublicContentPath("zh", entry).slice(3),
    { framework: "big_five", entry } as const,
  ] as const),
  ...ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.map(entry => [
    "/zh-TW" + buildEnneagramPublicContentPath("zh", entry).slice(3),
    { framework: "enneagram", entry } as const,
  ] as const),
]);

export function getTraditionalPublicAssetRoute(pathname: string) {
  return assetRoutes.get(pathname) ?? null;
}

const MBTI_TRADITIONAL_PROFILE_PATH = /^\/zh-TW\/personality\/([ie][ns][ft][jp])(?:-[at])?$/u;

export function isTraditionalMbtiDetailPath(pathname: string): boolean {
  const prefix = "/zh-TW/personality/";
  if (!pathname.startsWith(prefix)) return false;

  const slug = pathname.slice(prefix.length);
  return MBTI_TRADITIONAL_PROFILE_PATH.test(pathname) ||
    normalizePersonalityComparisonSlug(slug) === slug;
}
