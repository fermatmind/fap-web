import type { Locale } from "@/lib/i18n/locales";

export type EnneagramPublicEntityType = "hub" | "center" | "core_type" | "wing" | "instinctual_subtype";

export type EnneagramPublicRouteEntry = {
  entityType: EnneagramPublicEntityType;
  code: string;
  routeSlug: string;
  pathSuffix: string;
};

const CENTER_ENTRIES = [
  { entityType: "center", code: "gut", routeSlug: "centers/gut", pathSuffix: "/centers/gut" },
  { entityType: "center", code: "heart", routeSlug: "centers/heart", pathSuffix: "/centers/heart" },
  { entityType: "center", code: "head", routeSlug: "centers/head", pathSuffix: "/centers/head" },
] as const satisfies readonly EnneagramPublicRouteEntry[];

const CORE_TYPE_ENTRIES = Array.from({ length: 9 }, (_, index) => {
  const typeNumber = index + 1;
  const code = `type-${typeNumber}`;

  return {
    entityType: "core_type" as const,
    code,
    routeSlug: code,
    pathSuffix: `/${code}`,
  };
}) satisfies EnneagramPublicRouteEntry[];

const WING_CODES = [
  "1w9",
  "1w2",
  "2w1",
  "2w3",
  "3w2",
  "3w4",
  "4w3",
  "4w5",
  "5w4",
  "5w6",
  "6w5",
  "6w7",
  "7w6",
  "7w8",
  "8w7",
  "8w9",
  "9w8",
  "9w1",
] as const;

const WING_ENTRIES = WING_CODES.map((code) => ({
  entityType: "wing" as const,
  code,
  routeSlug: `wings/${code}`,
  pathSuffix: `/wings/${code}`,
})) satisfies EnneagramPublicRouteEntry[];

const INSTINCTUAL_SUBTYPES = ["self-preservation", "social", "one-to-one"] as const;

const INSTINCTUAL_SUBTYPE_ENTRIES = Array.from({ length: 9 }, (_, index) => {
  const typeNumber = index + 1;

  return INSTINCTUAL_SUBTYPES.map((subtype) => ({
    entityType: "instinctual_subtype" as const,
    code: `type-${typeNumber}/${subtype}`,
    routeSlug: `type-${typeNumber}/instincts/${subtype}`,
    pathSuffix: `/type-${typeNumber}/instincts/${subtype}`,
  }));
}).flat() satisfies EnneagramPublicRouteEntry[];

export const ENNEAGRAM_PUBLIC_ROUTE_ENTRIES: readonly EnneagramPublicRouteEntry[] = [
  { entityType: "hub", code: "enneagram", routeSlug: "", pathSuffix: "" },
  ...CENTER_ENTRIES,
  ...CORE_TYPE_ENTRIES,
  ...WING_ENTRIES,
  ...INSTINCTUAL_SUBTYPE_ENTRIES,
] as const;

export function buildEnneagramPublicContentPath(locale: Locale, entry: EnneagramPublicRouteEntry): string {
  return `/${locale}/personality/enneagram${entry.pathSuffix}`;
}

export function hasBackendEnneagramMetadataAuthority(
  locale: Locale,
  entry: EnneagramPublicRouteEntry,
  canonicalPath: string,
  hreflang: { en: string | null; "zh-CN": string | null }
): boolean {
  const expectedCurrent = buildEnneagramPublicContentPath(locale, entry);
  const expectedEn = buildEnneagramPublicContentPath("en", entry);
  const expectedZh = buildEnneagramPublicContentPath("zh", entry);

  return (
    canonicalPath === expectedCurrent &&
    hreflang.en === expectedEn &&
    hreflang["zh-CN"] === expectedZh
  );
}

export function resolveEnneagramPublicRouteEntry(slugSegments: readonly string[] | undefined): EnneagramPublicRouteEntry | null {
  const segments = (slugSegments ?? []).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  const routeSlug = segments.join("/");

  if (segments.length === 0) {
    return ENNEAGRAM_PUBLIC_ROUTE_ENTRIES[0] ?? null;
  }

  if (segments.length > 4) {
    return null;
  }

  return ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.find((entry) => entry.routeSlug === routeSlug) ?? null;
}
