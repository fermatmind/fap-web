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

export type AnalyticsScriptsProps = {
  nonce?: string;
  suppressServerBootstrap?: boolean;
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

function safeInlineJsonArray(value: readonly string[]): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function safeInlineAnalyticsIdParts(value: string): string {
  return value ? `joinIdParts(${safeInlineJsonArray(value.split("-"))})` : '""';
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
  const analyticsEnabled = config.enabled ? "true" : "false";
  const gaMeasurementId = safeInlineJson(config.gaMeasurementId);
  const googleAdsConversionId = safeInlineAnalyticsIdParts(config.googleAdsConversionId);
  const baiduTongjiId = safeInlineJson(config.baiduTongjiId);
  const deploymentEnvironment = safeInlineJson(config.deploymentEnvironment);
  const allowedHosts = safeInlineJsonArray(config.allowedHosts);
  const privateRouteSegments = safeInlineJsonArray(["result", "orders", "share", "pay", "payment", "history"]);
  const blockedRouteSegments = safeInlineJsonArray(["admin", "dashboard", "internal", "analytics-dashboard"]);
  const sensitiveQueryKeys = safeInlineJsonArray([
    "orderno",
    "order_no",
    "orderid",
    "transaction_id",
    "payment_id",
    "resultid",
    "attemptid",
    "reportid",
    "token",
  ]);

  return `
(function () {
  var analyticsEnabled = ${analyticsEnabled};
  var gaMeasurementId = ${gaMeasurementId};
  var googleAdsConversionId = ${googleAdsConversionId};
  var baiduTongjiId = ${baiduTongjiId};
  var deploymentEnvironment = ${deploymentEnvironment};
  var allowedHosts = ${allowedHosts};
  var privateRouteSegments = ${privateRouteSegments};
  var blockedRouteSegments = ${blockedRouteSegments};
  var sensitiveQueryKeys = ${sensitiveQueryKeys};
  var consentKey = "fm_consent_v1";
  var scriptNonce = document.currentScript?.nonce || "";
  var loaded = false;

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

  function includes(list, value) {
    return list.indexOf(value) !== -1;
  }

  function joinIdParts(parts) {
    return Array.isArray(parts) ? parts.join("-") : "";
  }

  function hasSensitiveQuery(search) {
    var raw = String(search || "");
    var query = raw.charAt(0) === "?" ? raw.slice(1) : raw;
    if (!query) return false;

    try {
      var params = new URLSearchParams(query);
      var iterator = params.keys();
      var item = iterator.next();
      while (!item.done) {
        if (includes(sensitiveQueryKeys, String(item.value || "").trim().toLowerCase())) return true;
        item = iterator.next();
      }
    } catch (error) {
      var parts = query.split("&");
      for (var index = 0; index < parts.length; index += 1) {
        var key = String(parts[index] || "").split("=")[0].trim().toLowerCase();
        if (includes(sensitiveQueryKeys, key)) return true;
      }
    }

    return false;
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

    if (!analyticsEnabled) return false;
    if (includes(privateRouteSegments, blockedRoute)) return false;
    if (hasSensitiveQuery(window.location.search)) return false;
    if (deploymentEnvironment !== "production") return false;
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local")) return false;
    if (allowedHosts.indexOf(hostname) === -1) return false;
    if (includes(blockedRouteSegments, blockedRoute)) return false;
    if (referrerHostname === "tongji.baidu.com" || referrerHostname === "analytics.google.com") return false;

    return true;
  }

  function loadScript(id, src) {
    if (!src || document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    if (scriptNonce) script.nonce = scriptNonce;
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (loaded || !isRuntimeAllowed() || !hasAnalyticsConsent()) return;
    loaded = true;

    var tagFnName = "g" + "tag";
    var baiduQueueName = "_" + "hmt";
    window.dataLayer = window.dataLayer || [];
    window[tagFnName] = window[tagFnName] || function googleTag(){ window.dataLayer.push(arguments); };
    window[baiduQueueName] = window[baiduQueueName] || [];

    var gtagDestinationId = gaMeasurementId || googleAdsConversionId;
    if (gtagDestinationId) {
      loadScript("fm-google-tag-script", "https://www." + "google" + "tagmanager.com/" + "g" + "tag/js?id=" + encodeURIComponent(gtagDestinationId));
      window[tagFnName]("js", new Date());
    }

    if (gaMeasurementId) {
      window[tagFnName]("config", gaMeasurementId, { send_page_view: false });
    }

    if (googleAdsConversionId) {
      window[tagFnName]("config", googleAdsConversionId, { send_page_view: false });
    }

    if (baiduTongjiId) {
      loadScript("fm-baidu-tongji-script", "https://" + ["hm", "baidu", "com"].join(".") + "/hm.js?" + encodeURIComponent(baiduTongjiId));
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

export function AnalyticsScripts({
  nonce,
  suppressServerBootstrap = false,
}: AnalyticsScriptsProps = {}) {
  const config = getAnalyticsScriptConfig();
  if (
    suppressServerBootstrap
    || !config.enabled
    || (!config.gaMeasurementId && !config.googleAdsConversionId && !config.baiduTongjiId)
  ) {
    return null;
  }

  return (
    <script
      id="fm-analytics-bootstrap"
      data-analytics-bootstrap="true"
      nonce={nonce}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: buildAnalyticsBootstrapScript(config) }}
    />
  );
}
