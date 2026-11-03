"use client";

import type { Locale } from "@/lib/i18n/locales";
import { contentModule } from "@/components/ui/ContentModule";

export const DeferredCookieBanner = contentModule<{ locale: Locale }>(
  () => import("./CookieBanner").then(module => ({ default: module.CookieBanner }))
);
