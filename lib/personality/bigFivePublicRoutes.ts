import type { Locale } from "@/lib/i18n/locales";

export type BigFivePublicEntityType = "hub" | "domain" | "polarity" | "facet_hub" | "facet_detail";

export type BigFivePublicRouteEntry = {
  entityType: BigFivePublicEntityType;
  code: string;
  routeSlug: string;
  pathSuffix: string;
};

const BIG_FIVE_TRAIT_CODES = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"] as const;
const BIG_FIVE_RANGE_CODES = ["high", "mid", "low"] as const;

export const BIG_FIVE_LEGACY_TO_CANONICAL_SLUG = {
  "high-openness": "openness-high",
  "low-openness": "openness-low",
  "high-conscientiousness": "conscientiousness-high",
  "low-conscientiousness": "conscientiousness-low",
  "high-extraversion": "extraversion-high",
  "low-extraversion": "extraversion-low",
  "high-agreeableness": "agreeableness-high",
  "low-agreeableness": "agreeableness-low",
  "high-neuroticism": "neuroticism-high",
  "emotional-stability": "neuroticism-low",
} as const;

const BIG_FIVE_V2_RANGE_ROUTE_ENTRIES: readonly BigFivePublicRouteEntry[] = BIG_FIVE_TRAIT_CODES.flatMap((trait) =>
  BIG_FIVE_RANGE_CODES.map((range) => {
    const slug = `${trait}-${range}`;

    return {
      entityType: "polarity",
      code: slug,
      routeSlug: slug,
      pathSuffix: `/${slug}`,
    } satisfies BigFivePublicRouteEntry;
  })
);

