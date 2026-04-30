import { describe, expect, it } from "vitest";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromRecord,
  toAttemptAttributionPayload,
} from "@/lib/tracking/attribution";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";

describe("UTM continuity contract", () => {
  it("extracts and appends paid attribution params without inventing unsupported keys", () => {
    const params = extractAttributionParamsFromRecord({
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      utm_content: "test_hook",
      gclid: "test-gclid",
      msclkid: "test-msclkid",
      fbclid: "test-fbclid",
      ignored: "drop-me",
    });

    const href = appendAttributionParamsToHref("/en/tests/mbti-personality-test-16-personality-types/take?form=mbti_144", params);

    expect(href).toContain("utm_source=zhihu");
    expect(href).toContain("utm_medium=community");
    expect(href).toContain("utm_campaign=launch_0506");
    expect(href).toContain("utm_content=test_hook");
    expect(href).toContain("gclid=test-gclid");
    expect(href).toContain("msclkid=test-msclkid");
    expect(href).toContain("fbclid=test-fbclid");
    expect(href).not.toContain("ignored=drop-me");
  });

  it("carries paid attribution into MBTI landing CTA href and tracking payload", () => {
    const params = {
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      gclid: "test-gclid",
    };
    const payload = buildTrackingAttributionPayload(params, {
      landingPath: "/en/tests/mbti-personality-test-16-personality-types?utm_source=zhihu",
      currentPath: "/en/tests/mbti-personality-test-16-personality-types?utm_source=zhihu",
    });

    const href = buildMbtiEntryHref({
      locale: "en",
      testSlug: "mbti-personality-test-16-personality-types",
      formCode: "mbti_144",
      entrySurface: "mbti_test_landing",
      sourcePageType: "test_landing",
      targetAction: "start_mbti_test_primary",
      sourcePath: "/en/tests/mbti-personality-test-16-personality-types",
      attributionParams: params,
    });

    expect(href).toContain("/en/tests/mbti-personality-test-16-personality-types/take");
    expect(href).toContain("entry_surface=mbti_test_landing");
    expect(href).toContain("utm_source=zhihu");
    expect(href).toContain("gclid=test-gclid");

    expect(
      buildMbtiEntryTrackingPayload({
        locale: "en",
        testSlug: "mbti-personality-test-16-personality-types",
        formCode: "mbti_144",
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: "/en/tests/mbti-personality-test-16-personality-types",
        attributionPayload: payload,
      })
    ).toMatchObject({
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      gclid: "test-gclid",
      test_slug: "mbti-personality-test-16-personality-types",
      entry_surface: "mbti_test_landing",
    });
  });

  it("maps stored flat UTM/referrer payload to backend-supported attempt attribution", () => {
    expect(
      toAttemptAttributionPayload({
        utm_source: "zhihu",
        utm_medium: "community",
        utm_campaign: "launch_0506",
        referrer: "https://www.zhihu.com/question/1",
        landing_path: "/en/tests/mbti-personality-test-16-personality-types?utm_source=zhihu",
        gclid: "frontend-only-click-id",
      })
    ).toEqual({
      referrer: "https://www.zhihu.com/question/1",
      landing_path: "/en/tests/mbti-personality-test-16-personality-types?utm_source=zhihu",
      utm: {
        source: "zhihu",
        medium: "community",
        campaign: "launch_0506",
        term: null,
        content: null,
      },
    });
  });
});
