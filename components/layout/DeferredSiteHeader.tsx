"use client";

import type { Locale } from "@/lib/i18n/locales";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { contentModule } from "@/components/ui/ContentModule";

export const DeferredSiteHeader = contentModule<{ locale: Locale; productPriority?: ProductPriorityEnvSnapshot }>(
  () => import("./SiteHeader").then(module => ({ default: module.SiteHeader }))
);
