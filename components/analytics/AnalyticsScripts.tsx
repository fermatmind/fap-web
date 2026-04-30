import Script from "next/script";

type AnalyticsScriptConfig = {
  enabled: boolean;
  gaMeasurementId: string;
  baiduTongjiId: string;
};

function normalizeEnvValue(value: string | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getAnalyticsScriptConfig(env: Partial<NodeJS.ProcessEnv> = process.env): AnalyticsScriptConfig {
  return {
    enabled: env.NEXT_PUBLIC_ANALYTICS_ENABLED === "true",
    gaMeasurementId: normalizeEnvValue(env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    baiduTongjiId: normalizeEnvValue(env.NEXT_PUBLIC_BAIDU_TONGJI_ID),
  };
}

export function buildAnalyticsBootstrapScript(config: AnalyticsScriptConfig): string {
  const gaMeasurementId = JSON.stringify(config.gaMeasurementId);
  const baiduTongjiId = JSON.stringify(config.baiduTongjiId);

  return `
(function () {
  var gaMeasurementId = ${gaMeasurementId};
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

    if (gaMeasurementId) {
      loadScript("fm-ga4-script", "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(gaMeasurementId));
      window.gtag("js", new Date());
      window.gtag("config", gaMeasurementId, { send_page_view: false });
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
  if (!config.enabled || (!config.gaMeasurementId && !config.baiduTongjiId)) {
    return null;
  }

  return (
    <Script
      id="fm-analytics-bootstrap"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: buildAnalyticsBootstrapScript(config) }}
    />
  );
}
