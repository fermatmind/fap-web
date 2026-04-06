import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

describe("tracking whitelist contract", () => {
  it("enforces strict whitelist for card/report UI events", () => {
    const basePayload = {
      slug: "big-five-personality-test-ocean-model",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      interaction: "click",
      milestone: 40,
      duration_bucket: "60_120s",
      phase: "matching",
      stage_detail: "access_projection_loaded",
      locked: true,
      variant: "free",
      form_code: "mbti_93",
      locale: "en",
      answers: "forbidden",
      report_tags: ["forbidden"],
      question_text: "forbidden",
      email: "forbidden@example.com",
      token: "forbidden",
      authorization: "forbidden",
      unexpected: "drop-me",
    };

    const impression = filterTrackingPayload(TRACKING_EVENTS.UI_CARD_IMPRESSION, basePayload);
    expect(impression).toEqual({
      slug: "big-five-personality-test-ocean-model",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      form_code: "mbti_93",
      locale: "en",
    });

    const interaction = filterTrackingPayload(TRACKING_EVENTS.UI_CARD_INTERACTION, basePayload);
    expect(interaction).toEqual({
      slug: "big-five-personality-test-ocean-model",
      scale_code: "BIG5_OCEAN",
      visual_kind: "bars_ocean",
      interaction: "click",
      form_code: "mbti_93",
      locale: "en",
    });

    const milestone = filterTrackingPayload(TRACKING_EVENTS.UI_QUIZ_MILESTONE, basePayload);
    expect(milestone).toEqual({
      scale_code: "BIG5_OCEAN",
      milestone: 40,
      duration_bucket: "60_120s",
      locale: "en",
    });

    const loading = filterTrackingPayload(TRACKING_EVENTS.UI_REPORT_LOADING_PHASE, basePayload);
    expect(loading).toEqual({
      scale_code: "BIG5_OCEAN",
      phase: "matching",
      stage_detail: "access_projection_loaded",
      locked: true,
      variant: "free",
      form_code: "mbti_93",
      locale: "en",
    });
  });

  it("enforces strict whitelist for career events", () => {
    const payload = {
      locale: "en",
      job_slug: "software-engineer",
      rank: 1,
      score: 88.2,
      answered_count: 36,
      primary_code: "I",
      secondary_code: "R",
      answers: "forbidden",
      report: "forbidden",
      email: "forbidden@example.com",
      token: "forbidden",
      unexpected: "drop-me",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_CENTER_VIEW, payload)).toEqual({
      locale: "en",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RECOMMENDATION_VIEW, payload)).toEqual({
      locale: "en",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RECOMMENDATION_CLICK, payload)).toEqual({
      locale: "en",
      job_slug: "software-engineer",
      rank: 1,
      score: 88.2,
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RIASEC_SUBMIT, payload)).toEqual({
      locale: "en",
      answered_count: 36,
      primary_code: "I",
      secondary_code: "R",
    });
  });

  it("whitelists invite unlock funnel fields", () => {
    const payload = {
      scale_code: "MBTI",
      unlock_stage: "partial",
      unlock_source: "invite",
      completed_invitees: 1,
      required_invitees: 2,
      target_attempt_id: "attempt-target-1",
      attempt_id: "attempt-invitee-1",
      form_code: "mbti_93",
      entry_surface: "order_lookup",
      locale: "en",
      invite_code: "iul_secret",
      answers: "forbidden",
      token: "forbidden",
      unexpected: "drop-me",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.INVITE_STAGED_SUMMARY_VIEWED, payload)).toEqual({
      scale_code: "MBTI",
      unlock_stage: "partial",
      unlock_source: "invite",
      completed_invitees: 1,
      required_invitees: 2,
      target_attempt_id: "attempt-target-1",
      attempt_id: "attempt-invitee-1",
      form_code: "mbti_93",
      entry_surface: "order_lookup",
      locale: "en",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.INVITE_CREATE_START, payload)).toEqual({
      scale_code: "MBTI",
      unlock_stage: "partial",
      unlock_source: "invite",
      completed_invitees: 1,
      required_invitees: 2,
      target_attempt_id: "attempt-target-1",
      attempt_id: "attempt-invitee-1",
      form_code: "mbti_93",
      entry_surface: "order_lookup",
      locale: "en",
    });

    expect(
      filterTrackingPayload(TRACKING_EVENTS.INVITE_SHARE_OR_COPY, {
        ...payload,
        action: "copy",
      })
    ).toEqual({
      scale_code: "MBTI",
      unlock_stage: "partial",
      unlock_source: "invite",
      completed_invitees: 1,
      required_invitees: 2,
      target_attempt_id: "attempt-target-1",
      attempt_id: "attempt-invitee-1",
      form_code: "mbti_93",
      entry_surface: "order_lookup",
      locale: "en",
      action: "copy",
    });

    expect(
      filterTrackingPayload(TRACKING_EVENTS.INVITE_PROGRESS_ADVANCED, {
        ...payload,
        previous_completed_invitees: 0,
        previous_required_invitees: 2,
        previous_unlock_stage: "locked",
        previous_unlock_source: "none",
        reason: "poll",
      })
    ).toEqual({
      scale_code: "MBTI",
      unlock_stage: "partial",
      unlock_source: "invite",
      completed_invitees: 1,
      required_invitees: 2,
      target_attempt_id: "attempt-target-1",
      attempt_id: "attempt-invitee-1",
      form_code: "mbti_93",
      entry_surface: "order_lookup",
      locale: "en",
      previous_completed_invitees: 0,
      previous_required_invitees: 2,
      previous_unlock_stage: "locked",
      previous_unlock_source: "none",
      reason: "poll",
    });
  });

  it("keeps mbti entry attribution fields for view/click/start_attempt events", () => {
    const payload = {
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a",
      locale: "zh",
      scaleCode: "MBTI",
      attempt_id: "attempt-start-123",
      attemptIdMasked: "abc123...xyz9",
      disclaimer_version: "v1",
      answers: "forbidden",
      token: "forbidden",
      unexpected: "drop-me",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.LANDING_VIEW, payload)).toEqual({
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a",
      locale: "zh",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.START_CLICK, payload)).toEqual({
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a",
      locale: "zh",
      disclaimer_version: "v1",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, payload)).toEqual({
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      scaleCode: "MBTI",
      attempt_id: "attempt-start-123",
      attemptIdMasked: "abc123...xyz9",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a",
      locale: "zh",
    });
  });

  it("keeps scene block attribution payload for entry click events", () => {
    const payload = {
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_93",
      entry_surface: "mbti_scene_block",
      source_page_type: "scene_block",
      target_action: "open_scene_career_direction",
      locale: "zh",
      answers: "forbidden",
      token: "forbidden",
      unexpected: "drop-me",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.START_CLICK, payload)).toEqual({
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      form_code: "mbti_93",
      entry_surface: "mbti_scene_block",
      source_page_type: "scene_block",
      target_action: "open_scene_career_direction",
      locale: "zh",
    });
  });
});
