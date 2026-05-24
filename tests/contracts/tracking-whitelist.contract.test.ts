import { NextRequest } from "next/server";
import { afterEach, vi } from "vitest";
import { POST as postTrackingEvent } from "@/app/api/track/route";
import { TRACKING_EVENTS, filterTrackingPayload } from "@/lib/tracking/events";

const TRACKING_ENV_KEYS = [
  "ANALYTICS_ENDPOINT",
  "MBTI_ATTRIBUTION_INGEST_ENDPOINT",
  "EDM_ENDPOINT",
  "CAREER_ATTRIBUTION_INGEST_ENDPOINT",
  "TRACK_INGEST_TOKEN",
  "VERCEL_ENV",
] as const;

describe("tracking whitelist contract", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("keeps speculative career events out of the supported tracking vocabulary", () => {
    expect(Object.values(TRACKING_EVENTS)).toContain("career_family_hub_view");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_family_hub_child_click");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_alias_resolution_submit");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_alias_resolution_target_click");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_alias_resolution_no_result");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_claim_blocked_surface_exposed");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_job_detail_cta_click");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_support_link_click");
    expect(Object.values(TRACKING_EVENTS)).toContain("career_shortlist_add");
    expect(Object.values(TRACKING_EVENTS)).not.toContain("career_alias_search");
    expect(Object.values(TRACKING_EVENTS)).not.toContain("career_alias_disambiguation_view");
    expect(Object.values(TRACKING_EVENTS)).not.toContain("career_view");
    expect(Object.values(TRACKING_EVENTS)).not.toContain("career_family_hub_ready_surface_exposed");
    expect(Object.values(TRACKING_EVENTS)).not.toContain("career_family_hub_blocked_surface_exposed");
  });

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

  it("whitelists result and report load failure fields without sensitive payloads", () => {
    const payload = {
      scale_code: "MBTI",
      stage: "load_result",
      stage_detail: "fallback_result_failed",
      status_group: "server_error",
      status_code: 500,
      error_code: "REPORT_UNAVAILABLE",
      request_id: "req-123",
      route: "/result/[id]",
      form_code: "mbti_93",
      locale: "en",
      email: "forbidden@example.com",
      token: "forbidden",
      authorization: "forbidden",
      unexpected: "drop-me",
    };

    const expected = {
      scale_code: "MBTI",
      stage: "load_result",
      stage_detail: "fallback_result_failed",
      status_group: "server_error",
      status_code: 500,
      error_code: "REPORT_UNAVAILABLE",
      request_id: "req-123",
      route: "/result/[id]",
      form_code: "mbti_93",
      locale: "en",
    };

    expect(Object.values(TRACKING_EVENTS)).toContain("result_load_failure");
    expect(Object.values(TRACKING_EVENTS)).toContain("report_load_failure");
    expect(filterTrackingPayload(TRACKING_EVENTS.RESULT_LOAD_FAILURE, payload)).toEqual(expected);
    expect(filterTrackingPayload(TRACKING_EVENTS.REPORT_LOAD_FAILURE, payload)).toEqual(expected);
  });

  it("freezes RIASEC Trusted Result analytics without recommender or raw feedback fields", () => {
    const events = Object.values(TRACKING_EVENTS);
    expect(events).toEqual(expect.arrayContaining([
      "riasec_result_view",
      "riasec_share_view",
      "riasec_pdf_view",
      "riasec_activity_explorer_view",
      "riasec_feedback_overlay_view",
    ]));
    expect(events).not.toContain("riasec_career_match");
    expect(events).not.toContain("riasec_recommendation_click");
    expect(events).not.toContain("riasec_job_fit_score_view");

    const payload = {
      scale_code: "RIASEC",
      form_code: "riasec_60",
      score_space_version: "riasec_60_likert5_activity_sum_space.v1",
      projection_version: "riasec.public_projection.v2",
      snapshot_bound: true,
      activity_explorer_status: "content_examples_only",
      activity_source_status: "content_example_not_registry_match",
      feedback_overlay_status: "overlay_contract_only",
      feedback_stream_status: "not_connected_v0_1",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      locale: "zh",
      holland_code: "RIA",
      raw_scores: { R: 86 },
      measured_holland_code: "RIA",
      feedback_text: "raw feedback should not be sent",
      match_score: 92,
      fit_score: 88,
      career_success_probability: 0.91,
      occupation_recommendation: "forbidden",
      email: "forbidden@example.com",
      token: "forbidden",
      result_type: "RIA",
      top_code: "RIA",
      typeCode: "RIA",
      identity: "RIA",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.RIASEC_RESULT_VIEW, payload)).toEqual({
      scale_code: "RIASEC",
      form_code: "riasec_60",
      score_space_version: "riasec_60_likert5_activity_sum_space.v1",
      projection_version: "riasec.public_projection.v2",
      snapshot_bound: true,
      activity_explorer_status: "content_examples_only",
      activity_source_status: "content_example_not_registry_match",
      feedback_overlay_status: "overlay_contract_only",
      feedback_stream_status: "not_connected_v0_1",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      locale: "zh",
    });
    expect(filterTrackingPayload(TRACKING_EVENTS.VIEW_RESULT, payload)).toEqual({
      scale_code: "RIASEC",
      form_code: "riasec_60",
      score_space_version: "riasec_60_likert5_activity_sum_space.v1",
      projection_version: "riasec.public_projection.v2",
      snapshot_bound: true,
      activity_explorer_status: "content_examples_only",
      activity_source_status: "content_example_not_registry_match",
      feedback_overlay_status: "overlay_contract_only",
      feedback_stream_status: "not_connected_v0_1",
      raw_feedback_included: false,
      occupation_examples_policy: "content_example_not_registry_match_without_reviewed_registry_source",
      locale: "zh",
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
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
      blocked_claim_kind: "salary",
      q: "software engineer",
      answers: "forbidden",
      report: "forbidden",
      email: "forbidden@example.com",
      token: "forbidden",
      unexpected: "drop-me",
    };

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_CENTER_VIEW, payload)).toEqual({
      locale: "en",
      landing_path: "/en/career/jobs",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RECOMMENDATION_VIEW, payload)).toEqual({
      locale: "en",
      landing_path: "/en/career/jobs",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RECOMMENDATION_CLICK, payload)).toEqual({
      locale: "en",
      job_slug: "software-engineer",
      rank: 1,
      score: 88.2,
      landing_path: "/en/career/jobs",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_JOB_SEARCH_RESULT_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_FAMILY_HUB_VIEW, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_FAMILY_HUB_CHILD_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_RECOMMENDATION_RESULT_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_VIEW, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_TRANSITION_PREVIEW_TARGET_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_READY_SURFACE_EXPOSED, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_SUBMIT, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_TARGET_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_ALIAS_RESOLUTION_NO_RESULT, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_CLAIM_BLOCKED_SURFACE_EXPOSED, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
      blocked_claim_kind: "salary",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_JOB_DETAIL_CTA_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_SUPPORT_LINK_CLICK, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.CAREER_SHORTLIST_ADD, payload)).toEqual({
      locale: "en",
      entry_surface: "career_job_search_results",
      source_page_type: "career_job_search",
      target_action: "open_job_detail",
      landing_path: "/en/career/jobs",
      route_family: "jobs_search",
      subject_kind: "job_slug",
      subject_key: "software-engineer",
      query_mode: "query",
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
      target_attempt_id: "attemp...et-1",
      attempt_id: "attemp...ee-1",
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
      target_attempt_id: "attemp...et-1",
      attempt_id: "attemp...ee-1",
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
      target_attempt_id: "attemp...et-1",
      attempt_id: "attemp...ee-1",
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
      target_attempt_id: "attemp...et-1",
      attempt_id: "attemp...ee-1",
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
      current_path: "/zh/personality/intj-a?utm_source=zhihu",
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      utm_term: "mbti",
      utm_content: "hero",
      referrer: "https://www.zhihu.com/question/1",
      gclid: "test-gclid",
      msclkid: "test-msclkid",
      fbclid: "test-fbclid",
      session_id: "anon-session-1",
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
      current_path: "/zh/personality/intj-a?utm_source=zhihu",
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      utm_term: "mbti",
      utm_content: "hero",
      referrer: "https://www.zhihu.com/question/1",
      gclid: "test-gclid",
      msclkid: "test-msclkid",
      fbclid: "test-fbclid",
      session_id: "anon-session-1",
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
      current_path: "/zh/personality/intj-a?utm_source=zhihu",
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      utm_term: "mbti",
      utm_content: "hero",
      referrer: "https://www.zhihu.com/question/1",
      gclid: "test-gclid",
      msclkid: "test-msclkid",
      fbclid: "test-fbclid",
      session_id: "anon-session-1",
      locale: "zh",
      disclaimer_version: "v1",
    });

    expect(filterTrackingPayload(TRACKING_EVENTS.START_ATTEMPT, payload)).toEqual({
      slug: "mbti-personality-test-16-personality-types",
      test_slug: "mbti-personality-test-16-personality-types",
      scaleCode: "MBTI",
      attempt_id: "attemp...-123",
      attemptIdMasked: "abc123...xyz9",
      form_code: "mbti_144",
      entry_surface: "mbti_personality_detail",
      source_page_type: "personality_detail",
      target_action: "start_mbti_test_primary",
      landing_path: "/zh/personality/intj-a",
      current_path: "/zh/personality/intj-a?utm_source=zhihu",
      utm_source: "zhihu",
      utm_medium: "community",
      utm_campaign: "launch_0506",
      utm_term: "mbti",
      utm_content: "hero",
      referrer: "https://www.zhihu.com/question/1",
      gclid: "test-gclid",
      msclkid: "test-msclkid",
      fbclid: "test-fbclid",
      session_id: "anon-session-1",
      locale: "zh",
    });
  });

  it("derives public track endpoint attribution labels instead of trusting spoofed payload labels", async () => {
    const previousEnv = Object.fromEntries(
      TRACKING_ENV_KEYS.map((key) => [key, process.env[key]])
    ) as Record<(typeof TRACKING_ENV_KEYS)[number], string | undefined>;
    for (const key of TRACKING_ENV_KEYS) {
      delete process.env[key];
    }
    process.env.ANALYTICS_ENDPOINT = "https://analytics.example.test/ingest";
    process.env.TRACK_INGEST_TOKEN = "track-token";
    process.env.VERCEL_ENV = "production";

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    try {
      const response = await postTrackingEvent(new NextRequest("https://fermatmind.com/api/track", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "Googlebot/2.1",
          referer: "https://www.baidu.com/s?wd=riasec",
        },
        body: JSON.stringify({
          eventName: TRACKING_EVENTS.START_ATTEMPT,
          anonymousId: "anon-public-track",
          path: "/zh/tests/holland-career-interest-test-riasec/take?utm_source=baidu",
          timestamp: "2026-05-24T00:00:00.000Z",
          payload: {
            slug: "holland-career-interest-test-riasec",
            test_slug: "holland-career-interest-test-riasec",
            scale_code: "RIASEC",
            source_engine: "google",
            consent_state: "denied",
            is_internal: true,
            is_qa: false,
            is_bot: false,
            environment: "development",
            traffic_quality: "production_user",
            utm_source: "baidu",
            landing_path: "/zh/tests/holland-career-interest-test-riasec/take?utm_source=baidu",
            locale: "zh",
          },
        }),
      }));

      expect(response.status).toBe(200);
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [, init] = fetchMock.mock.calls[0];
      const forwarded = JSON.parse(String(init?.body)) as {
        payload: Record<string, unknown>;
      };

      expect(forwarded.payload).toMatchObject({
        source_engine: "baidu",
        consent_state: "granted",
        is_internal: false,
        is_qa: false,
        is_bot: true,
        environment: "production",
        traffic_quality: "bot",
      });
      expect(forwarded.payload.source_engine).not.toBe("google");
      expect(forwarded.payload.consent_state).not.toBe("denied");
      expect(forwarded.payload.environment).not.toBe("development");
      expect(forwarded.payload.traffic_quality).not.toBe("production_user");
    } finally {
      for (const key of TRACKING_ENV_KEYS) {
        const value = previousEnv[key];
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
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
