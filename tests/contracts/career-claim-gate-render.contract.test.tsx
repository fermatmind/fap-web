import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career claim gate render contract", () => {
  it("blocks salary, outlook, fit, and answer surfaces when explicit claim permissions are missing", async () => {
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
        usePathname: vi.fn(() => "/en/career/jobs/product-manager"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "product-manager",
        },
        titles: {
          canonical_en: "Product Manager",
        },
        truth_layer: {
          summary: "Claim-gated product manager summary",
          median_pay_usd_annual: 150000,
          outlook_pct_2024_2034: 12,
          entry_education: "Sensitive education requirement",
          work_experience: "Sensitive experience requirement",
          on_the_job_training: "Sensitive training requirement",
        },
        content_body_md: "# Product Manager\n\nGated DOCX body paragraph",
        content_sections: [
          {
            section_key: "docx_summary",
            title: "Gated DOCX section",
            body_md: "Gated content section body",
          },
        ],
        white_box_scores: {
          strain_score: {
            radar_dimensions: {
              people_friction: 0.64,
              context_switch_load: 0.59,
              political_load: 0.41,
              uncertainty_load: 0.72,
              low_autonomy_trap: 0.53,
              repetition_mismatch: 0.37,
            },
          },
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 70, integrity_state: "provisional", degradation_factor: 0.9 },
        },
        warnings: {
          amber_flags: ["ai_role_shift_risk"],
        },
        seo_contract: {
          canonical_path: "/career/jobs/product-manager",
          index_state: "blocked",
          index_eligible: false,
        },
        structured_data: {
          occupation: {
            "@context": "https://schema.org",
            "@type": "Occupation",
            name: "Product Manager",
            url: "/career/jobs/product-manager",
            mainEntityOfPage: "/career/jobs/product-manager",
          },
          breadcrumb_list: {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Career",
                item: "/career",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Product Manager",
                item: "/career/jobs/product-manager",
              },
            ],
          },
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage, generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });

    expect(html).toContain("career-job-protocol-status");
    expect(html).toContain("career-job-trust-strip");
    expect(html).toContain("career-job-renderer-status");
    expect(html).toContain("data-renderer-state=\"blocked\"");
    expect(html).toContain("Career claim gate");
    expect(html).not.toContain('"@type":"Occupation"');
    expect(html.match(/"@type":"BreadcrumbList"/g)).toHaveLength(1);
    expect(html).toContain("http://localhost:3000/en/career/jobs/product-manager");
    expect(html).toContain("http://localhost:3000/en/career");
    expect(html).not.toContain("Claim-gated product manager summary");
    expect(html).not.toContain("Gated DOCX body paragraph");
    expect(html).not.toContain("Gated DOCX section");
    expect(html).not.toContain("Sensitive education requirement");
    expect(html).not.toContain("Sensitive experience requirement");
    expect(html).not.toContain("Sensitive training requirement");
    expect(html).not.toContain("career-job-docx-document");
    expect(html).not.toContain("career-job-docx-content");
    expect(html).not.toContain("career-job-strain-radar");
    expect(html).not.toContain("career-job-explainability-panel");
    expect(html).not.toContain("$150,000");
    expect(html).not.toContain("Ten-year outlook");
    expect(html).not.toContain("Backend score dimensions");
    expect(metadata.description).not.toContain("Claim-gated product manager summary");
    expect(metadata.robots).toEqual(expect.objectContaining({ index: false, follow: false }));

    const rendererStatusIndex = html.indexOf("career-job-renderer-status");
    const warningIndex = html.indexOf("career-job-warning-banner");
    const trustIndex = html.indexOf("career-job-trust-strip");
    expect(rendererStatusIndex).toBeGreaterThan(-1);
    expect(warningIndex).toBeGreaterThan(rendererStatusIndex);
    expect(trustIndex).toBeGreaterThan(warningIndex);
  });

  it("keeps salary visible but suppresses outlook when the strong-claim gate stays closed", async () => {
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
        usePathname: vi.fn(() => "/en/career/jobs/product-manager"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "product-manager",
        },
        titles: {
          canonical_en: "Product Manager",
        },
        truth_layer: {
          median_pay_usd_annual: 150000,
          outlook_pct_2024_2034: 12,
        },
        claim_permissions: {
          allow_strong_claim: false,
          allow_salary_comparison: true,
          allow_ai_strategy: false,
          allow_transition_recommendation: false,
          allow_cross_market_pay_copy: false,
          reason_codes: ["trust_limited"],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
          confidence_score: { value: 70, integrity_state: "provisional", degradation_factor: 0.9 },
        },
        seo_contract: {
          canonical_path: "/career/jobs/product-manager",
          index_state: "index",
          index_eligible: true,
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain("$150,000");
    expect(html).not.toContain("Ten-year outlook");
    expect(html).not.toContain("Backend score dimensions");
  });

  it("keeps trust-blocked backend SEO index signals noindexed until local claim gates pass", async () => {
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
        usePathname: vi.fn(() => "/en/career/jobs/actors"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "actors",
        },
        titles: {
          canonical_en: "Actors",
        },
        truth_layer: {
          summary: "Claim-gated actors summary should stay hidden.",
        },
        content_body_md: "# Actors\n\nClaim-gated DOCX body should stay hidden.",
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
          robots_policy: "index,follow",
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

    const { default: CareerJobDetailPage, generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "actors" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "actors" }),
    });

    expect(html).toContain("data-renderer-state=\"blocked\"");
    expect(html).not.toContain("Claim-gated actors summary should stay hidden.");
    expect(html).not.toContain("Claim-gated DOCX body should stay hidden.");
    expect(metadata.robots).toEqual(expect.objectContaining({ index: false, follow: false }));
  });

  it("renders DOCX job content and structured data after trust and claim gates pass", async () => {
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
        usePathname: vi.fn(() => "/en/career/jobs/product-manager"),
      };
    });
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", async () => {
      const actual = await vi.importActual<typeof import("@/lib/i18n/locales")>("@/lib/i18n/locales");
      return {
        ...actual,
        localizedPath: vi.fn((pathname: string, locale: string) => `/${locale}${pathname}`),
      };
    });
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => ({
        identity: {
          canonical_slug: "product-manager",
        },
        titles: {
          canonical_en: "Product Manager",
        },
        truth_layer: {
          summary: "Approved product manager summary",
        },
        content_body_md: "# Product Manager\n\nApproved DOCX body paragraph",
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        trust_manifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
        },
        score_bundle: {
          fit_score: { value: 81, integrity_state: "full", degradation_factor: 1 },
        },
        seo_contract: {
          canonical_path: "/career/jobs/product-manager",
          index_state: "index",
          index_eligible: true,
        },
        structured_data: {
          occupation: {
            "@context": "https://schema.org",
            "@type": "Occupation",
            name: "Product Manager",
            url: "/career/jobs/product-manager",
            mainEntityOfPage: "/career/jobs/product-manager",
          },
        },
        seo_authority_v1: {
          seo_surface_v1: {
            metadata_contract_version: "seo.surface.v1",
            surface_type: "career_job_detail",
            canonical_url: "https://fermatmind.com/en/career/jobs/product-manager",
            robots_policy: "index,follow",
            title: "Product Manager | FermatMind Career Library",
            description: "Backend SEO authority summary for product manager.",
            structured_data_keys: ["Occupation"],
            index_eligible: true,
            index_state: "indexable",
          },
          jsonld: {
            "@context": "https://schema.org",
            "@type": "Occupation",
            name: "Product Manager",
            url: "https://fermatmind.com/en/career/jobs/product-manager",
            mainEntityOfPage: "https://fermatmind.com/en/career/jobs/product-manager",
          },
        },
      })),
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobExplainability", () => ({
      fetchCareerJobExplainability: vi.fn(async () => null),
    }));
    vi.doMock("@/lib/career/api/fetchCareerFirstWaveNextStepLinks", () => ({
      fetchCareerFirstWaveNextStepLinks: vi.fn(async () => null),
    }));

    const { default: CareerJobDetailPage, generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });
    const html = renderToStaticMarkup(page as ReactNode);
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "en", slug: "product-manager" }),
    });

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Approved DOCX body paragraph");
    expect(html).toContain('"@type":"Occupation"');
    expect(metadata.description).toContain("Backend SEO authority summary for product manager.");
    expect(metadata.robots).toEqual(expect.objectContaining({ index: true, follow: true }));
  });
});