export const BIG_FIVE_PUBLIC_ROUTE_ENTRIES: readonly BigFivePublicRouteEntry[] = [
  { entityType: "hub", code: "big-five", routeSlug: "", pathSuffix: "" },
  { entityType: "domain", code: "openness", routeSlug: "openness", pathSuffix: "/openness" },
  { entityType: "domain", code: "conscientiousness", routeSlug: "conscientiousness", pathSuffix: "/conscientiousness" },
  { entityType: "domain", code: "extraversion", routeSlug: "extraversion", pathSuffix: "/extraversion" },
  { entityType: "domain", code: "agreeableness", routeSlug: "agreeableness", pathSuffix: "/agreeableness" },
  { entityType: "domain", code: "neuroticism", routeSlug: "neuroticism", pathSuffix: "/neuroticism" },
  ...BIG_FIVE_V2_RANGE_ROUTE_ENTRIES,
  { entityType: "facet_hub", code: "facets", routeSlug: "facets", pathSuffix: "/facets" },
  // 30 facet detail routes
  { entityType: "facet_detail", code: "imagination", routeSlug: "facets/imagination", pathSuffix: "/facets/imagination" },
  { entityType: "facet_detail", code: "aesthetics", routeSlug: "facets/aesthetics", pathSuffix: "/facets/aesthetics" },
  { entityType: "facet_detail", code: "feelings", routeSlug: "facets/feelings", pathSuffix: "/facets/feelings" },
  { entityType: "facet_detail", code: "actions", routeSlug: "facets/actions", pathSuffix: "/facets/actions" },
  { entityType: "facet_detail", code: "ideas", routeSlug: "facets/ideas", pathSuffix: "/facets/ideas" },
  { entityType: "facet_detail", code: "values", routeSlug: "facets/values", pathSuffix: "/facets/values" },
  { entityType: "facet_detail", code: "competence", routeSlug: "facets/competence", pathSuffix: "/facets/competence" },
  { entityType: "facet_detail", code: "order", routeSlug: "facets/order", pathSuffix: "/facets/order" },
  { entityType: "facet_detail", code: "dutifulness", routeSlug: "facets/dutifulness", pathSuffix: "/facets/dutifulness" },
  { entityType: "facet_detail", code: "achievement-striving", routeSlug: "facets/achievement-striving", pathSuffix: "/facets/achievement-striving" },
  { entityType: "facet_detail", code: "self-discipline", routeSlug: "facets/self-discipline", pathSuffix: "/facets/self-discipline" },
  { entityType: "facet_detail", code: "deliberation", routeSlug: "facets/deliberation", pathSuffix: "/facets/deliberation" },
  { entityType: "facet_detail", code: "warmth", routeSlug: "facets/warmth", pathSuffix: "/facets/warmth" },
  { entityType: "facet_detail", code: "gregariousness", routeSlug: "facets/gregariousness", pathSuffix: "/facets/gregariousness" },
  { entityType: "facet_detail", code: "assertiveness", routeSlug: "facets/assertiveness", pathSuffix: "/facets/assertiveness" },
  { entityType: "facet_detail", code: "activity", routeSlug: "facets/activity", pathSuffix: "/facets/activity" },
  { entityType: "facet_detail", code: "excitement-seeking", routeSlug: "facets/excitement-seeking", pathSuffix: "/facets/excitement-seeking" },
  { entityType: "facet_detail", code: "positive-emotions", routeSlug: "facets/positive-emotions", pathSuffix: "/facets/positive-emotions" },
  { entityType: "facet_detail", code: "trust", routeSlug: "facets/trust", pathSuffix: "/facets/trust" },
  { entityType: "facet_detail", code: "straightforwardness", routeSlug: "facets/straightforwardness", pathSuffix: "/facets/straightforwardness" },
  { entityType: "facet_detail", code: "altruism", routeSlug: "facets/altruism", pathSuffix: "/facets/altruism" },
  { entityType: "facet_detail", code: "compliance", routeSlug: "facets/compliance", pathSuffix: "/facets/compliance" },
  { entityType: "facet_detail", code: "modesty", routeSlug: "facets/modesty", pathSuffix: "/facets/modesty" },
  { entityType: "facet_detail", code: "tender-mindedness", routeSlug: "facets/tender-mindedness", pathSuffix: "/facets/tender-mindedness" },
  { entityType: "facet_detail", code: "anxiety", routeSlug: "facets/anxiety", pathSuffix: "/facets/anxiety" },
  { entityType: "facet_detail", code: "anger", routeSlug: "facets/anger", pathSuffix: "/facets/anger" },
  { entityType: "facet_detail", code: "depression", routeSlug: "facets/depression", pathSuffix: "/facets/depression" },
  { entityType: "facet_detail", code: "self-consciousness", routeSlug: "facets/self-consciousness", pathSuffix: "/facets/self-consciousness" },
  { entityType: "facet_detail", code: "impulsiveness", routeSlug: "facets/impulsiveness", pathSuffix: "/facets/impulsiveness" },
  { entityType: "facet_detail", code: "vulnerability", routeSlug: "facets/vulnerability", pathSuffix: "/facets/vulnerability" },
] as const;

export function buildBigFivePublicContentPath(locale: Locale, entry: BigFivePublicRouteEntry): string {
  return `/${locale}/personality/big-five${entry.pathSuffix}`;
}

export function resolveBigFiveLegacyRedirectPath(
  locale: Locale,
  slugSegments: readonly string[] | undefined
): string | null {
  const segments = (slugSegments ?? []).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  if (segments.length !== 1) {
    return null;
  }

  const legacySlug = segments[0] as keyof typeof BIG_FIVE_LEGACY_TO_CANONICAL_SLUG;
  const canonicalSlug = BIG_FIVE_LEGACY_TO_CANONICAL_SLUG[legacySlug];

  return canonicalSlug ? `/${locale}/personality/big-five/${canonicalSlug}` : null;
}

export function resolveBigFivePublicRouteEntry(slugSegments: readonly string[] | undefined): BigFivePublicRouteEntry | null {
  const segments = (slugSegments ?? []).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  if (segments.length > 2) {
    return null;
  }

  // Join multi-segment paths for facet_detail matching (e.g. ["facets", "imagination"] → "facets/imagination")
  const routeSlug = segments.join("/");

  return BIG_FIVE_PUBLIC_ROUTE_ENTRIES.find((entry) => entry.routeSlug === routeSlug) ?? null;
}
