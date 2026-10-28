"use client";

import { entertainmentActivityCatalog as catalog } from "./activityCatalog";
import { hasAnalyticsConsent } from "@/lib/consent/store";
import { getAnalyticsDeploymentEnvironment, shouldAllowFirstPartyAnalyticsRuntime } from "@/lib/tracking/internalTraffic";

export type ActivityAction = "start" | "complete" | "result_view" | "share";
export type ActivityRole = "single" | "creator" | "friend" | "solo";
export type ShareMethod = "copy" | "system" | "image" | "link_open";

const definitions = new Map(catalog.map(item => [item.slug, item]));

/** Anonymous activity only: no participant IDs, URLs, input, score or answer arguments. */
export function recordEntertainmentActivity(slug: string, version: string, locale: "en" | "zh", action: ActivityAction, role: ActivityRole = "single", method?: ShareMethod, activityOptIn = false): void {
  const definition = definitions.get(slug);
  if (typeof window === "undefined" || !definition || !definition.roles.includes(role)) return;
  if (definition.privacy === "explicit_opt_in" && !activityOptIn) return;
  if (!hasAnalyticsConsent()) return;
  if ((action === "share") !== Boolean(method)) return;
  const path = `/${locale}${definition.path}`;
  // Explicit anonymous activity permission does not enable ordinary/private-page analytics.
  const gatePath = definition.privacy === "explicit_opt_in" ? `/${locale}/tests` : path;
  if (!shouldAllowFirstPartyAnalyticsRuntime({ analyticsEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true", deploymentEnvironment: getAnalyticsDeploymentEnvironment(), hostname: window.location.hostname, pathname: gatePath, search: window.location.search, referrer: "", allowedHosts: process.env.NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS }).allowed) return;
  const envelope = {
    requestId: crypto.randomUUID(), eventName: `fun_${action}`, anonymousId: "", path: gatePath,
    payload: { slug, form_code: version, locale, entry_surface: role, target_action: method ?? "none",
      consent_state: definition.privacy === "explicit_opt_in" ? "activity_opt_in" : "analytics_granted" },
  };
  void fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" },
    credentials: "omit", referrerPolicy: "no-referrer", keepalive: true, body: JSON.stringify(envelope) }).catch(() => {});
}
