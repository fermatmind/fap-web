import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptCareerJobBundle } from "@/lib/career/adapters/adaptCareerJobBundle";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";

const SEO_TITLE = "会计师和审计师｜FermatMind 职业库";
const SEO_DESCRIPTION =
  "会计师和审计师不是单纯处理数字的岗位。它的核心，是把组织经营活动转化为可核对、可比较、可追踪的财务信息。";
const CANONICAL = "https://fermatmind.com/zh/career/jobs/accountants-and-auditors";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function buildCareerJobBundlePayload() {
  return {
    identity: { canonical_slug: "accountants-and-auditors" },
    titles: {
      canonical_en: "Accountants and Auditors",
      canonical_zh: "会计师和审计师",
    },
    truth_layer: {
      summary: "Local bundle summary should not own SEO metadata.",
      median_pay_usd_annual: 81110,
      outlook_pct_2024_2034: 5,
      entry_education: "Bachelor's degree",
      work_experience: "None",
      on_the_job_training: "None",
    },
    score_bundle: {
      fit_score: { value: 75, integrity_state: "full", degradation_factor: 1 },
      strain_score: { value: 42, integrity_state: "full", degradation_factor: 1 },
      ai_survival_score: { value: 61, integrity_state: "full", degradation_factor: 1 },
      mobility_score: { value: 67, integrity_state: "full", degradation_factor: 1 },
      confidence_score: { value: 82, integrity_state: "full", degradation_factor: 1 },
    },
    claim_permissions: {
      allow_strong_claim: true,
      allow_salary_comparison: true,
      allow_ai_strategy: false,
      allow_transition_recommendation: true,
      allow_cross_market_pay_copy: false,
      reason_codes: [],
    },
    trust_manifest: {
      reviewer_status: "reviewed",
      reviewed: true,
      quality: { complete: true, reviewed: true, stale: false, blocked_reasons: [] },
    },
    seo_contract: {
      canonical_path: "/career/jobs/accountants-and-auditors",
      index_state: "indexable",
      index_eligible: true,
    },
    structured_data: {
      occupation: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "Bundle Occupation",
        url: "/zh/career/jobs/accountants-and-auditors",
      },
    },
    seo_authority_v1: {
      seo_surface_v1: {
        metadata_contract_version: "seo.surface.v1",
        surface_type: "career_job_detail",
        canonical_url: CANONICAL,
        robots_policy: "index,follow",
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        structured_data_keys: ["Occupation"],
        index_eligible: true,
        index_state: "indexable",
      },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "会计师和审计师",
        url: CANONICAL,
        mainEntityOfPage: CANONICAL,
        educationRequirements: "Bachelor's degree",
      },
    },
  };
}

function buildTrustBlockedCareerJobBundlePayload() {
  return {
    ...buildCareerJobBundlePayload(),
    trust_manifest: {
      reviewer_status: "reviewed",
      reviewed: true,
      quality: { complete: false, reviewed: true, stale: false, blocked_reasons: [] },
    },
  };
}

function buildSeoAuthorityPublishedWithStaleBundlePayload() {
  return {
    ...buildCareerJobBundlePayload(),
    seo_contract: {
      canonical_path: "/zh/career/jobs/accountants-and-auditors",
      index_state: "locale_not_ready",
      index_eligible: false,
    },
    seo_authority_v1: {
      seo_surface_v1: {
        metadata_contract_version: "seo.surface.v1",
        surface_type: "career_job_detail",
        canonical_url: CANONICAL,
        robots_policy: "index,follow",
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        structured_data_keys: ["Occupation"],
        index_eligible: true,
        index_state: "indexable",
      },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "会计师和审计师",
        url: CANONICAL,
        mainEntityOfPage: CANONICAL,
      },
    },
  };
}

function buildPartialSeoAuthorityWithStaleBundlePayload() {
  return {
    ...buildSeoAuthorityPublishedWithStaleBundlePayload(),
    seo_authority_v1: {
      seo_surface_v1: {
        metadata_contract_version: "seo.surface.v1",
        surface_type: "career_job_detail",
        canonical_url: CANONICAL,
        robots_policy: "index,follow",
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        structured_data_keys: ["Occupation"],
      },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "会计师和审计师",
        url: CANONICAL,
        mainEntityOfPage: CANONICAL,
      },
    },
  };
}

function buildDefaultRobotsSeoAuthorityPayload() {
  return {
    ...buildCareerJobBundlePayload(),
    seo_authority_v1: {
      seo_surface_v1: {
        metadata_contract_version: "seo.surface.v1",
        surface_type: "career_job_detail",
        canonical_url: CANONICAL,
        title: SEO_TITLE,
        description: SEO_DESCRIPTION,
        structured_data_keys: ["Occupation"],
        index_eligible: true,
        index_state: "indexable",
      },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "会计师和审计师",
        url: CANONICAL,
        mainEntityOfPage: CANONICAL,
      },
    },
  };
}

