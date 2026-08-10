import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_CWV_RUM_ENABLED,
  buildPublicWebVitalPayload,
  classifyPublicRumRoute,
} from "@/lib/tracking/webVitals";

const ROOT = process.cwd();

function read(relativePath: string): string {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

describe("public CWV RUM privacy-safe instrumentation contract", () => {
  it("keeps the observer disabled by default and the current sink transport-free", () => {
    expect(PUBLIC_CWV_RUM_ENABLED).toBe(false);

    const providers = read("app/providers.tsx");
    const analytics = read("lib/analytics.ts");
    const webVitals = read("lib/tracking/webVitals.ts");
    const sinkBlock =
      analytics.match(/export function emitPublicWebVital[\s\S]*?\n\}/)?.[0] ?? "";

    expect(providers).toContain(
      "PUBLIC_CWV_RUM_ENABLED ? <PublicWebVitalsReporter /> : null"
    );
    expect(webVitals).toContain(
      'process.env.NEXT_PUBLIC_PUBLIC_CWV_RUM_ENABLED === "true"'
    );
    expect(sinkBlock).toContain("Intentionally no-op");
    expect(sinkBlock).not.toMatch(/fetch|sendBeacon|XMLHttpRequest|gtag|_hmt|trackEvent/);
  });

  it("classifies only allowlisted public non-Career route families", () => {
    expect(classifyPublicRumRoute("/")).toEqual({
      tier: "L1",
      surface: "home",
      locale: "neutral",
    });
    expect(
      classifyPublicRumRoute(
        "/zh/tests/mbti-personality-test-16-personality-types?utm_source=search"
      )
    ).toEqual({ tier: "L1", surface: "assessment_landing", locale: "zh" });
    expect(
      classifyPublicRumRoute("/en/tests/big-five-personality-test-ocean-model")
    ).toEqual({ tier: "L2", surface: "assessment_landing", locale: "en" });
    expect(classifyPublicRumRoute("/zh/personality/big-five/openness")).toEqual({
      tier: "L2",
      surface: "personality_detail",
      locale: "zh",
    });
    expect(classifyPublicRumRoute("/en/personality/intj-a")).toEqual({
      tier: "L3",
      surface: "personality_detail",
      locale: "en",
    });
    expect(classifyPublicRumRoute("/zh/articles/example-article")).toEqual({
      tier: "L3",
      surface: "article_detail",
      locale: "zh",
    });

    for (const privateOrExcludedPath of [
      "/zh/history/history-clear-123456",
      "/en/result/attempt-clear-123456",
      "/zh/orders/ord-clear-123456",
      "/zh/share/share-clear-123456",
      "/en/pay/wait",
      "/zh/payment/success",
      "/zh/tests/mbti-personality-test-16-personality-types/take",
      "/zh/careers/software-engineer",
      "/api/track",
      "/unknown/public-looking-path",
    ]) {
      expect(classifyPublicRumRoute(privateOrExcludedPath)).toBeNull();
    }
  });

  it("emits only the coarse allowlisted payload schema", () => {
    const payload = buildPublicWebVitalPayload(
      {
        name: "LCP",
        value: 1876.42,
        rating: "good",
        navigationType: "back-forward",
      },
      {
        pathname:
          "https://fermatmind.com/zh/articles/example-article?email=person@example.com#private",
        viewportWidth: 390,
      }
    );

    expect(payload).toEqual({
      schema_version: "public_cwv_rum.v1",
      metric: "LCP",
      value: 1876,
      rating: "good",
      tier: "L3",
      surface: "article_detail",
      locale: "zh",
      device: "mobile",
      navigation_type: "back_forward",
    });
    expect(Object.keys(payload ?? {}).sort()).toEqual(
      [
        "device",
        "locale",
        "metric",
        "navigation_type",
        "rating",
        "schema_version",
        "surface",
        "tier",
        "value",
      ].sort()
    );

    const serialized = JSON.stringify(payload);
    for (const forbiddenValue of [
      "example-article",
      "person@example.com",
      "https://",
      "?",
      "#private",
      "session",
      "metric_id",
      "entries",
    ]) {
      expect(serialized).not.toContain(forbiddenValue);
    }
  });

  it("fails closed for unsupported metrics, ratings, values, viewports and routes", () => {
    const base = {
      pathname: "/zh/articles/example-article",
      viewportWidth: 1440,
    };

    expect(
      buildPublicWebVitalPayload({ name: "FID", value: 10, rating: "good" }, base)
    ).toBeNull();
    expect(
      buildPublicWebVitalPayload({ name: "INP", value: 120, rating: "unknown" }, base)
    ).toBeNull();
    expect(
      buildPublicWebVitalPayload({ name: "CLS", value: Number.NaN, rating: "poor" }, base)
    ).toBeNull();
    expect(
      buildPublicWebVitalPayload(
        { name: "TTFB", value: 120, rating: "good" },
        { ...base, viewportWidth: 0 }
      )
    ).toBeNull();
    expect(
      buildPublicWebVitalPayload(
        { name: "FCP", value: 120, rating: "good" },
        { ...base, pathname: "/zh/result/attempt-clear-123456" }
      )
    ).toBeNull();
  });

  it("never reads or forwards detailed Web Vitals identifiers and entries", () => {
    const source = read("lib/tracking/webVitals.ts");

    expect(source).not.toMatch(/metric\.id|metric\.delta|metric\.entries/);
    expect(source).not.toMatch(/location\.search|location\.href|document\.title/);
    expect(source).not.toMatch(/fetch\(|sendBeacon|XMLHttpRequest|gtag|_hmt/);
    expect(source).toContain("if (!hasAnalyticsConsent()) return;");
    expect(source).toContain("shouldAllowBrowserAnalyticsRuntime");
  });

  it("keeps the monitor spec and metric registry aligned with the no-op runtime", () => {
    const auditRoot =
      "docs/research/marketing-growth/FERMATMIND-MARKETING-GROWTH-DEEP-SCAN-01/window-07-technical-seo-performance";
    const spec = JSON.parse(
      read(`${auditRoot}/cwv_rum_measurement_spec.json`)
    ) as Record<string, unknown>;
    const contract = spec.instrumentation_contract as Record<string, unknown>;
    const registry = read(`${auditRoot}/cwv_rum_metric_registry.csv`);

    expect(contract).toMatchObject({
      task_id: "PUBLIC-CWV-RUM-PRIVACY-SAFE-INSTRUMENTATION-01",
      implementation_status: "IMPLEMENTED_DISABLED_BY_DEFAULT_NOOP",
      feature_flag: "NEXT_PUBLIC_PUBLIC_CWV_RUM_ENABLED",
      repository_default: false,
      production_tracking_enabled: false,
      sink: "intentional no-op",
      network_transport: "none",
      endpoint: "none",
      vendor: "none",
      secret: "none",
    });
    expect(contract.payload_allowlist).toEqual([
      "schema_version",
      "metric",
      "value",
      "rating",
      "tier",
      "surface",
      "locale",
      "device",
      "navigation_type",
    ]);
    expect(registry.split("\n")[0]).toBe(
      "metric,role,aggregation,good,needs_improvement,poor,source_priority,dimensions,privacy,instrumentation_status"
    );
    for (const metric of ["LCP", "INP", "CLS", "TTFB", "FCP"]) {
      expect(registry).toMatch(
        new RegExp(`^${metric},.*implemented_disabled_noop$`, "m")
      );
    }
  });
});
