import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PublicReviewStatus } from "@/components/public-content/PublicReviewStatus";
import { TrustStrip } from "@/components/career/TrustStrip";
import { getSupportArticle } from "@/lib/cms/supportTrust";
import { normalizePublicReview } from "@/lib/public-content/publicReview";

const ROOT = process.cwd();

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("SOLO-OWNER-REVIEW-WEB-07 public review contract", () => {
  it("accepts only the exact redacted backend contract and normalizes UTC precision", () => {
    expect(
      normalizePublicReview({
        review_state: "approved",
        last_reviewed_at: "2026-07-18T12:00:00.123456Z",
        reviewer: null,
      })
    ).toEqual({
      reviewState: "approved",
      lastReviewedAt: "2026-07-18T12:00:00.123Z",
      reviewer: null,
    });
  });

  it.each([
    ["missing contract", undefined],
    ["missing reviewer", { review_state: "approved", last_reviewed_at: null }],
    ["private reviewer identity", { review_state: "approved", last_reviewed_at: null, reviewer: { name: "Private" } }],
    ["legacy state", { review_state: "reviewed", last_reviewed_at: null, reviewer: null }],
    ["malformed timestamp", { review_state: "approved", last_reviewed_at: "2026-07-18", reviewer: null }],
  ])("fails %s closed", (_label, payload) => {
    expect(normalizePublicReview(payload)).toEqual({
      reviewState: "unknown",
      lastReviewedAt: null,
      reviewer: null,
    });
  });

  it("renders the locked completion copy only for approved", () => {
    const approved = normalizePublicReview({
      review_state: "approved",
      last_reviewed_at: "2026-07-18T12:00:00Z",
      reviewer: null,
    });
    const { rerender } = render(<PublicReviewStatus review={approved} locale="zh" testId="review" />);

    expect(screen.getByTestId("review")).toHaveTextContent("人工审核完成");
    expect(screen.getByTestId("review")).not.toHaveTextContent("Reviewer");

    for (const reviewState of ["pending", "rejected", "unknown"] as const) {
      rerender(
        <PublicReviewStatus
          review={{ reviewState, lastReviewedAt: "2026-07-18T12:00:00.000Z", reviewer: null }}
          locale="en"
          testId="review"
        />
      );
      expect(screen.queryByTestId("review")).toBeNull();
    }
  });

  it("keeps Career trust display on the normalized contract instead of the legacy status", () => {
    render(
      <TrustStrip
        locale="en"
        reviewerStatus="reviewed"
        publicReview={{ reviewState: "pending", lastReviewedAt: null, reviewer: null }}
        indexState="indexable"
        testId="career-review"
      />
    );

    expect(screen.getByTestId("career-review")).not.toHaveTextContent("Human review completed");
    expect(screen.getByTestId("career-review")).not.toHaveTextContent("reviewer_status");
    expect(screen.getByTestId("career-review")).toHaveTextContent("index_state: indexable");
  });

  it("normalizes Support records and ignores a legacy reviewer fallback", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          article: {
            id: 1,
            slug: "review-contract",
            title: "Review contract",
            locale: "en",
            status: "published",
            review_state: "approved",
            last_reviewed_at: "2026-07-18T12:00:00Z",
            reviewer: null,
            reviewer_name: "Legacy Private Reviewer",
          },
        })
      )
    );

    const article = await getSupportArticle("review-contract", "en");
    expect(article?.publicReview).toEqual({
      reviewState: "approved",
      lastReviewedAt: "2026-07-18T12:00:00.000Z",
      reviewer: null,
    });
    expect(JSON.stringify(article)).not.toContain("Legacy Private Reviewer");
  });

  it("wires Article, Personality, Career, Research, and Support consumers without SEO surface edits", () => {
    const sourcePaths = [
      "app/(localized)/[locale]/articles/[slug]/page.tsx",
      "components/personality/PublicContentAssetRenderer.tsx",
      "components/career/TrustStrip.tsx",
      "components/research/ResearchReportPage.tsx",
      "components/support/SupportTrustDetailTemplate.tsx",
    ];

    for (const sourcePath of sourcePaths) {
      const source = fs.readFileSync(path.join(ROOT, sourcePath), "utf8");
      expect(source).toContain("PublicReviewStatus");
    }
  });
});
