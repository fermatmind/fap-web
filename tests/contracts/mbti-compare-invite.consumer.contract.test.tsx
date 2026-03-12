import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CompareClient from "@/app/(localized)/[locale]/compare/mbti/[inviteId]/CompareClient";
import type { MbtiCompareInviteResponse, ShareSummaryResponse } from "@/lib/api/v0_3";

const hoisted = vi.hoisted(() => ({
  pathname: "/en/compare/mbti/invite-123",
  search: "",
  getMbtiCompareInvite: vi.fn(),
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

function createSummaryFixture({
  shareId,
  typeCode,
  typeName,
  subtitle,
}: {
  shareId: string;
  typeCode: string;
  typeName: string;
  subtitle: string;
}): ShareSummaryResponse {
  return {
    ok: true,
    share_id: shareId,
    type_code: typeCode,
    type_name: typeName,
    subtitle,
    summary: `${typeName} public summary`,
    rarity: {
      label: "Around 6-8%",
    },
    tags: ["Warm", "type:TECHNICAL_ONLY", "axis:EI"],
    dimensions: [
      { code: "EI", label: "E / I", pct: 61 },
    ],
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
      typeCode: "ENFP-T",
      typeName: "Campaigner",
      subtitle: "Warm and imaginative",
    }),
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
      typeCode: "INFJ-A",
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
    expect(screen.queryByTestId("mbti-compare-invitee-card")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mbti-compare-summary-card")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Take the MBTI test" })).toHaveAttribute(
      "href",
      "/en/tests/mbti-personality-test-16-personality-types/take?share_id=share-123&compare_invite_id=invite-123&entrypoint=compare_invite_page&landing_path=%2Fen%2Fcompare%2Fmbti%2Finvite-123&referrer=https%3A%2F%2Fexample.com%2Fen%2Fshare%2Fshare-123&compare_intent=true"
    );
  });

  it("renders ready state with inviter, invitee, and public compare summary only", async () => {
    hoisted.getMbtiCompareInvite.mockResolvedValue(createReadyFixture("ready"));

    render(<CompareClient locale="en" inviteId="invite-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("mbti-compare-summary-card")).toBeInTheDocument();
    });

    expect(screen.getByTestId("mbti-compare-status-badge")).toHaveTextContent("Compare ready");
    expect(screen.getByTestId("mbti-compare-inviter-card")).toHaveTextContent("Campaigner");
    expect(screen.getByTestId("mbti-compare-invitee-card")).toHaveTextContent("Advocate");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Shared chemistry and friction points");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Shared axes");
    expect(screen.getByTestId("mbti-compare-summary-card")).toHaveTextContent("Diverging axes");
    expect(screen.getByText("Energy")).toBeInTheDocument();
    expect(screen.getByText("Decision style")).toBeInTheDocument();
    expect(screen.queryByText("Paid offer should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid reading should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Paid section should stay hidden")).not.toBeInTheDocument();
    expect(screen.queryByText("Should never render")).not.toBeInTheDocument();
    expect(screen.queryByText("Private report")).not.toBeInTheDocument();
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
});