function buildCandidateCareerJobBundlePayload() {
  return {
    ...buildCareerJobBundlePayload(),
    seo_contract: {
      canonical_path: "/zh/career/jobs/accountants-and-auditors",
      index_state: "locale_not_ready",
      index_eligible: false,
    },
    seo_authority_v1: null,
  };
}

function mockCareerJobPageShell() {
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
      usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
    };
  });
  vi.doMock("@/hooks/useAnalytics", () => ({
    AnalyticsPageViewTracker: () => null,
  }));
  vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
    fetchCareerJobBundle: vi.fn(async () => buildCareerJobBundlePayload()),
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
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
});

describe("career job seo.surface.v1 authority contract", () => {
  it("fetches the career job SEO authority endpoint alongside the render bundle", async () => {
    const requestedUrls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requestedUrls.push(url);

        if (url.includes("/api/v0.5/career/jobs/accountants-and-auditors?")) {
          return jsonResponse({
            data: {
              identity: { canonical_slug: "accountants-and-auditors" },
            },
          });
        }

        if (url.includes("/api/v0.5/career-jobs/accountants-and-auditors/seo?")) {
          return jsonResponse({
            seo_surface_v1: {
              metadata_contract_version: "seo.surface.v1",
              title: SEO_TITLE,
              description: SEO_DESCRIPTION,
              canonical_url: CANONICAL,
              robots_policy: "index,follow",
              structured_data_keys: ["Occupation"],
            },
            jsonld: {
              "@context": "https://schema.org",
              "@type": "Occupation",
              name: "会计师和审计师",
            },
          });
        }

        return jsonResponse({ message: "not found" }, 404);
      })
    );

    const payload = await fetchCareerJobBundle({
      locale: "zh",
      slug: "accountants-and-auditors",
      includeSeoAuthority: true,
    });

    expect(requestedUrls.some((url) => url.includes("/api/v0.5/career/jobs/accountants-and-auditors?locale=zh-CN"))).toBe(true);
    expect(
      requestedUrls.some(
        (url) =>
          url.includes("/api/v0.5/career-jobs/accountants-and-auditors/seo?") &&
          url.includes("locale=zh-CN") &&
          url.includes("org_id=0")
      )
    ).toBe(true);
    expect((payload?.data as Record<string, unknown>).seo_authority_v1).toBeTruthy();
  });

  it("adapts metadata and Occupation JSON-LD from backend seo.surface.v1 authority", () => {
    const job = adaptCareerJobBundle({
      locale: "zh",
      requestedSlug: "accountants-and-auditors",
      payload: buildCareerJobBundlePayload(),
    });

    expect(job?.seoSurface?.title).toBe(SEO_TITLE);
    expect(job?.seoSurface?.description).toBe(SEO_DESCRIPTION);
    expect(job?.seoSurface?.canonicalUrl).toBe(CANONICAL);
    expect(job?.seoSurface?.structuredDataKeys).toEqual(["Occupation"]);
    expect(job?.structuredData.occupation?.name).toBe("会计师和审计师");
  });

  it("generates metadata from backend seo.surface.v1 instead of local career bundle copy", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    mockCareerJobPageShell();

    const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });

    expect(metadata.title).toBe(SEO_TITLE);
    expect(metadata.description).toBe(SEO_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(String(metadata.title)).not.toContain(" | FermatMind");
    expect(metadata.description).not.toBe("Local bundle summary should not own SEO metadata.");
  });

  it("renders backend-owned Occupation JSON-LD when the SEO surface declares it", async () => {
    mockCareerJobPageShell();

    const { default: CareerJobDetailPage } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(html).toContain('"@type":"Occupation"');
    expect(html).toContain('"name":"会计师和审计师"');
    expect(html).toContain(CANONICAL);
    expect(html).not.toContain("Bundle Occupation");
  });

  it("keeps robots on backend SEO authority when career trust gates block structured data", async () => {
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
        usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => buildTrustBlockedCareerJobBundlePayload()),
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
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(html).not.toContain('"@type":"Occupation"');
    expect(html).not.toContain('"name":"会计师和审计师"');
  });

  it("lets backend SEO authority override stale locale_not_ready bundle noindex state", async () => {
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
        usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => buildSeoAuthorityPublishedWithStaleBundlePayload()),
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
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });

    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("does not let robots-only SEO authority override stale bundle noindex state", async () => {
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
        usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => buildPartialSeoAuthorityWithStaleBundlePayload()),
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
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });

    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("does not treat defaulted robots as explicit career SEO index authority", async () => {
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
        usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => buildDefaultRobotsSeoAuthorityPayload()),
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
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });

    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });

  it("keeps candidate zh job detail pages noindex when published SEO authority is absent", async () => {
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
        usePathname: vi.fn(() => "/zh/career/jobs/accountants-and-auditors"),
      };
    });
    vi.doMock("@/hooks/useAnalytics", () => ({
      AnalyticsPageViewTracker: () => null,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: vi.fn(async () => buildCandidateCareerJobBundlePayload()),
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
      params: Promise.resolve({ locale: "zh", slug: "accountants-and-auditors" }),
    });

    expect(metadata.robots).toMatchObject({ index: false, follow: false });
  });
});
