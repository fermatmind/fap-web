import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CompareClient from "@/app/(localized)/[locale]/compare/mbti/[inviteId]/CompareClient";
import { generateMetadata } from "@/app/(localized)/[locale]/compare/mbti/[inviteId]/page";
import type { MbtiCompareInviteResponse, MbtiCompareParticipantRaw } from "@/lib/api/v0_3";
import { buildCompareInviteViewModel } from "@/lib/mbti/compareInvite";
import { renderCompareOgImage } from "@/lib/og/mbtiCompare";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/compare/mbti/invite-123",
  search: "",
  getMbtiCompareInvite: vi.fn(),
  trackEvent: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => hoisted.pathname,
  useSearchParams: () => new URLSearchParams(hoisted.search),
}));

vi.mock("@/lib/api/v0_3", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api/v0_3")>("@/lib/api/v0_3");

  return {
    ...actual,
    getMbtiCompareInvite: hoisted.getMbtiCompareInvite,
  };
});

vi.mock("@/lib/analytics", () => ({
  trackEvent: hoisted.trackEvent,
}));

function createSummaryFixture({
  shareId,
  canonicalTypeCode,
  displayType,
  typeName,
  subtitle,
}: {
  shareId: string;
  canonicalTypeCode: string;
  displayType: string;
  typeName: string;
  subtitle: string;
}): MbtiCompareParticipantRaw {
  return {
    share_id: shareId,
    type_code: "LEGACY-TYPE",
    type_name: "Legacy type should be ignored",
    subtitle: "Legacy subtitle should be ignored",
    summary: "Legacy summary should be ignored",
    tags: ["Legacy tag should be ignored", "type:TECHNICAL_ONLY"],
    dimensions: [{ code: "EI", label: "Legacy dimension should be ignored", pct: 11 }],
    profile: {
      type_name: "Legacy profile should be ignored",
      short_summary: "Legacy profile summary should be ignored",
    },
    identity_card: {
      title: "Legacy identity title should be ignored",
      summary: "Legacy identity summary should be ignored",
    },
    result: {
      type_code: "LEGACY-RESULT",
      summary: "Legacy result summary should be ignored",
    },
    mbti_public_summary_v1: {
      title: "Legacy public summary should be ignored",
    },
    mbti_public_projection_v1: {
      canonical_type_code: canonicalTypeCode,
      display_type: displayType,
      runtime_type_code: displayType,
      variant_code: displayType.split("-")[1] ?? null,
      profile: {
        type_name: typeName,
        rarity: {
          label: "Around 6-8%",
        },
        keywords: ["Warm", "type:TECHNICAL_ONLY"],
      },
      summary_card: {
        title: typeName,
        subtitle,
        summary: `${typeName} public summary`,
        public_tags: ["Warm", "axis:EI"],
      },
      dimensions: [
        { code: "EI", label: "E / I", pct: 61, side_label: "Extraversion", state: "Expressive" },
      ],
    },
    offers: [{ title: "Paid offer should stay hidden" }],
    recommended_reads: [{ title: "Paid reading should stay hidden" }],
    paid_sections: [{ title: "Paid section should stay hidden" }],
  };
}

function createPendingFixture(): MbtiCompareInviteResponse {
  return {
    ok: true,
    invite_id: "invite-123",
    share_id: "share-123",
    scale_code: "MBTI",
    locale: "en",
    status: "pending",
    inviter: createSummaryFixture({
      shareId: "share-123",
      canonicalTypeCode: "ENFP",
      displayType: "ENFP-T",
      typeName: "Campaigner",
      subtitle: "Warm and imaginative",
    }),
    relationship_sync_v1: {
      relationship_contract_version: "relationship.sync.v1",
      relationship_fingerprint_version: "relationship.sync.fp.v1",
      relationship_fingerprint: "relationship-fingerprint-pending",
      dyadic_scope: "public_compare_invite_safe",
      subject_join_mode: "share_compare_invite_pending",
      shared_count: null,
      diverging_count: null,
      friction_keys: [],
      complement_keys: [],
      communication_bridge_keys: [],
      decision_tension_keys: [],
      stress_interplay_keys: [],
      dyadic_action_prompt_keys: ["dyadic_action.complete_compare_invite"],
      overview: {
        title: "Waiting for the second side",
        summary: "The invite is active. A relationship sync summary appears only after the invitee finishes MBTI.",
      },
      sections: [],
      action_prompt: {
        key: "dyadic_action.complete_compare_invite",
        title: "Complete the compare first",
        summary: "The next meaningful step is for the invitee to finish MBTI so the sync layer can be generated.",
        cta_label: "Continue the compare invite",
        cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
      },
    },
    dyadic_graph_v1: {
      graph_contract_version: "dyadic.graph.v1",
      graph_scope: "public_compare_invite_safe",
      graph_fingerprint: "dyadic-graph-pending",
      root_node: "relationship_sync",
      supporting_scales: ["MBTI"],
      nodes: [{ id: "relationship_sync", kind: "relationship_sync", title: "Waiting for the second side", summary: "Pending sync." }],
      edges: [],
    },
    primary_cta_label: "Take the MBTI test",
    primary_cta_path: "/en/tests/mbti-personality-test-16-personality-types/take",
  };
}

