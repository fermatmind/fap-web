"use client";

import type { DisplayLocale } from "@/lib/i18n/locales";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { contentModule } from "@/components/ui/ContentModule";

export const DeferredSiteHeader = contentModule<{ locale: DisplayLocale; productPriority?: ProductPriorityEnvSnapshot }>(
  () => import("./SiteHeader").then(module => ({ default: module.SiteHeader }))
);
