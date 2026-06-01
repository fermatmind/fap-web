import { describe, expect, it } from "vitest";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromRecord,
  toAttemptAttributionPayload,
} from "@/lib/tracking/attribution";
import {
  DISALLOWED_UTM_SOURCE_VALUES,
  UTM_CHANNEL_CONFIG,
  appendGovernedUtmParamsToHref,
  buildUtmParams,
} from "@/lib/tracking/utmGovernance";
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

  it("defines governed channel values for owned external propagation", () => {
    expect(buildUtmParams("wechat_private")).toEqual({
      utm_source: "wechat",
      utm_medium: "private",
      utm_campaign: "mbti",
    });
    expect(buildUtmParams("xiaohongshu_social")).toEqual({
      utm_source: "xiaohongshu",
      utm_medium: "social",
      utm_campaign: "career_test",
    });
    expect(buildUtmParams("zhihu_answer")).toEqual({
      utm_source: "zhihu",
      utm_medium: "answer",
      utm_campaign: "mbti_holland",
    });
    expect(buildUtmParams("chatgpt_referral")).toEqual({
      utm_source: "chatgpt",
      utm_medium: "referral",
      utm_campaign: "seo_review",
    });
    expect(buildUtmParams("bilibili_video")).toEqual({
      utm_source: "bilibili",
      utm_medium: "video",
      utm_campaign: "career_test",
    });
    expect(buildUtmParams("website_share")).toEqual({
      utm_source: "website",
      utm_medium: "share",
      utm_campaign: "result_share",
    });
    expect(Object.values(UTM_CHANNEL_CONFIG).map((config) => config.utm_source)).not.toContain("chatgpt.com");
    expect(Object.values(UTM_CHANNEL_CONFIG).map((config) => config.utm_source)).not.toContain("qr");
    expect(DISALLOWED_UTM_SOURCE_VALUES).toEqual(["chatgpt.com", "qr"]);
  });

  it("overwrites arbitrary existing UTM values while preserving non-UTM platform params", () => {
    const href = appendGovernedUtmParamsToHref(
      "https://www.instagram.com/fermatmind?igsh=abc&utm_source=qr",
      "instagram_social"
    );
    const parsed = new URL(href);

    expect(parsed.searchParams.get("igsh")).toBe("abc");
    expect(parsed.searchParams.get("utm_source")).toBe("instagram");
    expect(parsed.searchParams.get("utm_medium")).toBe("social");
    expect(parsed.searchParams.get("utm_campaign")).toBe("career_test");
  });
});
