import type { Locale } from "@/lib/i18n/locales";

export type BigFivePublicEntityType = "hub" | "domain" | "polarity" | "facet_hub";

export type BigFivePublicRouteEntry = {
  entityType: BigFivePublicEntityType;
  code: string;
  routeSlug: string;
  pathSuffix: string;
};

export const BIG_FIVE_PUBLIC_ROUTE_ENTRIES: readonly BigFivePublicRouteEntry[] = [
  { entityType: "hub", code: "big-five", routeSlug: "", pathSuffix: "" },
  { entityType: "domain", code: "openness", routeSlug: "openness", pathSuffix: "/openness" },
  { entityType: "domain", code: "conscientiousness", routeSlug: "conscientiousness", pathSuffix: "/conscientiousness" },
  { entityType: "domain", code: "extraversion", routeSlug: "extraversion", pathSuffix: "/extraversion" },
  { entityType: "domain", code: "agreeableness", routeSlug: "agreeableness", pathSuffix: "/agreeableness" },
  { entityType: "domain", code: "neuroticism", routeSlug: "neuroticism", pathSuffix: "/neuroticism" },
  { entityType: "polarity", code: "high-openness", routeSlug: "high-openness", pathSuffix: "/high-openness" },
  { entityType: "polarity", code: "low-openness", routeSlug: "low-openness", pathSuffix: "/low-openness" },
  {
    entityType: "polarity",
    code: "high-conscientiousness",
    routeSlug: "high-conscientiousness",
    pathSuffix: "/high-conscientiousness",
  },
  {
    entityType: "polarity",
    code: "low-conscientiousness",
    routeSlug: "low-conscientiousness",
    pathSuffix: "/low-conscientiousness",
  },
  { entityType: "polarity", code: "high-extraversion", routeSlug: "high-extraversion", pathSuffix: "/high-extraversion" },
  { entityType: "polarity", code: "low-extraversion", routeSlug: "low-extraversion", pathSuffix: "/low-extraversion" },
  { entityType: "polarity", code: "high-agreeableness", routeSlug: "high-agreeableness", pathSuffix: "/high-agreeableness" },
  { entityType: "polarity", code: "low-agreeableness", routeSlug: "low-agreeableness", pathSuffix: "/low-agreeableness" },
  { entityType: "polarity", code: "high-neuroticism", routeSlug: "high-neuroticism", pathSuffix: "/high-neuroticism" },
  { entityType: "polarity", code: "emotional-stability", routeSlug: "emotional-stability", pathSuffix: "/emotional-stability" },
  { entityType: "facet_hub", code: "facets", routeSlug: "facets", pathSuffix: "/facets" },
] as const;

export function buildBigFivePublicContentPath(locale: Locale, entry: BigFivePublicRouteEntry): string {
  return `/${locale}/personality/big-five${entry.pathSuffix}`;
}

export function resolveBigFivePublicRouteEntry(slugSegments: readonly string[] | undefined): BigFivePublicRouteEntry | null {
  const segments = (slugSegments ?? []).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  if (segments.length > 1) {
    return null;
  }

  const routeSlug = segments[0] ?? "";
  return BIG_FIVE_PUBLIC_ROUTE_ENTRIES.find((entry) => entry.routeSlug === routeSlug) ?? null;
}
