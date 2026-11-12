"use client";

import type { DisplayLocale } from "@/lib/i18n/locales";
import { contentModule } from "@/components/ui/ContentModule";

export const DeferredSiteFooterSocialRail = contentModule<{ locale: DisplayLocale }>(
  () => import("./SiteFooterSocialRail").then(module => ({ default: module.SiteFooterSocialRail }))
);
export const DeferredSiteFooterPlatforms = contentModule<{ locale: DisplayLocale }>(
  () => import("./SiteFooterPlatforms").then(module => ({ default: module.SiteFooterPlatforms }))
);
