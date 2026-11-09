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


const MBTI_TRADITIONAL_DETAIL_PATH = /^\/zh-TW\/personality\/([ie][ns][ft][jp])(?:-[at]|-a-vs-\1-t)?$/u;
const MBTI_TRADITIONAL_CROSS_TYPES = new Set([
  "enfp-vs-entp",
  "entj-vs-intj",
  "estj-vs-entj",
  "infj-vs-infp",
  "intj-vs-intp",
  "isfp-vs-infp",
  "istj-vs-isfj",
]);

export function isTraditionalMbtiDetailPath(pathname: string): boolean {
  const prefix = "/zh-TW/personality/";
  return pathname.startsWith(prefix) && (
    MBTI_TRADITIONAL_DETAIL_PATH.test(pathname) ||
    MBTI_TRADITIONAL_CROSS_TYPES.has(pathname.slice(prefix.length))
  );
}
