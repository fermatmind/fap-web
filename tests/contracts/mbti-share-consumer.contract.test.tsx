import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShareClient from "@/app/(localized)/[locale]/share/[id]/ShareClient";
import { generateMetadata } from "@/app/(localized)/[locale]/share/[id]/page";
import type { MbtiPublicProjectionV1Raw, ShareSummaryResponse } from "@/lib/api/v0_3";
import { buildSharePageViewModel } from "@/lib/mbti/publicProjection";
import { renderShareOgImage } from "@/lib/og/mbtiShare";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

const hoisted = vi.hoisted(() => ({
  pathname: "/en/share/share-123",
  search: "utm_source=wechat&utm_medium=organic&utm_campaign=spring",
  routerPush: vi.fn(),
  getShareSummary: vi.fn(),
  trackShareClick: vi.fn(),
  createMbtiCompareInvite: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
  useRouter: () => ({
    push: hoisted.routerPush,
  }),
}));

vi.mock("@/lib/anon", () => ({
  getOrCreateAnonId: () => "anon_share_test",
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getShareSummary: hoisted.getShareSummary,
    trackShareClick: hoisted.trackShareClick,
    createMbtiCompareInvite: hoisted.createMbtiCompareInvite,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createShareFixture(): ShareSummaryResponse {
  const projection = createProjectionFixture();

  return {
    ok: true,
    share_id: "share-123",
    share_url: "https://example.com/en/share/share-123",
    id: "share-123",
    scale_code: "MBTI",
    locale: "en",
    type_code: "LEGACY-TYPE",
    type_name: "Legacy title should be ignored",
    title: "Legacy title should be ignored",
    subtitle: "Legacy subtitle should be ignored",
    summary: "Legacy summary should be ignored",
    tagline: "Legacy tagline should be ignored",
    rarity: {
      label: "Legacy rarity should be ignored",
    },
    primary_cta_label: "Start MBTI test",
    primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
    compare_enabled: true,
    compare_cta_label: "Invite a friend to compare",
    public_tags: ["Legacy tag should be ignored"],
    tags: ["type:LEGACY", "Legacy tag should be ignored", "axis:EI"],
    dimensions: [{ code: "EI", label: "Legacy dimension should be ignored", pct: 12 }],
    profile: {
      type_name: "Legacy profile should be ignored",
      tagline: "Legacy profile tagline should be ignored",
      short_summary: "Legacy profile summary should be ignored",
      rarity: "Legacy profile rarity should be ignored",
      keywords: ["Legacy keyword should be ignored"],
    },
    identity_card: {
      title: "Legacy identity title should be ignored",
      subtitle: "Legacy identity subtitle should be ignored",
      summary: "Legacy identity summary should be ignored",
      tags: ["Legacy identity tag should be ignored"],
    },
    result: {
      type_code: "LEGACY-RESULT",
      summary: "Legacy result summary should be ignored",
      dimensions: [{ code: "SN", label: "Legacy result dimension", pct: 99 }],
    },
    summary_card: {
      title: "Legacy summary card title should be ignored",
      subtitle: "Legacy summary card subtitle should be ignored",
      summary: "Legacy summary card summary should be ignored",
      dimensions: [{ code: "TF", label: "Legacy summary card dimension", pct: 88 }],
    },
    report: {
      profile: {
        type_name: "Legacy report profile should be ignored",
      },
      identity_card: {
        title: "Legacy report identity should be ignored",
      },
      dimensions: [{ code: "JP", label: "Legacy report dimension", pct: 77 }],
    },
    mbti_public_summary_v1: {
      title: "Legacy public summary should be ignored",
    },
    mbti_public_projection_v1: projection,
    mbti_continuity_v1: {
      carryover_focus_key: "career.next_step",
      carryover_reason: "continue_career_bridge",
      recommended_resume_keys: ["career.next_step", "career.work_experiments"],
      carryover_scene_keys: ["work", "growth"],
      carryover_action_keys: ["career_next_step.theme.clarify_decision_criteria"],
    },
    mbti_read_contract_v1: createReadContractFixture(),
    controlled_narrative_v1: {
      narrative_summary: "This public-safe summary keeps the main signal readable without exposing the private report.",
    },
    comparative_v1: {
      version: "comparative.norming.v1",
      comparative_contract_version: "comparative.norming.v1",
      cohort_relative_position: {
        key: "upper_band",
        label: "Above about 62% of the cohort",
        summary: "In the current norming set, this profile signal sits above roughly 62% of the anonymized cohort.",
      },
    },
    working_life_v1: {
      career_focus_key: "career.next_step",
      career_journey_keys: ["career.next_step", "career.work_experiments"],
      career_action_priority_keys: ["career.next_step"],
    },
    public_surface_v1: {
      version: "public.surface.v1",
      entry_surface: "mbti_share_landing",
      public_summary_fingerprint: "share-fingerprint-123",
      discoverability_keys: ["public_safe_summary", "share_landing", "continue_here", "compare_invite"],
      continue_reading_keys: ["career.next_step", "career.work_experiments"],
      canonical_url: "http://localhost:3000/en/share/share-123",
      robots_policy: "noindex,follow",
      attribution_scope: "share_public_surface",
    },
    landing_surface_v1: {
      landing_contract_version: "landing.surface.v1",
      landing_scope: "public_share_safe",
      entry_surface: "mbti_share_entry",
      entry_type: "mbti_share_summary",
      summary_blocks: [
        {
          key: "share_summary",
          title: "Public-safe next step",
          body: "Use this share page as a lightweight entry, then continue into the MBTI topic hub or restart the test.",
        },
      ],
      discoverability_keys: ["public_safe_summary", "share_landing", "topic_hub"],
      continue_reading_keys: ["career.next_step", "career.work_experiments"],
      start_test_target: "/en/tests/mbti-personality-test-16-personality-types/take",
      result_resume_target: null,
      content_continue_target: "/en/topics/mbti",
      cta_bundle: [
        {
          key: "start_test",
          label: "Start MBTI test",
          href: "/en/tests/mbti-personality-test-16-personality-types/take",
          style: "primary",
        },
        {
          key: "continue_public_content",
          label: "Open MBTI topic",
          href: "/en/topics/mbti",
          style: "secondary",
        },
      ],
      indexability_state: "noindex",
      attribution_scope: "share_public_surface",
      share_safety_state: "public_share_safe",
    },
    answer_surface_v1: {
      answer_contract_version: "answer.surface.v1",
      answer_scope: "public_share_safe",
      surface_type: "mbti_share_public_safe",
      summary_blocks: [
        {
          key: "share_summary",
          title: "Public-safe answer",
          body: "Use this public-safe page as a lightweight answer layer before restarting the full MBTI test.",
        },
      ],
      faq_blocks: [
        {
          key: "faq_0",
          question: "Can this page replace the full report?",
          answer: "No. It only exposes a safe public summary.",
        },
      ],
      compare_blocks: [
        {
          key: "comparative",
          title: "Relative position",
          body: "This profile sits above roughly 62% of the anonymized cohort.",
        },
      ],
      next_step_blocks: [
        {
          key: "start_test",
          title: "Start MBTI test",
          href: "/en/tests/mbti-personality-test-16-personality-types/take",
        },
      ],
      public_safety_state: "public_share_safe",
      indexability_state: "noindex",
      attribution_scope: "share_public_surface",
    },
    insight_graph_v1: {
      version: "insight.graph.v1",
      graph_contract_version: "insight.graph.v1",
      root_node: "result_summary",
      graph_fingerprint: "graph-fingerprint-123",
      graph_scope: "public_share_safe",
      supporting_scales: ["MBTI", "BIG5_OCEAN"],
      nodes: [
        { id: "result_summary", kind: "result_summary", title: "Campaigner", summary: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content." },
        { id: "narrative", kind: "narrative", title: "Public summary", summary: "This public-safe summary keeps the main signal readable without exposing the private report." },
        { id: "comparative", kind: "comparative", title: "Above about 62% of the cohort", summary: "In the current norming set, this profile signal sits above roughly 62% of the anonymized cohort." },
        { id: "working_life", kind: "working_life", title: "Working-life cue", summary: "Current focus: career.next_step" },
        { id: "continue_reading", kind: "continue_reading", title: "Continue path", summary: "career.next_step -> career.work_experiments" },
      ],
      edges: [
        { from: "narrative", to: "result_summary", relation: "enriches" },
        { from: "comparative", to: "result_summary", relation: "supports" },
      ],
    },
    embed_surface_v1: {
      version: "embed.surface.v1",
      surface_key: "mbti_share_embed_card",
      graph_scope: "public_share_safe",
      entry_surface: "mbti_share_landing",
      title: "Campaigner",
      summary: "This public-safe summary keeps the main signal readable without exposing the private report.",
      primary_cta_label: "Start MBTI test",
      primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
      continue_target: "career.next_step",
      allowed_node_ids: ["result_summary", "narrative", "comparative", "working_life", "continue_reading"],
      embed_fingerprint: "embed-fingerprint-123",
      render_mode: "card",
    },
    widget_surface_v1: {
      version: "widget.surface.v1",
      widget_scope: "public_share_safe",
      widget_contract_version: "widget.surface.v1",
      surface_key: "mbti_share_embed_card",
      host_mode: "card",
      slot_key: "public_share_primary",
      size_preset: "summary_card",
      entry_surface: "mbti_share_landing",
      title: "Campaigner",
      summary: "This public-safe summary keeps the main signal readable without exposing the private report.",
      primary_cta_label: "Start MBTI test",
      primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
      continue_target: "career.next_step",
      allowed_node_ids: ["result_summary", "narrative", "comparative", "working_life", "continue_reading"],
      allowed_edge_types: ["enriches", "supports"],
      graph_fingerprint: "graph-fingerprint-123",
      embed_fingerprint: "embed-fingerprint-123",
      attribution_scope: "share_public_surface",
    },
    partner_read_v1: {
      version: "partner.read.v1",
      graph_scope: "public_share_safe",
      graph_contract_version: "insight.graph.v1",
      graph_fingerprint: "graph-fingerprint-123",
      supporting_scales: ["MBTI", "BIG5_OCEAN"],
      allowed_node_ids: ["result_summary", "narrative", "comparative", "working_life", "continue_reading"],
      allowed_edge_types: ["enriches", "supports"],
      read_scope: "partner_public_read",
      subject_scope: "public_summary_only",
      attribution_scope: "share_public_surface",
    },
    offers: [
      {
        title: "Unlock full report",
      },
    ],
    recommended_reads: [
      {
        title: "Paid-only reading",
      },
    ],
    paid_sections: [
      {
        title: "Career chapter",
      },
    ],
  };
}

function createBig5ShareFixture(): ShareSummaryResponse {
  return {
    ok: true,
    share_id: "share-big5-123",
    share_url: "https://example.com/en/share/share-big5-123",
    id: "share-big5-123",
    scale_code: "BIG5_OCEAN",
    locale: "en",
    type_code: "BIG5",
    type_name: "Big Five personality",
    title: "Big Five public summary",
    subtitle: "This profile is primarily driven by Openness.",
    summary: "This public-safe Big Five summary keeps the dominant traits, relative position, and entry path visible.",
    tagline: "Openness · Agreeableness · Conscientiousness",
    primary_cta_label: "Take the test",
    primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
    big5_public_projection_v1: {
      trait_vector: [
        { key: "O", label: "Openness", percentile: 81, band_label: "exploratory" },
        { key: "C", label: "Conscientiousness", percentile: 58, band_label: "balanced" },
      ],
      dominant_traits: [
        { key: "O", label: "Openness", percentile: 81, rank: 1 },
      ],
      explainability_summary: {
        headline: "This profile is primarily driven by Openness.",
      },
      comparative_v1: {
        cohort_relative_position: {
          key: "upper_band",
          label: "Above about 81% of the cohort",
          summary: "In the current norming set, your Openness sits above roughly 81% of the anonymized cohort.",
        },
      },
    },
    controlled_narrative_v1: {
      narrative_summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
    },
    comparative_v1: {
      version: "comparative.norming.v1",
      comparative_contract_version: "comparative.norming.v1",
      cohort_relative_position: {
        key: "upper_band",
        label: "Above about 81% of the cohort",
        summary: "In the current norming set, your Openness sits above roughly 81% of the anonymized cohort.",
      },
    },
    public_surface_v1: {
      version: "public.surface.v1",
      entry_surface: "big5_share_landing",
      public_summary_fingerprint: "share-big5-fingerprint",
      discoverability_keys: ["public_safe_summary", "share_landing", "big5_foundation_summary"],
      continue_reading_keys: ["traits.overview", "growth.next_actions"],
      canonical_url: "http://localhost:3000/en/share/share-big5-123",
      robots_policy: "noindex,follow",
      attribution_scope: "share_public_surface",
    },
    insight_graph_v1: {
      version: "insight.graph.v1",
      graph_contract_version: "insight.graph.v1",
      root_node: "result_summary",
      graph_fingerprint: "share-big5-graph-fingerprint",
      graph_scope: "public_share_safe",
      supporting_scales: ["BIG5_OCEAN"],
      nodes: [
        { id: "result_summary", kind: "result_summary", title: "Big Five public summary", summary: "This public-safe Big Five summary keeps the dominant traits, relative position, and entry path visible." },
        { id: "narrative", kind: "narrative", title: "Public summary", summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report." },
        { id: "comparative", kind: "comparative", title: "Above about 81% of the cohort", summary: "In the current norming set, your Openness sits above roughly 81% of the anonymized cohort." },
        { id: "continue_reading", kind: "continue_reading", title: "Continue path", summary: "traits.overview -> growth.next_actions" },
      ],
      edges: [
        { from: "comparative", to: "result_summary", relation: "supports" },
      ],
    },
    embed_surface_v1: {
      version: "embed.surface.v1",
      surface_key: "big5_share_embed_card",
      graph_scope: "public_share_safe",
      entry_surface: "big5_share_landing",
      title: "Big Five public summary",
      summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
      primary_cta_label: "Take the test",
      primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
      continue_target: "traits.overview",
      allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
      embed_fingerprint: "share-big5-embed-fingerprint",
      render_mode: "card",
    },
    widget_surface_v1: {
      version: "widget.surface.v1",
      widget_scope: "public_share_safe",
      widget_contract_version: "widget.surface.v1",
      surface_key: "big5_share_embed_card",
      host_mode: "card",
      slot_key: "public_share_primary",
      size_preset: "summary_card",
      entry_surface: "big5_share_landing",
      title: "Big Five public summary",
      summary: "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report.",
      primary_cta_label: "Take the test",
      primary_cta_path: "/en/tests/big-five-personality-test-ocean-model",
      continue_target: "traits.overview",
      allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
      allowed_edge_types: ["supports"],
      graph_fingerprint: "share-big5-graph-fingerprint",
      embed_fingerprint: "share-big5-embed-fingerprint",
      attribution_scope: "share_public_surface",
    },
    partner_read_v1: {
      version: "partner.read.v1",
      graph_scope: "public_share_safe",
      graph_contract_version: "insight.graph.v1",
      graph_fingerprint: "share-big5-graph-fingerprint",
      supporting_scales: ["BIG5_OCEAN"],
      allowed_node_ids: ["result_summary", "narrative", "comparative", "continue_reading"],
      allowed_edge_types: ["supports"],
      read_scope: "partner_public_read",
      subject_scope: "public_summary_only",
      attribution_scope: "share_public_surface",
    },
  };
}

function createProjectionFixture(): MbtiPublicProjectionV1Raw {
  return {
    canonical_type_code: "ENFP",
    display_type: "ENFP-T",
    runtime_type_code: "ENFP-T",
    variant_code: "T",
    profile: {
      type_name: "Campaigner",
      rarity: {
        label: "Around 6-8%",
      },
      keywords: ["Warm", "Idealistic", "type:TECHNICAL_ONLY"],
    },
    summary_card: {
      title: "Campaigner",
      subtitle: "Warm, imaginative, and emotionally alert",
      summary: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
      tagline: "A public-safe snapshot of this MBTI type.",
      public_tags: ["Warm", "Idealistic", "Sensitive", "axis:EI"],
    },
    dimensions: [
      {
        code: "EI",
        label: "E / I",
        pct: 62,
        side_label: "Extraversion",
        state: "Expressive",
      },
      {
        code: "SN",
        label: "S / N",
        score_pct: 74,
        side_label: "Intuition",
        state: "Pattern-led",
      },
    ],
    _meta: {
      personalization: {
        user_state: {
          feedback_sentiment: "negative",
          feedback_coverage: "explainability_only",
          action_completion_tendency: "warming_up",
          last_deep_read_section: "traits.close_call_axes",
          current_intent_cluster: "clarify_type",
        },
        read_contract_v1: createReadContractFixture(),
      },
    },
  };
}

function createReadContractFixture() {
  return {
    version: "mbti.read_contract.v1",
    canonical_read_model: {
      personalization_fields: ["schema_version", "type_code", "identity", "scene_fingerprint", "action_plan_summary"],
      surface_fields: ["report.summary", "report.sections", "mbti_public_summary_v1", "mbti_public_projection_v1.summary_card"],
      sources: ["report_snapshot", "report_projection"],
    },
    overlay_patch: {
      personalization_fields: ["user_state", "orchestration", "ordered_recommendation_keys", "continuity"],
      surface_fields: [
        "report._meta.personalization.user_state",
        "report._meta.personalization.continuity",
        "mbti_public_projection_v1._meta.personalization.user_state",
        "mbti_public_projection_v1._meta.personalization.continuity",
      ],
      sources: ["attempt_access", "attempt_events", "share_rows"],
    },
    cacheable_fields: ["report", "mbti_public_projection_v1", "mbti_public_summary_v1", "mbti_read_contract_v1"],
    non_cacheable_fields: [
      "report._meta.personalization.user_state",
      "report._meta.personalization.continuity",
      "mbti_public_projection_v1._meta.personalization.user_state",
      "mbti_public_projection_v1._meta.personalization.continuity",
    ],
    telemetry_parity_fields: [
      "user_state",
      "continuity.carryover_focus_key",
      "continuity.carryover_reason",
      "ordered_recommendation_keys",
    ],
  };
}

describe("MBTI share consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    window.sessionStorage.clear();
    hoisted.pathname = "/en/share/share-123";
    hoisted.search = "utm_source=wechat&utm_medium=organic&utm_campaign=spring";
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/result/attempt-123",
    });

    hoisted.getShareSummary.mockResolvedValue(createShareFixture());
    hoisted.trackShareClick.mockResolvedValue({
      ok: true,
      id: "click-123",
      share_id: "share-123",
      recorded_at: "2026-03-12T00:00:00.000Z",
    });
    hoisted.createMbtiCompareInvite.mockResolvedValue({
      ok: true,
      invite_id: "invite-456",
      share_id: "share-123",
      scale_code: "MBTI",
      locale: "en",
      status: "pending",
      take_path: "/en/tests/mbti-personality-test-16-personality-types/take",
      compare_path: "/en/compare/mbti/invite-456",
    });
  });

  it("renders the lightweight public summary, consumes dimensions.pct, and keeps paid content hidden", async () => {
    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-share-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "ENFP-T" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "ENFP" })).not.toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-share-summary-card")).getByText("Campaigner")).toBeInTheDocument();
    expect(screen.getByText("Warm, imaginative, and emotionally alert")).toBeInTheDocument();
    expect(screen.getByText("This public MBTI share page keeps only the lightweight result summary and never exposes paid content.")).toBeInTheDocument();
    expect(screen.getByTestId("share-public-insight-grid")).toHaveTextContent(
      "This public-safe summary keeps the main signal readable without exposing the private report."
    );
    expect(screen.getByTestId("share-public-insight-grid")).toHaveTextContent(
      "In the current norming set, this profile signal sits above roughly 62% of the anonymized cohort."
    );
    expect(screen.getByTestId("share-widget-surface")).toHaveTextContent("Embeddable insight widget");
    expect(screen.getByTestId("share-widget-node-list")).toHaveTextContent("Campaigner");
    expect(screen.getByTestId("share-widget-node-list")).toHaveTextContent("Continue path");
    expect(screen.getByTestId("share-widget-host-meta")).toHaveTextContent("card");
    expect(screen.getByTestId("share-widget-host-meta")).toHaveTextContent("public_share_primary");
    expect(screen.getByTestId("share-widget-host-meta")).toHaveTextContent("summary_card");
    expect(screen.getByTestId("share-partner-read-scope")).toHaveTextContent("public_share_safe");
    expect(screen.getByTestId("share-partner-read-scope")).toHaveTextContent("partner_public_read");
    expect(screen.getByTestId("share-landing-surface")).toHaveTextContent("Public-safe next step");
    expect(screen.getByTestId("share-landing-surface")).toHaveTextContent("Open MBTI topic");
    expect(screen.getByTestId("share-answer-surface")).toHaveTextContent("Public-safe answer");
    expect(screen.getByTestId("share-answer-surface")).toHaveTextContent("Can this page replace the full report?");
    expect(screen.getByTestId("mbti-share-carryover-entry")).toHaveTextContent("Start next with Career next step");
    expect(screen.getByTestId("mbti-share-carryover-entry")).toHaveTextContent(
      "The current focus has already moved into the career bridge"
    );
    expect(screen.getByTestId("mbti-share-carryover-cta").getAttribute("href")).toContain(
      "carryover_focus_key=career.next_step"
    );
    expect(screen.getByTestId("mbti-share-carryover-cta").getAttribute("href")).toContain(
      "current_intent_cluster=clarify_type"
    );
    expect(screen.getByText("Around 6-8%")).toBeInTheDocument();
    expect(screen.getByText("Warm", { exact: true })).toBeInTheDocument();
    expect(screen.getByText("62%")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite a friend to compare" })).toBeInTheDocument();

    expect(screen.queryByText("Legacy title should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy subtitle should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy summary should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy profile summary should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy identity summary should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy tag should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Unlock full report")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid-only reading")).not.toBeInTheDocument();
    expect(screen.queryByText("Career chapter")).not.toBeInTheDocument();
    expect(screen.queryByText("type:ENFP-T")).not.toBeInTheDocument();
    expect(screen.queryByText("axis:EI")).not.toBeInTheDocument();
    expect(screen.queryByText("role:explorer")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "mbti_share_public_surface",
          entrySurface: "mbti_share_landing",
          attributionScope: "share_public_surface",
          publicSummaryFingerprint: "share-fingerprint-123",
          continueTarget: "career.next_step",
        })
      );

      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "share_carryover_entry",
          continueTarget: "share_take_flow",
          ctaKey: "share_carryover_entry",
          carryoverFocusKey: "career.next_step",
          carryoverReason: "continue_career_bridge",
          recommendedResumeKeys: "career.next_step|career.work_experiments",
          carryoverSceneKeys: "work|growth",
          carryoverActionKeys: "career_next_step.theme.clarify_decision_criteria",
          feedbackSentiment: "negative",
          feedbackCoverage: "explainability_only",
          actionCompletionTendency: "warming_up",
          lastDeepReadSection: "traits.close_call_axes",
          currentIntentCluster: "clarify_type",
        })
      );

      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "share_widget_surface",
          embedSurfaceKey: "mbti_share_embed_card",
          graphScope: "public_share_safe",
          graphFingerprint: "graph-fingerprint-123",
          readScope: "partner_public_read",
          subjectScope: "public_summary_only",
          embedFingerprint: "embed-fingerprint-123",
          widgetScope: "public_share_safe",
          widgetContractVersion: "widget.surface.v1",
          hostMode: "card",
          slotKey: "public_share_primary",
          sizePreset: "summary_card",
          supportingScales: "MBTI|BIG5_OCEAN",
        })
      );

      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "share_landing_surface",
          continueTarget: "/en/topics/mbti",
          landingScope: "public_share_safe",
          attributionScope: "share_public_surface",
        })
      );
    });

    fireEvent.click(screen.getByTestId("mbti-share-carryover-cta"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "share_carryover_entry",
        interaction: "click",
        continueTarget: "share_take_flow",
        ctaKey: "share_carryover_entry",
        ctaRank: 1,
        carryoverFocusKey: "career.next_step",
        feedbackSentiment: "negative",
        feedbackCoverage: "explainability_only",
        actionCompletionTendency: "warming_up",
        lastDeepReadSection: "traits.close_call_axes",
        currentIntentCluster: "clarify_type",
      })
    );

    fireEvent.click(screen.getAllByRole("link", { name: "Start MBTI test" })[0]!);

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "mbti_share_public_surface",
        interaction: "return_to_test",
        entrySurface: "mbti_share_landing",
        attributionScope: "share_public_surface",
        publicSummaryFingerprint: "share-fingerprint-123",
      })
    );

    fireEvent.click(screen.getByTestId("share-widget-continue-cta"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "share_widget_surface",
        interaction: "continue",
        embedSurfaceKey: "mbti_share_embed_card",
        graphScope: "public_share_safe",
        graphFingerprint: "graph-fingerprint-123",
        readScope: "partner_public_read",
        subjectScope: "public_summary_only",
        embedFingerprint: "embed-fingerprint-123",
        widgetScope: "public_share_safe",
        widgetContractVersion: "widget.surface.v1",
        hostMode: "card",
        slotKey: "public_share_primary",
        sizePreset: "summary_card",
      })
    );
  });

  it("renders a Big Five public-safe share summary and continue entry from backend authority", async () => {
    hoisted.getShareSummary.mockResolvedValueOnce(createBig5ShareFixture());

    render(<ShareClient locale="en" shareId="share-big5-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-share-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByRole("heading", { name: "BIG5" })).toBeInTheDocument();
    expect(within(screen.getByTestId("mbti-share-summary-card")).getByText("Big Five public summary")).toBeInTheDocument();
    expect(screen.getByText("This public-safe Big Five summary keeps the dominant traits, relative position, and entry path visible.")).toBeInTheDocument();
    expect(screen.getByTestId("share-public-insight-grid")).toHaveTextContent(
      "This public-safe Big Five read keeps the high-level trait story visible without exposing the deeper report."
    );
    expect(screen.getByTestId("share-widget-surface")).toHaveTextContent("Embeddable insight widget");
    expect(screen.getByTestId("share-widget-node-list")).toHaveTextContent("Big Five public summary");
    expect(screen.getByTestId("share-partner-read-scope")).toHaveTextContent("public_share_safe");
    expect(screen.getByTestId("share-public-continue-entry")).toHaveTextContent("Continue into the full result path");
    expect(screen.getByTestId("share-public-continue-cta")).toHaveAttribute(
      "href",
      expect.stringContaining("/en/tests/big-five-personality-test-ocean-model")
    );

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "big5_share_public_surface",
        entrySurface: "big5_share_landing",
        publicSummaryFingerprint: "share-big5-fingerprint",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_impression",
      expect.objectContaining({
        visual_kind: "share_widget_surface",
        embedSurfaceKey: "big5_share_embed_card",
        graphFingerprint: "share-big5-graph-fingerprint",
        readScope: "partner_public_read",
        widgetScope: "public_share_safe",
        hostMode: "card",
      })
    );
  });

  it("sends normalized share-click meta.utm and writes dedupe only after click success", async () => {
    const pendingClick = deferred<{
      ok: boolean;
      id: string;
      share_id: string;
      recorded_at: string;
    }>();
    hoisted.trackShareClick.mockReturnValueOnce(pendingClick.promise);

    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(hoisted.trackShareClick).toHaveBeenCalledTimes(1);
    });

    expect(hoisted.trackShareClick).toHaveBeenCalledWith({
      shareId: "share-123",
      anonId: "anon_share_test",
      locale: "en",
      meta: {
        entrypoint: "share_page",
        landing_path: "/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring",
        referrer: "https://example.com/en/result/redacted",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "spring",
          term: null,
          content: null,
        },
        compare_intent: false,
      },
    });

    const dedupeKey = "fm_share_click_v1:share-123:/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring";
    expect(window.sessionStorage.getItem(dedupeKey)).toBeNull();

    pendingClick.resolve({
      ok: true,
      id: "click-123",
      share_id: "share-123",
      recorded_at: "2026-03-12T00:00:00.000Z",
    });

    await waitFor(() => {
      expect(window.sessionStorage.getItem(dedupeKey)).toBe("click-123");
    });

    await waitFor(() => {
      const href = screen.getAllByRole("link", { name: "Start MBTI test" })[0]?.getAttribute("href") ?? "";
      expect(href).toContain("share_click_id=click-123");
      expect(href).toContain("carryover_focus_key=career.next_step");
      expect(href).toContain("current_intent_cluster=clarify_type");
    });
  });

  it("redacts sensitive share-click landing and referrer values before tracking", async () => {
    hoisted.search = "utm_source=wechat&utm_medium=organic&utm_campaign=spring&attempt_id=attempt-secret&fm_token=raw-token";
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/results/attempt-secret?report_url=https%3A%2F%2Fevil.example%2Freport%2Fsecret&token=raw-ref-token",
    });

    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(hoisted.trackShareClick).toHaveBeenCalledTimes(1);
    });

    const payload = hoisted.trackShareClick.mock.calls[0]?.[0];
    expect(payload).toEqual({
      shareId: "share-123",
      anonId: "anon_share_test",
      locale: "en",
      meta: {
        entrypoint: "share_page",
        landing_path: "/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring&attempt_id=redacted&fm_token=redacted",
        referrer: "https://example.com/en/results/redacted?report_url=redacted&token=redacted",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "spring",
          term: null,
          content: null,
        },
        compare_intent: false,
      },
    });
    expect(JSON.stringify(payload)).not.toContain("attempt-secret");
    expect(JSON.stringify(payload)).not.toContain("raw-token");
    expect(JSON.stringify(payload)).not.toContain("raw-ref-token");
  });

  it("creates compare invite from the share page and routes into the take flow with full attribution query", async () => {
    render(<ShareClient locale="en" shareId="share-123" />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Invite a friend to compare" })).toBeEnabled();
    });

    fireEvent.click(screen.getByRole("button", { name: "Invite a friend to compare" }));

    await waitFor(() => {
      expect(hoisted.createMbtiCompareInvite).toHaveBeenCalledWith({
        shareId: "share-123",
        anonId: "anon_share_test",
        locale: "en",
        entrypoint: "share_page",
        referrer: "https://example.com/en/result/redacted",
        landingPath: "/en/share/share-123?utm_source=wechat&utm_medium=organic&utm_campaign=spring",
        compareIntent: true,
        shareClickId: "click-123",
        utm: {
          source: "wechat",
          medium: "organic",
          campaign: "spring",
          term: null,
          content: null,
        },
      });
    });

    await waitFor(() => {
      expect(hoisted.routerPush).toHaveBeenCalledWith(
        "/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=invite-456&share_click_id=click-123&entrypoint=share_compare_invite&landing_path=%2Fen%2Fshare%2Fshare-123%3Futm_source%3Dwechat%26utm_medium%3Dorganic%26utm_campaign%3Dspring&referrer=https%3A%2F%2Fexample.com%2Fen%2Fresult%2Fredacted&compare_intent=true&utm_source=wechat&utm_medium=organic&utm_campaign=spring"
      );
    });
  });

  it("keeps the share page noindexed and derives metadata from the share summary contract", async () => {
    hoisted.getShareSummary.mockResolvedValueOnce({
      ...createShareFixture(),
      locale: "zh",
      public_surface_v1: {
        ...createShareFixture().public_surface_v1,
        canonical_url: "http://localhost:3000/zh/share/share-123",
      },
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "zh",
        id: "share-123",
      }),
    });

    expect(hoisted.getShareSummary).toHaveBeenCalledWith({
      shareId: "share-123",
      locale: "zh",
      cache: "no-store",
    });
    expect(metadata.title).toBe("ENFP-T · Campaigner｜FermatMind");
    expect(metadata.description).toBe(
      "This public MBTI share page keeps only the lightweight result summary and never exposes paid content."
    );
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/zh/share/share-123");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
    });
    expect(metadata.openGraph).toMatchObject({
      title: "ENFP-T · Campaigner｜FermatMind",
      description: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
      url: "http://localhost:3000/zh/share/share-123",
      images: ["http://localhost:3000/og/share/share-123"],
    });
    expect(metadata.twitter).toMatchObject({
      title: "ENFP-T · Campaigner｜FermatMind",
      description: "This public MBTI share page keeps only the lightweight result summary and never exposes paid content.",
      images: ["http://localhost:3000/og/share/share-123"],
    });
  });

  it("normalizes the top-level read contract on the share view model", () => {
    const viewModel = buildSharePageViewModel(createShareFixture());

    expect(viewModel.readContract?.version).toBe("mbti.read_contract.v1");
    expect(viewModel.readContract?.overlayPatch?.personalizationFields).toContain("user_state");
    expect(viewModel.readContract?.nonCacheableFields).toContain("report._meta.personalization.user_state");
    expect(viewModel.readContract?.telemetryParityFields).toContain("continuity.carryover_focus_key");
    expect(viewModel.landingSurface?.entrySurface).toBe("mbti_share_entry");
    expect(viewModel.landingSurface?.ctaBundle[1]?.href).toBe("/en/topics/mbti");
    expect(viewModel.answerSurface?.surfaceType).toBe("mbti_share_public_safe");
    expect(viewModel.answerSurface?.indexabilityState).toBe("noindex");
  });

  it("normalizes RIASEC public share projection without falling back to MBTI identity", () => {
    const viewModel = buildSharePageViewModel({
      ok: true,
      share_id: "share-riasec",
      scale_code: "RIASEC",
      attempt_id: "attempt-riasec",
      title: "RIASEC career interest result",
      primary_cta_label: "Take RIASEC",
      primary_cta_path: "/en/tests/holland-career-interest-test-riasec/take",
      riasec_public_projection_v1: {
        top_code: "IRC",
        primary_type: "I",
        secondary_type: "R",
        tertiary_type: "C",
        scores_0_100: { R: 82, I: 91, A: 44, S: 52, E: 48, C: 76 },
      },
    });

    expect(viewModel.scaleCode).toBe("RIASEC");
    expect(viewModel.card?.displayType).toBe("IRC");
    expect(viewModel.card?.dimensions.map((dimension) => dimension.code)).toEqual(["R", "I", "A", "S", "E", "C"]);
    expect(viewModel.primaryCtaPath).toBe("/en/tests/holland-career-interest-test-riasec/take");
  });

  it("renders share OG from projection and never from legacy aliases", () => {
    const html = renderToStaticMarkup(renderShareOgImage(buildSharePageViewModel(createShareFixture())));

    expect(html).toContain("ENFP-T");
    expect(html).not.toContain(">ENFP<");
    expect(html).toContain("Campaigner");
    expect(html).toContain("This public MBTI share page keeps only the lightweight result summary and never exposes paid content.");
    expect(html).not.toContain("Legacy title should be ignored");
    expect(html).not.toContain("Legacy summary should be ignored");
    expect(html).not.toContain("Legacy tag should be ignored");
  });

  it("falls back from summary to subtitle to tagline while keeping runtime display as the primary share identity", async () => {
    hoisted.getShareSummary.mockResolvedValueOnce({
      ...createShareFixture(),
      mbti_public_projection_v1: {
        ...createProjectionFixture(),
        profile: {
          type_name: "",
        },
        summary_card: {
          title: "Explorer Snapshot",
          subtitle: "Subtitle fallback copy",
          summary: "",
          tagline: "Tagline fallback copy",
        },
      },
    });

    const subtitleMetadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        id: "share-123",
      }),
    });

    expect(subtitleMetadata.title).toBe("ENFP-T｜FermatMind");
    expect(subtitleMetadata.description).toBe("Subtitle fallback copy");

    hoisted.getShareSummary.mockResolvedValueOnce({
      ...createShareFixture(),
      mbti_public_projection_v1: {
        ...createProjectionFixture(),
        summary_card: {
          title: "Campaigner",
          subtitle: "",
          summary: "",
          tagline: "Tagline fallback copy",
        },
      },
    });

    const taglineMetadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        id: "share-123",
      }),
    });

    expect(taglineMetadata.description).toBe("Tagline fallback copy");
  });
});
