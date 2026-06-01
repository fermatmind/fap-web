import {
  getAnalyticsDeploymentEnvironment,
  parseAnalyticsAllowedHosts,
} from "@/lib/tracking/internalTraffic";

type AnalyticsScriptConfig = {
  enabled: boolean;
  gaMeasurementId: string;
  googleAdsConversionId: string;
  baiduTongjiId: string;
  deploymentEnvironment: string;
  allowedHosts: string[];
};

function normalizeEnvValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeGaMeasurementId(value: string): string {
  return /^G-[A-Z0-9]{4,32}$/i.test(value) ? value : "";
}

function normalizeGoogleAdsConversionId(value: string): string {
  return /^AW-[A-Z0-9-]{4,32}$/i.test(value) ? value : "";
}

function normalizeBaiduTongjiId(value: string): string {
  return /^[a-f0-9]{16,64}$/i.test(value) ? value : "";
}

function safeInlineJson(value: string): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function getAnalyticsScriptConfig(env: Partial<NodeJS.ProcessEnv> = process.env): AnalyticsScriptConfig {
  return {
    enabled: env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    gaMeasurementId: normalizeGaMeasurementId(normalizeEnvValue(env.NEXT_PUBLIC_GA_MEASUREMENT_ID)),
    googleAdsConversionId: normalizeGoogleAdsConversionId(
      normalizeEnvValue(env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID)
    ),
    baiduTongjiId: normalizeBaiduTongjiId(normalizeEnvValue(env.NEXT_PUBLIC_BAIDU_TONGJI_ID)),
    deploymentEnvironment: getAnalyticsDeploymentEnvironment(env),
    allowedHosts: parseAnalyticsAllowedHosts(env.NEXT_PUBLIC_ANALYTICS_ALLOWED_HOSTS),
  };
}

export function buildAnalyticsBootstrapScript(config: AnalyticsScriptConfig): string {
  const gaMeasurementId = safeInlineJson(config.gaMeasurementId);
  const googleAdsConversionId = safeInlineJson(config.googleAdsConversionId);
  const baiduTongjiId = safeInlineJson(config.baiduTongjiId);
  const deploymentEnvironment = safeInlineJson(config.deploymentEnvironment);
  const allowedHosts = JSON.stringify(config.allowedHosts).replace(/</g, "\\u003c");

  return `
(function () {
  var gaMeasurementId = ${gaMeasurementId};
  var googleAdsConversionId = ${googleAdsConversionId};
  var baiduTongjiId = ${baiduTongjiId};
  var deploymentEnvironment = ${deploymentEnvironment};
  var allowedHosts = ${allowedHosts};
  var consentKey = "fm_consent_v1";
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
  window._hmt = window._hmt || [];

  function hasAnalyticsConsent() {
    try {
      var raw = window.localStorage.getItem(consentKey);
      if (!raw) return false;
      var parsed = JSON.parse(raw);
      return parsed && parsed.analytics === "granted";
    } catch (error) {
      return false;
    }
  }

  function routeSegment(pathname) {
    var parts = String(pathname || "").split("?")[0].split("/").filter(Boolean);
    return parts[0] === "zh" || parts[0] === "en" ? parts[1] : parts[0];
  }

  function referrerHost(referrer) {
    if (!referrer) return "";
    try {
      return new URL(referrer).hostname.toLowerCase();
    } catch (error) {
      return String(referrer).toLowerCase();
    }
  }

  function isRuntimeAllowed() {
    var hostname = window.location.hostname.toLowerCase();
    var blockedRoute = routeSegment(window.location.pathname);
    var referrerHostname = referrerHost(document.referrer);

    if (deploymentEnvironment !== "production") return false;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local")) return false;
    if (allowedHosts.indexOf(hostname) === -1) return false;
    if (blockedRoute === "admin" || blockedRoute === "dashboard" || blockedRoute === "internal" || blockedRoute === "analytics-dashboard") return false;
    if (referrerHostname === "tongji.baidu.com" || referrerHostname === "analytics.google.com") return false;

    return true;
  }

  function loadScript(id, src) {
    if (!src || document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (loaded || !isRuntimeAllowed() || !hasAnalyticsConsent()) return;
    loaded = true;

    var gtagDestinationId = gaMeasurementId || googleAdsConversionId;
    if (gtagDestinationId) {
      loadScript("fm-gtag-script", "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gtagDestinationId));
      window.gtag("js", new Date());
    }

    if (gaMeasurementId) {
      window.gtag("config", gaMeasurementId, { send_page_view: false });
    }

    if (googleAdsConversionId) {
      window.gtag("config", googleAdsConversionId, { send_page_view: false });
    }

    if (baiduTongjiId) {
      loadScript("fm-baidu-tongji-script", "https://hm.baidu.com/hm.js?" + encodeURIComponent(baiduTongjiId));
    }
  }

  window.addEventListener("fm:analytics-consent-updated", function (event) {
    if (event && event.detail && event.detail.analytics === "granted") {
      loadAnalytics();
    }
  });

  loadAnalytics();
})();`.trim();
}

export function AnalyticsScripts() {
  const config = getAnalyticsScriptConfig();
  if (!config.enabled || (!config.gaMeasurementId && !config.googleAdsConversionId && !config.baiduTongjiId)) {
    return null;
  }

  return (
    <script
      id="fm-analytics-bootstrap"
      data-analytics-bootstrap="true"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: buildAnalyticsBootstrapScript(config) }}
    />
  );
}
