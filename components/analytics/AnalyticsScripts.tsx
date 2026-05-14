type AnalyticsScriptConfig = {
  enabled: boolean;
  gaMeasurementId: string;
  googleAdsConversionId: string;
  baiduTongjiId: string;
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
  };
}

export function buildAnalyticsBootstrapScript(config: AnalyticsScriptConfig): string {
  const gaMeasurementId = safeInlineJson(config.gaMeasurementId);
  const googleAdsConversionId = safeInlineJson(config.googleAdsConversionId);
  const baiduTongjiId = safeInlineJson(config.baiduTongjiId);

  return `
(function () {
  var gaMeasurementId = ${gaMeasurementId};
  var googleAdsConversionId = ${googleAdsConversionId};
  var baiduTongjiId = ${baiduTongjiId};
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

  function loadScript(id, src) {
    if (!src || document.getElementById(id)) return;
    var script = document.createElement("script");
    script.id = id;
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function loadAnalytics() {
    if (loaded || !hasAnalyticsConsent()) return;
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
      window.gtag("config", googleAdsConversionId);
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
