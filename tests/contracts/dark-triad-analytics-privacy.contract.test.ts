import { afterEach, describe, expect, it, vi } from "vitest";
import { buildAnalyticsBootstrapScript } from "@/components/analytics/AnalyticsScripts";
import { shouldAllowFirstPartyAnalyticsRuntime } from "@/lib/tracking/internalTraffic";
import { shouldSuppressServerAnalyticsBootstrap, isNoindexAnalyticsSuppressedPath } from "@/lib/tracking/browserAnalyticsSuppression";
import { getPrivateAnalyticsRouteFamily, shouldHardStopPublicAnalyticsForUrl, shouldSuppressAnalyticsForUrl } from "@/lib/tracking/privacy";
import { trackClientEvent, trackNetworkObservableFunnelEvent } from "@/lib/tracking/client";

const paths = [
  "/en/tests/explore/dark-triad",
  "/zh/tests/explore/dark-triad/",
  "/en/tests/explore/dark-triad/results/status-recognition",
  "/zh/tests/explore/dark-triad/results/impact-distance?utm_source=synthetic",
];

afterEach(() => { vi.unstubAllGlobals(); window.localStorage.clear(); });

describe("Dark Triad source privacy applies to the global analytics layer", () => {
  it("suppresses entry and guide analytics without making public guides private or noindex", () => {
    for (const path of paths) {
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(true);
      expect(shouldSuppressAnalyticsForUrl(`https://fermatmind.com${path}`)).toBe(true);
      expect(shouldSuppressServerAnalyticsBootstrap({ pathname: path })).toBe(true);
      expect(getPrivateAnalyticsRouteFamily(path)).toBeNull();
      expect(isNoindexAnalyticsSuppressedPath(path)).toBe(false);
      expect(shouldAllowFirstPartyAnalyticsRuntime({ analyticsEnabled: true, deploymentEnvironment: "production", hostname: "fermatmind.com", pathname: path }).allowed).toBe(false);
    }
    for (const path of ["/zh/tests", "/en/tests/explore/moral-dilemma", "/en/tests/explore/dark-triad-other", "/en/tests/play/dark-triad"]) {
      expect(shouldHardStopPublicAnalyticsForUrl(path)).toBe(false);
      expect(shouldAllowFirstPartyAnalyticsRuntime({ analyticsEnabled: true, deploymentEnvironment: "production", hostname: "fermatmind.com", pathname: path }).allowed).toBe(true);
    }
  });

  it("blocks both actual first-party dispatchers with granted consent before browser or network dispatch", async () => {
    window.localStorage.setItem("fm_consent_v1", JSON.stringify({ analytics: "granted" }));
    const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal("fetch", fetch);
    const gtag = vi.fn(); vi.stubGlobal("gtag", gtag);
    for (const path of paths) for (const eventName of ["landing_pv", "start_test", "complete_test", "view_result"]) {
      const input = { path, eventName, anonymousId: "synthetic", payload: { scale_id: "DARK_TRIAD", form_id: "dark_triad_theme_likert_18" } };
      await trackClientEvent(input); await trackNetworkObservableFunnelEvent(input);
    }
    expect(fetch).not.toHaveBeenCalled(); expect(gtag).not.toHaveBeenCalled();
    await trackClientEvent({ path: "/en/tests/explore/moral-dilemma", eventName: "landing_pv", anonymousId: "synthetic", payload: {} });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not load third-party scripts when consent is granted on a direct or SPA arrival", () => {
    const script = buildAnalyticsBootstrapScript({ enabled: true, gaMeasurementId: "G-TEST1234", googleAdsConversionId: "", baiduTongjiId: "0123456789abcdef", deploymentEnvironment: "production", allowedHosts: ["fermatmind.com"] });
    for (const pathname of [...paths, "/en/tests/explore/moral-dilemma"]) for (const arrival of ["direct", "spa"]) {
      const appendChild = vi.fn(), listeners: Record<string, (event: { detail: { analytics: string } }) => void> = {};
      let consent = arrival === "direct" ? "granted" : "denied";
      const browser = { location: { hostname: "fermatmind.com", pathname: arrival === "direct" ? pathname : "/en/tests", search: "" }, localStorage: { getItem: () => JSON.stringify({ analytics: consent }) }, addEventListener: (name: string, listener: (event: { detail: { analytics: string } }) => void) => { listeners[name] = listener; } };
      const document = { referrer: "", currentScript: null, getElementById: () => null, createElement: () => ({}), head: { appendChild } };
      new Function("window", "document", script)(browser, document);
      browser.location.pathname = pathname; consent = "granted";
      listeners["fm:analytics-consent-updated"]?.({ detail: { analytics: "granted" } });
      expect(appendChild).toHaveBeenCalledTimes(pathname.includes("dark-triad") ? 0 : 2);
    }
  });
});
