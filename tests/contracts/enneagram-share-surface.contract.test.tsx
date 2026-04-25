import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ShareClient from "@/app/(localized)/[locale]/share/[id]/ShareClient";
import type { ShareSummaryResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/share/share-enneagram-123",
  search: "",
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

function createFixture(scope: "clear" | "close_call" | "diffuse" | "low_quality"): ShareSummaryResponse {
  return {
    ok: true,
    share_id: "share-enneagram-123",
    id: "share-enneagram-123",
    attempt_id: "attempt-enneagram-123",
    scale_code: "ENNEAGRAM",
    locale: "en",
    created_at: "2026-04-25T00:00:00Z",
    enneagram_public_summary_v1: {
      scale_code: "ENNEAGRAM",
      form_code: "enneagram_likert_105",
      form_label: "E105 Standard",
      form_kind: "likert",
      methodology_variant: "self_report_likert",
      primary_candidate: { code: "T1", label: "Type 1", score: 88, rank: 1 },
      second_candidate: { code: "T5", label: "Type 5", score: 79, rank: 2 },
      third_candidate: { code: "T3", label: "Type 3", score: 73, rank: 3 },
      top_types: [
        { code: "T1", label: "Type 1", score: 88, rank: 1 },
        { code: "T5", label: "Type 5", score: 79, rank: 2 },
        { code: "T3", label: "Type 3", score: 73, rank: 3 },
      ],
      all9_profile_mini: [
        { code: "T1", label: "Type 1", score: 88, rank: 1 },
        { code: "T2", label: "Type 2", score: 51, rank: 6 },
        { code: "T3", label: "Type 3", score: 73, rank: 3 },
        { code: "T4", label: "Type 4", score: 49, rank: 7 },
        { code: "T5", label: "Type 5", score: 79, rank: 2 },
        { code: "T6", label: "Type 6", score: 58, rank: 5 },
        { code: "T7", label: "Type 7", score: 61, rank: 4 },
        { code: "T8", label: "Type 8", score: 44, rank: 8 },
        { code: "T9", label: "Type 9", score: 40, rank: 9 },
      ],
      confidence_level: "medium",
      confidence_label: "stable",
      interpretation_scope: scope,
      interpretation_reason: "Scope comes from backend contract.",
      close_call_pair:
        scope === "close_call"
          ? {
              type_a: { code: "T1", label: "Type 1" },
              type_b: { code: "T5", label: "Type 5" },
              trigger_reason: "Top 1 and Top 2 remain close.",
            }
          : null,
      dominance_gap_abs: 9,
      dominance_gap_pct: 4.2,
      compare_compatibility_group: "enneagram_e105",
      cross_form_comparable: false,
      interpretation_context_id: "ctx-enneagram-123",
      registry_release_hash: "sha256:registry",
      content_release_hash: "sha256:content",
      content_snapshot_status: "frozen",
      report_schema_version: "enneagram.report.v2",
      projection_version: "enneagram_public_projection.v2",
      generated_at: "2026-04-25T00:00:00Z",
      public_surface_version: "enneagram_public_summary.v1",
      summary_text: "Public-safe summary text from the backend contract.",
    },
    public_surface_v1: {
      entry_surface: "enneagram_share_entry",
      attribution_scope: "share_public_surface",
      public_summary_fingerprint: "enneagram-public-fingerprint",
      discoverability_keys: ["public_safe_summary"],
      continue_reading_keys: ["share_take_flow"],
    },
  };
}

describe("enneagram share surface contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/share/share-enneagram-123";
    hoisted.search = "";
    hoisted.trackShareClick.mockResolvedValue({ id: "share-click-1" });
  });

  it("chooses the Enneagram share surface instead of MBTI fallback", async () => {
    hoisted.getShareSummary.mockResolvedValue(createFixture("clear"));

    render(<ShareClient locale="en" shareId="share-enneagram-123" />);

    expect(await screen.findByTestId("enneagram-share-summary-card")).toBeInTheDocument();
    expect(screen.queryByTestId("mbti-share-summary-card")).not.toBeInTheDocument();

    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          scale_code: "ENNEAGRAM",
          visual_kind: "enneagram_share_public_surface",
        })
      );
    });
  });

  it("renders clear share state with a primary candidate", async () => {
    hoisted.getShareSummary.mockResolvedValue(createFixture("clear"));

    render(<ShareClient locale="en" shareId="share-enneagram-123" />);

    expect(await screen.findByTestId("enneagram-share-headline")).toHaveTextContent("Type 1");
    expect(screen.getByTestId("enneagram-share-lead")).toHaveTextContent("most likely points to Type 1");
  });

  it("renders close-call share state with a candidate pair", async () => {
    hoisted.getShareSummary.mockResolvedValue(createFixture("close_call"));

    render(<ShareClient locale="en" shareId="share-enneagram-123" />);

    expect(await screen.findByTestId("enneagram-share-close-call")).toHaveTextContent("Type 1 / Type 5");
    expect(screen.getByTestId("enneagram-share-lead")).toHaveTextContent("Type 5 remains a close neighboring candidate");
  });

  it("renders diffuse boundary wording without hard single-type claims", async () => {
    hoisted.getShareSummary.mockResolvedValue(createFixture("diffuse"));

    render(<ShareClient locale="en" shareId="share-enneagram-123" />);
    expect(await screen.findByTestId("enneagram-share-headline")).toHaveTextContent("Diffuse profile");
    expect(screen.getByTestId("enneagram-share-lead")).toHaveTextContent("Top 3 is a better reading entry");
  });

  it("renders low-quality boundary wording", async () => {
    hoisted.getShareSummary.mockResolvedValue(createFixture("low_quality"));

    render(<ShareClient locale="en" shareId="share-enneagram-123" />);
    expect(await screen.findByTestId("enneagram-share-headline")).toHaveTextContent("Wider interpretation boundary");
    expect(screen.getByTestId("enneagram-share-lead")).toHaveTextContent("interpretation boundary is wider");
  });
});