function createReadyFixture(status: "ready" | "purchased"): MbtiCompareInviteResponse {
  return {
    ...createPendingFixture(),
    status,
    invitee: createSummaryFixture({
      shareId: "share-123",
      canonicalTypeCode: "INFJ",
      displayType: "INFJ-A",
      typeName: "Advocate",
      subtitle: "Quietly focused and structured",
    }),
    compare: {
      title: "Shared chemistry and friction points",
      summary: "Both profiles align on idealism, but differ on how quickly they externalize judgment.",
      shared_count: 2,
      diverging_count: 2,
      axes: [
        {
          code: "EI",
          label: "Energy",
          summary: "One leads with outward energy while the other consolidates before responding.",
          state: "Diverging",
          inviter_side: "E",
          invitee_side: "I",
        },
        {
          code: "TF",
          label: "Decision style",
          summary: "Both still care about human impact when making calls.",
          state: "Shared",
          inviter_side: "F",
          invitee_side: "F",
        },
      ],
      paid_sections: [{ title: "Should never render" }],
      report: {
        title: "Private report",
      },
    },
    relationship_sync_v1: {
      relationship_contract_version: "relationship.sync.v1",
      relationship_fingerprint_version: "relationship.sync.fp.v1",
      relationship_fingerprint: "relationship-fingerprint-ready",
      dyadic_scope: "public_compare_invite_safe",
      subject_join_mode: "share_compare_invite_joined",
      shared_count: 2,
      diverging_count: 2,
      friction_keys: ["friction.energy_mismatch"],
      complement_keys: ["complement.heart_head_balance"],
      communication_bridge_keys: ["communication_bridge.energy_pacing"],
      decision_tension_keys: ["decision_tension.logic_vs_empathy"],
      stress_interplay_keys: ["stress_interplay.shared_recovery_rhythm"],
      dyadic_action_prompt_keys: ["dyadic_action.name_decision_rule"],
      overview: {
        title: "Relationship sync summary",
        summary: "A backend-owned dyadic summary.",
      },
      sections: [
        {
          key: "communication_bridge",
          title: "Communication bridge",
          summary: "Name the response pace.",
          bullets: ["Say clearly whether you need to think first or speak first."],
        },
        {
          key: "decision_tension",
          title: "Decision tension",
          summary: "Name the decision rule.",
          bullets: ["Before debating conclusions, say what you are optimizing for."],
        },
      ],
      action_prompt: {
        key: "dyadic_action.name_decision_rule",
        title: "Name the decision rule first",
        summary: "Say what each person is optimizing for before debating the answer.",
      },
    },
    dyadic_graph_v1: {
      graph_contract_version: "dyadic.graph.v1",
      graph_scope: "public_compare_invite_safe",
      graph_fingerprint: "dyadic-graph-ready",
      root_node: "relationship_sync",
      supporting_scales: ["MBTI"],
      nodes: [
        { id: "relationship_sync", kind: "relationship_sync", title: "Relationship sync summary", summary: "A backend-owned dyadic summary." },
        { id: "communication_bridge", kind: "communication_bridge", title: "Communication bridge", summary: "Name the response pace." },
      ],
      edges: [{ from: "communication_bridge", to: "relationship_sync", relation: "supports" }],
    },
  };
}

