import { describe, expect, it } from "vitest";
import {
  buildQuizUrlWithoutSensitiveQuery,
  isSensitiveQuizQueryKey,
} from "@/lib/quiz/urlTokenGuard";

describe("quiz URL token flow guard", () => {
  it("removes authentication-like query parameters from quiz runner URLs", () => {
    const cleanUrl = buildQuizUrlWithoutSensitiveQuery(
      "/en/tests/mbti-personality-test-16-personality-types/take",
      "form=mbti_144&token=fm_query_token&fm_token=fm_other&auth=Bearer%20abc&authorization=Bearer%20def&session_token=session-1&utm_source=wechat"
    );

    expect(cleanUrl).toBe(
      "/en/tests/mbti-personality-test-16-personality-types/take?form=mbti_144&utm_source=wechat"
    );
  });

  it("preserves non-sensitive quiz entry parameters", () => {
    const cleanUrl = buildQuizUrlWithoutSensitiveQuery(
      "/en/tests/mbti-personality-test-16-personality-types/take",
      "share_id=share-123&compare_invite_id=invite-456&invite_code=iul_test_001&share_click_id=click-123&entrypoint=share_compare_invite&force_new_attempt=1&utm_campaign=campaign"
    );

    expect(cleanUrl).toBeNull();
  });

  it("matches common token key spellings without treating invite codes as tokens", () => {
    expect(isSensitiveQuizQueryKey("token")).toBe(true);
    expect(isSensitiveQuizQueryKey("fm-token")).toBe(true);
    expect(isSensitiveQuizQueryKey("access_token")).toBe(true);
    expect(isSensitiveQuizQueryKey("authToken")).toBe(true);
    expect(isSensitiveQuizQueryKey("invite_unlock_code")).toBe(false);
    expect(isSensitiveQuizQueryKey("share_click_id")).toBe(false);
  });
});
