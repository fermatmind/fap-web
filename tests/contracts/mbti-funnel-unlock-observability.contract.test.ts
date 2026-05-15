import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

function readSource(path: string): string {
  return readFileSync(path, "utf8");
}

describe("MBTI funnel and unlock observability contract", () => {
  it("routes MBTI start and submit through the network-observable funnel dispatcher", () => {
    const takeClient = readSource("app/(localized)/[locale]/tests/[slug]/take/QuizTakeClient.tsx");

    expect(takeClient).toContain('trackObservableFunnelEvent("start_attempt"');
    expect(takeClient).toContain('trackObservableFunnelEvent("submit_attempt"');
    expect(takeClient).toContain("isMbtiScaleCode(scaleCode)");
    expect(takeClient).toContain("scale_code: normalizedScaleCode");
    expect(takeClient).toContain("attempt_id: resultAttemptId");
  });

  it("routes MBTI result, unlock, and order events through the network-observable funnel dispatcher", () => {
    const resultShell = readSource("components/result/mbti/MbtiResultShell.tsx");

    expect(resultShell).toContain('trackObservableFunnelEvent("view_result"');
    expect(resultShell).toContain('trackObservableFunnelEvent("click_unlock"');
    expect(resultShell).toContain('trackObservableFunnelEvent("create_order"');
    expect(resultShell).toContain("createCheckoutOrOrder({");
    expect(resultShell).toContain("writePendingOrder({");
  });

  it("allows click_unlock and create_order as network-visible funnel events without changing purchase conversion triggers", () => {
    const trackingClient = readSource("lib/tracking/client.ts");

    expect(trackingClient).toContain('"click_unlock"');
    expect(trackingClient).toContain('"create_order"');
    expect(trackingClient).toContain('if (eventName !== "purchase_success") return;');
    expect(trackingClient).not.toContain('eventName === "create_order"');
    expect(trackingClient).not.toContain('eventName === "click_unlock"');
  });

  it("preserves safe SEO attribution for MBTI unlock and order events while dropping PII", () => {
    const payload = {
      attempt_id: "attempt-mbti-observable-001",
      sku: "MBTI_REPORT_FULL_199",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "mbti_acceptance",
      utm_content: "article_cta",
      source_route_family: "article",
      source_slug: "mbti-test-article",
      cta_id: "primary_mbti_test",
      target_test_slug: "mbti-personality-test-16-personality-types",
      landing_path: "/zh/articles/mbti-test-article?utm_source=google",
      email: "person@example.com",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.CLICK_UNLOCK, payload)).toMatchObject({
      attempt_id: "attemp...-001",
      sku: "MBTI_REPORT_FULL_199",
      utm_source: "google",
      utm_campaign: "mbti_acceptance",
      source_route_family: "article",
      source_slug: "mbti-test-article",
      cta_id: "primary_mbti_test",
      target_test_slug: "mbti-personality-test-16-personality-types",
    });
    expect(filterTrackingPayload(TRACKING_EVENTS.CREATE_ORDER, payload)).toMatchObject({
      attempt_id: "attemp...-001",
      sku: "MBTI_REPORT_FULL_199",
      utm_source: "google",
      utm_campaign: "mbti_acceptance",
      source_route_family: "article",
      source_slug: "mbti-test-article",
      cta_id: "primary_mbti_test",
      target_test_slug: "mbti-personality-test-16-personality-types",
    });
    expect(JSON.stringify(filterTrackingPayload(TRACKING_EVENTS.CREATE_ORDER, payload))).not.toContain(
      "person@example.com"
    );
  });

  it("documents the scoped MBTI observability boundary", () => {
    const artifact = JSON.parse(
      readSource("docs/analytics/generated/mbti-funnel-unlock-observability.v1.json")
    ) as {
      version?: string;
      observableEvents?: string[];
      forbiddenChanges?: string[];
      adsPurchaseConversionTriggers?: string[];
      piiPolicy?: string;
    };

    expect(artifact.version).toBe("mbti.funnel_unlock_observability.v1");
    expect(artifact.observableEvents).toEqual([
      "start_attempt",
      "submit_attempt",
      "view_result",
      "click_unlock",
      "create_order",
    ]);
    expect(artifact.adsPurchaseConversionTriggers).toEqual(["purchase_success", "pay_success"]);
    expect(artifact.piiPolicy).toBe("email and raw PII are forbidden in event payloads");
    expect(artifact.forbiddenChanges).toEqual(
      expect.arrayContaining([
        "backend",
        "sitemap_llms",
        "payment_order_report_entitlement_semantics",
        "recommendation",
        "profile_memory",
        "scoring",
      ])
    );
  });
});
