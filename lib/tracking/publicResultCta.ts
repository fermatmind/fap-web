import { hasAnalyticsConsent } from "@/lib/consent/store";
import { entertainmentActivityDefinitions } from "@/lib/entertainment/activityDefinitions";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { trackClientEvent } from "@/lib/tracking/client";
import { isPublicResultCtaAction, TRACKING_EVENTS } from "@/lib/tracking/events";
import { shouldAllowBrowserAnalyticsRuntime } from "@/lib/tracking/internalTraffic";
import { shouldHardStopPublicAnalyticsForUrl } from "@/lib/tracking/privacy";

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true";

export function trackPublicResultCta(locale: DisplayLocale, href: string, targetAction: string, scaleCode?: string): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent() ||
      !shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: ANALYTICS_ENABLED }).allowed) return;

  const source = /^(\/(?:en|zh|zh-TW)\/tests\/(?:explore|play)\/([a-z0-9-]+))(?:\/take)?\/?$/.exec(window.location.pathname);
  const target = /^\/(?:en|zh|zh-TW)\/tests\/([a-z0-9-]+)(?:[?#]|$)/.exec(href);
  if (!source || !target || !isPublicResultCtaAction(targetAction)) return;
  const [, path, sourceSlug] = source;
  const [, testSlug] = target;
  const definition = entertainmentActivityDefinitions.find((item) => item.slug === sourceSlug);
  if (definition?.privacy !== "analytics_consent" || shouldHardStopPublicAnalyticsForUrl(path)) return;

  void trackClientEvent({
    eventName: TRACKING_EVENTS.ARTICLE_TO_TEST_CLICK,
    anonymousId: "",
    path,
    referrerPolicy: "no-referrer",
    payload: {
      locale,
      lang: locale,
      url: path,
      source_url: path,
      landing_path: path,
      page_type: "test_detail",
      source_page_type: "test_detail",
      entry_surface: "test_detail_seo_cta",
      target_action: targetAction,
      target_test: testSlug,
      test_slug: testSlug,
      scale_code: scaleCode,
      referrer: "",
    },
  });
}
