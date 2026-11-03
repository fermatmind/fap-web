"use client";

import type { Locale } from "@/lib/i18n/locales";
import { contentModule } from "@/components/ui/ContentModule";

export const DeferredSiteFooterSocialRail = contentModule<{ locale: Locale }>(
  () => import("./SiteFooterSocialRail").then(module => ({ default: module.SiteFooterSocialRail }))
);
export const DeferredSiteFooterPlatforms = contentModule<{ locale: Locale }>(
  () => import("./SiteFooterPlatforms").then(module => ({ default: module.SiteFooterPlatforms }))
);
