import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("DETAIL_READY_1046_FRONTEND_METADATA_REVALIDATION-01", () => {
  it("uses backend runtime projection authority for robots while keeping gated career content hidden", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/jobs/actors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "actors",
        },
        titles: {
          canonical_en: "Actors",
          canonical_zh: "演员",
        },
        truth_layer: {
          summary: "Gated actor body should not become frontend-visible content.",
        },
        content_body_md: "# Actors\n\nGated DOCX content should remain hidden.",
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: false,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["display_asset_claim_permissions_required"],
        },
        trust_manifest: {
          reviewer_status: "pending",
          reviewed: false,
          quality: {
            complete: false,
            reviewed: false,
            stale: false,
            blocked_reasons: ["compiled_recommendation_snapshot_missing"],
          },
        },
        seo_contract: {
          canonical_path: "/career/jobs/actors",
          canonical_target: "/career/jobs/actors",
          index_state: "indexable",
          index_eligible: true,
          reason_codes: ["validated_display_asset_backed_release", "runtime_publish_projection"],
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRuntimeConfig", () => ({
      fetchCareerRuntimeConfig: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage, generateMetadata } = await import(
      "@/app/(localized)/[locale]/career/jobs/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "actors" }),
    });
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "actors" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(html).toContain('data-renderer-state="blocked"');
    expect(html).not.toContain("Gated actor body should not become frontend-visible content.");
    expect(html).not.toContain("Gated DOCX content should remain hidden.");
    expect(html).not.toContain('"@type":"Occupation"');
  });

  it("keeps backend SEO signals noindexed when runtime projection authority is absent", async () => {
    vi.doMock("next/link", () => ({
      default: ({ href, children, ...props }: { href: string; children: ReactNode }) => (
        <a href={href} {...props}>
          {children}
        </a>
      ),
    }));
    vi.doMock("next/navigation", async () => {
      const actual = await vi.importActual<typeof import("next/navigation")>("next/navigation");
      return {
        ...actual,
        notFound: vi.fn(() => {
          throw new Error("not-found");
        }),
        permanentRedirect: vi.fn((href: string) => {
          throw new Error(`redirect:${href}`);
        }),
        usePathname: vi.fn(() => "/en/career/jobs/candidate-only-role"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "candidate-only-role",
        },
        titles: {
          canonical_en: "Candidate Only Role",
        },
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: false,
          allow_ai_strategy: false,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["candidate_review_required"],
        },
        trust_manifest: {
          reviewer_status: "pending",
          reviewed: false,
        },
        seo_contract: {
          canonical_path: "/career/jobs/candidate-only-role",
          index_state: "indexable",
          index_eligible: true,
          reason_codes: ["candidate_review_required"],
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerRuntimeConfig", () => ({
      fetchCareerRuntimeConfig: vi.fn(async () => null),
    }));

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "candidate-only-role" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
