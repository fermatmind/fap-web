import { cache } from "react";
import {
  getBigFivePublicContentAsset as readBigFivePublicContentAsset,
  getEnneagramPublicContentAsset as readEnneagramPublicContentAsset,
} from "@/lib/cms/personality-public-content-assets";
import type { Locale } from "@/lib/i18n/locales";
import type { BigFivePublicEntityType, BigFivePublicRouteEntry } from "@/lib/personality/bigFivePublicRoutes";
import type {
  EnneagramPublicEntityType,
  EnneagramPublicRouteEntry,
} from "@/lib/personality/enneagramPublicRoutes";

const loadBigFivePublicContentAsset = cache(
  async (
    locale: Locale,
    entityType: BigFivePublicEntityType,
    code: string,
    routeSlug: string,
    pathSuffix: string
  ) => readBigFivePublicContentAsset(locale, { entityType, code, routeSlug, pathSuffix })
);

const loadEnneagramPublicContentAsset = cache(
  async (
    locale: Locale,
    entityType: EnneagramPublicEntityType,
    code: string,
    routeSlug: string,
    pathSuffix: string
  ) => readEnneagramPublicContentAsset(locale, { entityType, code, routeSlug, pathSuffix })
);

export function getBigFivePublicContentAsset(locale: Locale, entry: BigFivePublicRouteEntry) {
  return loadBigFivePublicContentAsset(locale, entry.entityType, entry.code, entry.routeSlug, entry.pathSuffix);
}

export function getEnneagramPublicContentAsset(locale: Locale, entry: EnneagramPublicRouteEntry) {
  return loadEnneagramPublicContentAsset(locale, entry.entityType, entry.code, entry.routeSlug, entry.pathSuffix);
}