describe("MBTI compare invite consumer contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    hoisted.pathname = "/en/compare/mbti/invite-123";
    hoisted.search = "";
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/en/share/share-123",
    });
  });

  it("renders pending state with inviter summary and CTA using primary_cta_path", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValue(createPendingFixture());

    render(<CompareClient locale="en" inviteId="invite-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-compare-invite-view")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-compare-status-badge")).toHaveTextContent("Waiting for invitee");
    expect(screen.getByTestId("mbti-compare-inviter-card")).toHaveTextContent("Campaigner");
    expect(screen.getByTestId("mbti-compare-inviter-card")).toHaveTextContent("ENFP-T");
    expect(screen.queryByTestId("mbti-compare-invitee-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-compare-summary-card")).not.toBeInTheDocument();
    expect(screen.getByTestId("mbti-dyadic-sync-card")).toHaveTextContent("Waiting for the second side");
    expect(screen.getByTestId("mbti-dyadic-action-card")).toHaveTextContent("Complete the compare first");
    expect(screen.getByRole("link", { name: "Take the MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=invite-123&entrypoint=compare_invite_page&landing_path=%2Fen%2Fcompare%2Fmbti%2Finvite-123&referrer=https%3A%2F%2Fexample.com%2Fen%2Fshare%2Fshare-123&compare_intent=true"
    );
    await waitFor(() => {
      expect(hoisted.trackEvent).toHaveBeenCalledWith(
        "ui_card_impression",
        expect.objectContaining({
          visual_kind: "dyadic_relationship_sync",
          relationshipScope: "public_compare_invite_safe",
          relationshipContractVersion: "relationship.sync.v1",
          subjectJoinMode: "share_compare_invite_pending",
        })
      );
    });
  });

  it("drops unsafe compare invite CTA paths from the view model", () => {
    const viewModel = buildCompareInviteViewModel({
      ...createPendingFixture(),
      primary_cta_path: "https://evil.example/tests/mbti-personality-test-16-personality-types/take",
      relationship_sync_v1: {
        ...createPendingFixture().relationship_sync_v1,
        action_prompt: {
          key: "unsafe",
          title: "Unsafe action",
          summary: "Unsafe action prompt CTA should not render.",
          cta_label: "Open",
          cta_path: "data:text/html,alert(1)",
        },
      },
    });

    expect(viewModel.primaryCtaPath).toBe("");
    expect(viewModel.relationshipSync?.actionPrompt?.ctaPath).toBe("");
  });

  it("renders ready state with inviter, invitee, and public compare summary only", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValue(createReadyFixture("ready"));

    render(<CompareClient locale="en" inviteId="invite-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-compare-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-compare-status-badge")).toHaveTextContent("Compare ready");
    expect(screen.getByTestId("mbti-compare-inviter-card")).toHaveTextContent("Campaigner");
    expect(screen.getByTestId("mbti-compare-inviter-card")).toHaveTextContent("ENFP-T");
    expect(screen.getByTestId("mbti-compare-invitee-card")).toHaveTextContent("Advocate");
    expect(screen.getByTestId("mbti-compare-invitee-card")).toHaveTextContent("INFJ-A");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Shared chemistry and friction points");
    expect(screen.getByTestId("mbti-dyadic-sync-card")).toHaveTextContent("Relationship sync summary");
    expect(screen.getByTestId("mbti-dyadic-sync-scope")).toHaveTextContent("public_compare_invite_safe");
    expect(screen.getByTestId("mbti-dyadic-action-card")).toHaveTextContent("Name the decision rule first");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Shared axes");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Diverging axes");
    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("Decision style")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dyadic-section-communication_bridge")).toBeInTheDocument();
    expect(screen.getByTestId("mbti-dyadic-section-decision_tension")).toBeInTheDocument();
    expect(screen.queryByText("Legacy type should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy summary should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Legacy tag should be ignored")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid offer should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid reading should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid section should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Should never render")).not.toBeInTheDocument();
    expect(screen.queryByText("Private report")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("mbti-dyadic-section-communication_bridge"));
    fireEvent.click(screen.getByTestId("mbti-dyadic-action-link"));

    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "dyadic_relationship_section",
        sectionKey: "communication_bridge",
        relationshipScope: "public_compare_invite_safe",
      })
    );
    expect(hoisted.trackEvent).toHaveBeenCalledWith(
      "ui_card_interaction",
      expect.objectContaining({
        visual_kind: "dyadic_action_prompt",
        actionKey: "dyadic_action.name_decision_rule",
        relationshipContractVersion: "relationship.sync.v1",
      })
    );
  });

  it("renders purchased state with the purchased badge while keeping ready-state compare content", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValue(createReadyFixture("purchased"));

    render(<CompareClient locale="en" inviteId="invite-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-compare-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-compare-status-badge")).toHaveTextContent("Purchased");
    expect(screen.getByTestId("mbti-compare-invitee-card")).toHaveTextContent("Advocate");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Shared chemistry and friction points");
  });

  it("builds pending metadata from the inviter summary contract and keeps the page noindexed", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValueOnce(createPendingFixture());

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "zh",
        inviteId: "invite-123",
      }),
    });

    expect(hoisted.getMbtiCompareInvite).toHaveBeenCalledWith({
      inviteId: "invite-123",
      locale: "zh",
      cache: "no-store",
    });
    expect(metadata.title).toBe("ENFP-T 邀请你来测 MBTI 并对比｜FermatMind");
    expect(metadata.description).toBe("查看 MBTI 对比邀请");
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/zh/compare/mbti/invite-123");
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      noarchive: true,
      nocache: true,
    });
    expect(metadata.openGraph).toMatchObject({
      title: "ENFP-T 邀请你来测 MBTI 并对比｜FermatMind",
      description: "查看 MBTI 对比邀请",
      url: "http://localhost:3000/zh/compare/mbti/invite-123",
      images: ["http://localhost:3000/og/compare/mbti/invite-123"],
    });
    expect(metadata.twitter).toMatchObject({
      title: "ENFP-T 邀请你来测 MBTI 并对比｜FermatMind",
      description: "查看 MBTI 对比邀请",
      images: ["http://localhost:3000/og/compare/mbti/invite-123"],
    });
  });

  it("builds ready metadata from the compare summary contract", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValueOnce(createReadyFixture("ready"));

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        inviteId: "invite-123",
      }),
    });

    expect(metadata.title).toBe("ENFP-T × INFJ-A MBTI 对比｜FermatMind");
    expect(metadata.description).toBe(
      "Both profiles align on idealism, but differ on how quickly they externalize judgment."
    );
    expect(metadata.alternates?.canonical).toBe("http://localhost:3000/en/compare/mbti/invite-123");
    expect(metadata.openGraph).toMatchObject({
      images: ["http://localhost:3000/og/compare/mbti/invite-123"],
    });
    expect(metadata.twitter).toMatchObject({
      images: ["http://localhost:3000/og/compare/mbti/invite-123"],
    });
  });

  it("renders compare OG title from participant projection and summary from compare flat shell", () => {
    const html = renderToStaticMarkup(renderCompareOgImage(buildCompareInviteViewModel(createReadyFixture("ready"))));

    expect(html).toContain("ENFP-T × INFJ-A");
    expect(html).not.toContain("ENFP × INFJ");
    expect(html).toContain("Shared chemistry and friction points");
    expect(html).toContain("Both profiles align on idealism, but differ on how quickly they externalize judgment.");
    expect(html).not.toContain("Legacy summary should be ignored");
    expect(html).not.toContain("Should never render");
  });

  it("falls back to the generic invite metadata when the contract fetch fails", async () => {
    hoisted.getMbtiCompareInvite.mockRejectedValueOnce(new Error("Compare invite not available."));

    const metadata = await generateMetadata({
      params: Promise.resolve({
        locale: "en",
        inviteId: "invite-404",
      }),
    });

    expect(metadata.title).toBe("MBTI 对比邀请｜FermatMind");
    expect(metadata.description).toBe("查看 MBTI 对比邀请");
    expect(metadata.openGraph).toMatchObject({
      images: ["http://localhost:3000/og/compare/mbti/invite-404"],
    });
    expect(metadata.twitter).toMatchObject({
      images: ["http://localhost:3000/og/compare/mbti/invite-404"],
    });
  });
});
