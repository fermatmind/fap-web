import {
  emitPublicWebVital,
  type PublicWebVitalPayload,
} from "@/lib/analytics";
import { hasAnalyticsConsent } from "@/lib/consent/store";
import { shouldAllowBrowserAnalyticsRuntime } from "@/lib/tracking/internalTraffic";

const PUBLIC_WEB_VITAL_METRICS = new Set<PublicWebVitalPayload["metric"]>([
  "CLS",
  "FCP",
  "INP",
  "LCP",
  "TTFB",
]);
const PUBLIC_WEB_VITAL_RATINGS = new Set<PublicWebVitalPayload["rating"]>([
  "good",
  "needs_improvement",
  "poor",
]);
const STATIC_CONTENT_ROUTES = new Set([
  "about",
  "brand",
  "charter",
  "company",
  "contact",
  "faq",
  "foundation",
  "help",
  "privacy",
  "refund",
  "support",
  "terms",
]);
const L1_ASSESSMENT_SLUGS = new Set([
  "holland-career-interest-test-riasec",
  "mbti-personality-test-16-personality-types",
]);
const L2_ASSESSMENT_SLUGS = new Set([
  "big-five-personality-test-ocean-model",
]);

export const PUBLIC_CWV_RUM_ENABLED =
  process.env.NEXT_PUBLIC_PUBLIC_CWV_RUM_ENABLED === "true";

export type PublicWebVitalMetricInput = Readonly<{
  name: string;
  value: number;
  rating?: string;
  navigationType?: string;
}>;

export type PublicRumRouteContext = Pick<
  PublicWebVitalPayload,
  "tier" | "surface" | "locale"
>;

function normalizedSegments(value: string): string[] | null {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const parsed = new URL(value, "https://public-rum.invalid");
    return parsed.pathname
      .split("/")
      .map((segment) => decodeURIComponent(segment).trim().toLowerCase())
      .filter(Boolean);
  } catch {
    return null;
  }
}

function assessmentTier(slug: string): PublicWebVitalPayload["tier"] {
  if (L1_ASSESSMENT_SLUGS.has(slug)) return "L1";
  if (L2_ASSESSMENT_SLUGS.has(slug)) return "L2";
  return "L3";
}

export function classifyPublicRumRoute(value: string): PublicRumRouteContext | null {
  const segments = normalizedSegments(value);
  if (!segments) return null;

  const locale: PublicWebVitalPayload["locale"] =
    segments[0] === "zh" || segments[0] === "en" ? segments[0] : "neutral";
  const contentSegments = locale === "neutral" ? segments : segments.slice(1);
  const [family, slug, child] = contentSegments;

  if (!family) return { tier: "L1", surface: "home", locale };

  if (family === "tests") {
    if (!slug) return { tier: "L1", surface: "tests_hub", locale };
    if (child) return null;
    return {
      tier: assessmentTier(slug),
      surface: "assessment_landing",
      locale,
    };
  }

  if (family === "personality") {
    const tier = slug?.startsWith("big-five") ? "L2" : "L3";
    return {
      tier,
      surface: slug ? "personality_detail" : "personality_hub",
      locale,
    };
  }

  if (family === "articles" && !child) {
    return {
      tier: "L3",
      surface: slug ? "article_detail" : "articles_hub",
      locale,
    };
  }

  if (family === "topics" && !child) {
    return {
      tier: "L3",
      surface: slug ? "topic_detail" : "topics_hub",
      locale,
    };
  }

  if (STATIC_CONTENT_ROUTES.has(family) && !slug) {
    return { tier: "L3", surface: "content_page", locale };
  }

  return null;
}

function normalizeNavigationType(
  value: string | undefined
): PublicWebVitalPayload["navigation_type"] {
  switch (value) {
    case "navigate":
    case "reload":
    case "prerender":
    case "restore":
      return value;
    case "back-forward":
      return "back_forward";
    case "back-forward-cache":
      return "back_forward_cache";
    default:
      return "unknown";
  }
}

function normalizeMetricValue(
  metric: PublicWebVitalMetricInput
): number | null {
  if (!Number.isFinite(metric.value) || metric.value < 0) return null;
  const precision = metric.name === "CLS" ? 4 : 0;
  return Number(metric.value.toFixed(precision));
}

export function buildPublicWebVitalPayload(
  metric: PublicWebVitalMetricInput,
  input: { pathname: string; viewportWidth: number }
): PublicWebVitalPayload | null {
  if (!PUBLIC_WEB_VITAL_METRICS.has(metric.name as PublicWebVitalPayload["metric"])) {
    return null;
  }
  if (!PUBLIC_WEB_VITAL_RATINGS.has(metric.rating as PublicWebVitalPayload["rating"])) {
    return null;
  }
  if (!Number.isFinite(input.viewportWidth) || input.viewportWidth <= 0) return null;

  const route = classifyPublicRumRoute(input.pathname);
  const value = normalizeMetricValue(metric);
  if (!route || value === null) return null;

  return {
    schema_version: "public_cwv_rum.v1",
    metric: metric.name as PublicWebVitalPayload["metric"],
    value,
    rating: metric.rating as PublicWebVitalPayload["rating"],
    ...route,
    device: input.viewportWidth < 768 ? "mobile" : "desktop",
    navigation_type: normalizeNavigationType(metric.navigationType),
  };
}

export function reportPublicWebVital(metric: PublicWebVitalMetricInput): void {
  if (!PUBLIC_CWV_RUM_ENABLED || typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;
  if (!shouldAllowBrowserAnalyticsRuntime({ analyticsEnabled: true }).allowed) return;

  try {
    const payload = buildPublicWebVitalPayload(metric, {
      pathname: window.location.pathname,
      viewportWidth: window.innerWidth,
    });
    if (payload) emitPublicWebVital(payload);
  } catch {
    // Field instrumentation must never affect rendering or navigation.
  }
}
