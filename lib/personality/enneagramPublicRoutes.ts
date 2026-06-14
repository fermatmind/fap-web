import type { Locale } from "@/lib/i18n/locales";

export type EnneagramPublicEntityType = "hub" | "center" | "core_type";

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

export const ENNEAGRAM_PUBLIC_ROUTE_ENTRIES: readonly EnneagramPublicRouteEntry[] = [
  { entityType: "hub", code: "enneagram", routeSlug: "", pathSuffix: "" },
  ...CENTER_ENTRIES,
  ...CORE_TYPE_ENTRIES,
] as const;

export function buildEnneagramPublicContentPath(locale: Locale, entry: EnneagramPublicRouteEntry): string {
  return `/${locale}/personality/enneagram${entry.pathSuffix}`;
}

export function resolveEnneagramPublicRouteEntry(slugSegments: readonly string[] | undefined): EnneagramPublicRouteEntry | null {
  const segments = (slugSegments ?? []).map((segment) => segment.trim().toLowerCase()).filter(Boolean);
  const routeSlug = segments.join("/");

  if (segments.length === 0) {
    return ENNEAGRAM_PUBLIC_ROUTE_ENTRIES[0] ?? null;
  }

  if (segments.length > 2) {
    return null;
  }

  return ENNEAGRAM_PUBLIC_ROUTE_ENTRIES.find((entry) => entry.routeSlug === routeSlug) ?? null;
}
