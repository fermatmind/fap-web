import { hasAnalyticsConsent } from "@/lib/consent/store";
import { firstContentRouteSegment, shouldLoadBrowserAnalyticsScripts } from "@/lib/tracking/browserAnalyticsSuppression";
import { getAnalyticsDeploymentEnvironment } from "@/lib/tracking/internalTraffic";

const PRODUCT_ID = "cmvdd5x4o000002l1prsfmuoy";
// Public, Origin-restricted browser identifier issued by VibeCafe, not an admin credential.
const BROWSER_KEY = "vc_web_zXejJUYctt3DtF4u5rlJF5bel7yvBhq3o9ryhHGGLoo";
const ENDPOINT = `https://vibecafe.ai/api/products/${PRODUCT_ID}/telemetry/events`;
const VISITOR_STORAGE_KEY = `vc:telemetry:visitor:${PRODUCT_ID}`;
const PUBLIC_SECTIONS = new Set(["", "tests", "test", "career", "articles", "blog", "personality", "science"]);

let lastLocation = "";
let visitorId = "";

export function trackVibeCafePageView(): void {
  if (typeof window === "undefined" || process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== "true") return;
  if (!hasAnalyticsConsent()) return;

  const privacyNavigator = navigator as Navigator & { globalPrivacyControl?: boolean };
  const privacyWindow = window as Window & { doNotTrack?: string };
  if (navigator.doNotTrack === "1" || privacyWindow.doNotTrack === "1" || privacyNavigator.globalPrivacyControl) return;

  const { pathname, search, href } = window.location;
  if (!PUBLIC_SECTIONS.has(firstContentRouteSegment(pathname))) return;
  if (pathname.split("/").some((segment) => ["take", "quiz"].includes(segment.toLowerCase()))) return;
  if (!shouldLoadBrowserAnalyticsScripts({
    analyticsEnabled: true,
    consent: true,
    env: getAnalyticsDeploymentEnvironment(),
    host: window.location.hostname,
    pathname,
    search,
    referrer: document.referrer,
    allowedHosts: ["fermatmind.com"],
  }).allowed) return;
  if (href === lastLocation) return;

  try {
    if (!visitorId) {
      try {
        const stored = window.localStorage.getItem(VISITOR_STORAGE_KEY) || "";
        if (/^[a-f0-9-]{32,36}$/i.test(stored)) visitorId = stored;
      } catch {
        // Storage may be unavailable; keep an ephemeral identifier for this document.
      }
      if (!visitorId) {
        visitorId = window.crypto.randomUUID();
        try {
          window.localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
        } catch {
          // Tracking must never depend on writable browser storage.
        }
      }
    }

    // Matches the official v1.js event protocol without executing third-party code.
    // No URL, referrer, answer, score, account identifier, or cookie is included.
    const request = fetch(ENDPOINT, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      referrerPolicy: "no-referrer",
      keepalive: true,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({ key: BROWSER_KEY, visitorId, event: "pageview" }),
    });
    lastLocation = href;
    void request.catch(() => {});
  } catch {
    // A telemetry failure must not interrupt navigation or the assessment flow.
  }
}
