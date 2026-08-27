import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildActorsDisplaySurfaceFixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";
import { CAREER_VISUAL_GROUPS } from "@/lib/career/careerVisualGroups";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
  vi.doUnmock("@/lib/career/api/fetchCareerSalaryAssetPreview");
  vi.doUnmock("@/lib/career/api/fetchCareerAiImpactAssetPreview");
});

function mockRouteRuntime(payload: unknown) {
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
  vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
    fetchCareerJobBundle: vi.fn(async () => payload),
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

async function renderCareerJobPage(
  locale: "en" | "zh",
  slug: string,
  payload: unknown,
  searchParams: Record<string, string | string[] | undefined> = {}
): Promise<string> {
  mockRouteRuntime(payload);

  const { default: Page } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
  const page = await Page({
    params: Promise.resolve({ locale, slug }),
    searchParams: Promise.resolve(searchParams),
  });

  return renderToStaticMarkup(page as ReactNode);
}

async function generateCareerJobMetadata(
  locale: "en" | "zh",
  slug: string,
  payload: unknown
) {
  mockRouteRuntime(payload);

  const { generateMetadata } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
  return generateMetadata({
    params: Promise.resolve({ locale, slug }),
  });
}

function buildJobBundle({
  slug = "actors",
  displaySurface,
  seoContract,
  seoAuthority,
  trustManifest,
}: {
  slug?: string;
  displaySurface?: unknown;
  seoContract?: Record<string, unknown>;
  seoAuthority?: Record<string, unknown>;
  trustManifest?: Record<string, unknown>;
} = {}) {
  const title = slug === "actors" ? "Actors" : "Accountants and Auditors";
  const canonicalPath = `/career/jobs/${slug}`;

  return {
    identity: {
      canonical_slug: slug,
    },
    titles: {
      canonical_en: title,
      canonical_zh: slug === "actors" ? "演员" : "会计师和审计师",
    },
    truth_layer: {
      summary: `${title} legacy summary`,
      median_pay_usd_annual: 75000,
      outlook_pct_2024_2034: 3,
    },
    content_body_md: `# ${title}\n\nLegacy ${title} DOCX body`,
    content_sections: [
      {
        section_key: "legacy_summary",
        title: `Legacy ${title} section`,
        body_md: `Legacy ${title} section body`,
        sort_order: 1,
      },
    ],
    claim_permissions: {
      allow_strong_claim: true,
      allow_salary_comparison: true,
      allow_ai_strategy: false,
      allow_transition_recommendation: false,
      allow_cross_market_pay_copy: false,
      reason_codes: [],
    },
    trust_manifest: trustManifest ?? {
      reviewer_status: "reviewed",
      reviewed: true,
      quality: {
        complete: true,
        reviewed: true,
        stale: false,
        blocked_reasons: [],
      },
      locale_context: {
        locale: "en",
        display_market: "US",
      },
      methodology: {
        crosswalk_mode: "direct_match",
      },
    },
    score_bundle: {
      fit_score: { value: 80, integrity_state: "full", degradation_factor: 1 },
      strain_score: { value: 45, integrity_state: "full", degradation_factor: 1 },
      confidence_score: { value: 88, integrity_state: "full", degradation_factor: 1 },
    },
    seo_contract: seoContract ?? {
      canonical_path: canonicalPath,
      canonical_target: canonicalPath,
      index_state: "index",
      index_eligible: true,
    },
    ...(seoAuthority === undefined ? {} : { seo_authority_v1: seoAuthority }),
    structured_data: {
      occupation: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: title,
        url: canonicalPath,
        mainEntityOfPage: canonicalPath,
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
            name: title,
            item: canonicalPath,
          },
        ],
      },
    },
    ...(displaySurface === undefined ? {} : { display_surface_v1: displaySurface }),
  };
}

function jsonLdPayloads(html: string): string[] {
  return [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/g)].map((match) => match[1] ?? "");
}

describe("career job detail versionless current route integration", () => {
  it("renders the Chinese Actors display surface when backend returns a valid surface", async () => {
    const html = await renderCareerJobPage(
      "zh",
      "actors",
      buildJobBundle({ displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" }) })
    );

    expect(html).toContain("career-display-surface");
    expect(html).toContain("快速判断");
    expect(html).toContain("中国大陆薪资参考");
    expect(html).toContain("市场信号");
    expect(html).toContain("AI 影响");
    expect(html).toContain("FAQ");
    expect(html).toContain("测量我的职业兴趣");
    expect(html).toContain('data-career-production-template="career-production-v1"');
    expect(html).not.toContain("career-job-docx-document");
    expect(html).not.toContain("Legacy Actors DOCX body");
  });

  it("renders the English Actors display surface without redirecting to the legacy Chinese body", async () => {
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }));

    expect(html).toContain("career-display-surface");
    expect(html).toContain("Fermat Quick Fit");
    expect(html).toContain("Career Snapshot: U.S. Reference");
    expect(html).toContain("What Skills Does the Market Signal?");
    expect(html).toContain("Will AI Replace Actors?");
    expect(html).toContain("FAQ");
    expect(html).toContain("Measure my career interests");
    expect(html).not.toContain("career-job-docx-document");
  });

  it.each([
    ["data-scientists", "Data Scientists"],
    ["registered-nurses", "Registered Nurses"],
    ["accountants-and-auditors", "Accountants and Auditors"],
  ] as const)("renders the selected %s display surface when backend returns a valid surface", async (slug, titleEn) => {
    const html = await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      })
    );

    expect(html).toContain("career-display-surface");
    expect(html).toContain(titleEn);
    expect(html).toContain("Fermat Quick Fit");
    expect(html).toContain("Career Snapshot: U.S. Reference");
    expect(html).toContain("What Skills Does the Market Signal?");
    expect(html).toContain("Measure my career interests");
    expect(html).toContain(`subject_key=${slug}`);
    expect(html).not.toContain("career-job-docx-document");
  });

  it("renders the accountants production template in the backend-declared DOM order", async () => {
    const slug = "accountants-and-auditors";
    const displaySurface = buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn: "Accountants and Auditors" });
    const html = await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface,
      })
    );
    const componentOrder = [...html.matchAll(/data-career-component-id="([^"]+)"/g)].map((match) => match[1]);

    expect(html).toContain('data-career-production-template="career-production-v1"');
    expect(componentOrder).toEqual(displaySurface.component_order);
    expect(html).not.toContain("career-job-docx-document");
  });

  it("does not request salary or AI preview sidecars for the accountants production template", async () => {
    const salaryFetch = vi.fn(async () => {
      throw new Error("unexpected salary preview request");
    });
    const aiFetch = vi.fn(async () => {
      throw new Error("unexpected AI preview request");
    });
    vi.doMock("@/lib/career/api/fetchCareerSalaryAssetPreview", () => ({ fetchCareerSalaryAssetPreview: salaryFetch }));
    vi.doMock("@/lib/career/api/fetchCareerAiImpactAssetPreview", () => ({ fetchCareerAiImpactAssetPreview: aiFetch }));
    const slug = "accountants-and-auditors";

    await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn: "Accountants and Auditors" }),
      })
    );

    expect(salaryFetch).not.toHaveBeenCalled();
    expect(aiFetch).not.toHaveBeenCalled();
  });

  it("uses the production renderer and skips sidecars and legacy links for any valid zh Current projection", async () => {
    const salaryFetch = vi.fn(async () => {
      throw new Error("unexpected salary preview request");
    });
    const aiFetch = vi.fn(async () => {
      throw new Error("unexpected AI preview request");
    });
    vi.doMock("@/lib/career/api/fetchCareerSalaryAssetPreview", () => ({ fetchCareerSalaryAssetPreview: salaryFetch }));
    vi.doMock("@/lib/career/api/fetchCareerAiImpactAssetPreview", () => ({ fetchCareerAiImpactAssetPreview: aiFetch }));
    const slug = "precision-agriculture-technicians";
    const html = await renderCareerJobPage(
      "zh",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({
          slug,
          locale: "zh",
          titleEn: "Precision Agriculture Technicians",
          titleZh: "精准农业技术人员",
        }),
      })
    );
    const componentOrder = [...html.matchAll(/data-career-component-id="([^"]+)"/g)].map((match) => match[1]);

    expect(html).toContain('data-career-production-template="career-production-v1"');
    expect(componentOrder).toEqual(CAREER_VISUAL_GROUPS.flatMap((group) => group.componentIds));
    expect(html).not.toContain('data-testid="career-job-related-links"');
    expect(salaryFetch).not.toHaveBeenCalled();
    expect(aiFetch).not.toHaveBeenCalled();
  });

  it("fails closed for declared zh Current projections that are malformed or missing", async () => {
    const slug = "precision-agriculture-technicians";
    const invalidSurface = buildSelectedCareerDisplaySurfaceFixture({ slug, locale: "zh" });
    invalidSurface.component_order[10] = invalidSurface.component_order[9];
    const publishedSeoContract = {
      canonical_path: `/zh/career/jobs/${slug}`,
      canonical_target: `/zh/career/jobs/${slug}`,
      index_state: "indexable",
      index_eligible: true,
      reason_codes: ["validated_display_asset_backed_release", "runtime_publish_projection"],
    };

    await expect(
      renderCareerJobPage("zh", slug, buildJobBundle({ slug, displaySurface: invalidSurface, seoContract: publishedSeoContract }))
    ).rejects.toThrow("not-found");
    await expect(
      renderCareerJobPage("zh", slug, buildJobBundle({ slug, seoContract: publishedSeoContract }))
    ).rejects.toThrow("not-found");
  });

  it("keeps a non-accountants English Current projection on the existing generic renderer", async () => {
    const slug = "precision-agriculture-technicians";
    const html = await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({
          slug,
          titleEn: "Precision Agriculture Technicians",
        }),
      })
    );

    expect(html).toContain("career-display-surface");
    expect(html).not.toContain("data-career-production-template");
  });

  it("accepts an ordered accountants component subset", async () => {
    const slug = "accountants-and-auditors";
    const subsetSurface = buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn: "Accountants and Auditors" });
    const removed = "career_ai_description_block";
    subsetSurface.component_order = subsetSurface.component_order.filter((componentId) => componentId !== removed);
    delete (subsetSurface.page.content as Record<string, unknown>)[removed];

    const html = await renderCareerJobPage("en", slug, buildJobBundle({ slug, displaySurface: subsetSurface }));
    const renderedComponents = [...html.matchAll(/data-career-component-id="([^"]+)"/g)].map((match) => match[1]);
    expect(renderedComponents).not.toContain(removed);
    expect(new Set(renderedComponents)).toEqual(new Set(subsetSurface.component_order));
  });

  it("still fails closed when the accountants projection is missing", async () => {
    const slug = "accountants-and-auditors";
    await expect(renderCareerJobPage("en", slug, buildJobBundle({ slug }))).rejects.toThrow("not-found");
  });

  it.each([
    ["actuaries", "Actuaries"],
    ["financial-analysts", "Financial Analysts"],
    ["high-school-teachers", "High School Teachers"],
    ["market-research-analysts", "Market Research Analysts"],
    ["architectural-and-engineering-managers", "Architectural and Engineering Managers"],
    ["civil-engineers", "Civil Engineers"],
    ["biomedical-engineers", "Biomedical Engineers"],
    ["dentists", "Dentists"],
  ] as const)("renders the D5 selected %s display surface when backend returns a valid surface", async (slug, titleEn) => {
    const html = await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      })
    );

    expect(html).toContain("career-display-surface");
    expect(html).toContain(titleEn);
    expect(html).toContain("Fermat Quick Fit");
    expect(html).toContain("Career Snapshot: U.S. Reference");
    expect(html).toContain("Measure my career interests");
    expect(html).toContain(`subject_key=${slug}`);
    expect(html).not.toContain("career-job-docx-document");
  });

  it.each([
    ["web-developers", "Web Developers"],
    ["marketing-managers", "Marketing Managers"],
    ["lawyers", "Lawyers"],
    ["pharmacists", "Pharmacists"],
    ["acupuncturists", "Acupuncturists"],
    ["business-intelligence-analysts", "Business Intelligence Analysts"],
    ["clinical-data-managers", "Clinical Data Managers"],
    ["budget-analysts", "Budget Analysts"],
    ["human-resources-managers", "Human Resources Managers"],
    ["administrative-services-managers", "Administrative Services Managers"],
    ["advertising-and-promotions-managers", "Advertising and Promotions Managers"],
    ["architects", "Architects"],
    ["air-traffic-controllers", "Air Traffic Controllers"],
    ["airline-and-commercial-pilots", "Airline and Commercial Pilots"],
    ["chemists-and-materials-scientists", "Chemists and Materials Scientists"],
    ["clinical-laboratory-technologists-and-technicians", "Clinical Laboratory Technologists and Technicians"],
    ["community-health-workers", "Community Health Workers"],
    ["compensation-and-benefits-managers", "Compensation and Benefits Managers"],
    ["career-and-technical-education-teachers", "Career and Technical Education Teachers"],
  ] as const)("renders the D8 validator-eligible %s display surface when backend returns a valid surface", async (slug, titleEn) => {
    const html = await renderCareerJobPage(
      "en",
      slug,
      buildJobBundle({
        slug,
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug, titleEn }),
      })
    );

    expect(html).toContain("career-display-surface");
    expect(html).toContain(titleEn);
    expect(html).toContain("Fermat Quick Fit");
    expect(html).toContain("Measure my career interests");
    expect(html).toContain(`subject_key=${slug}`);
    expect(html).not.toContain("career-job-docx-document");
  });

  it("falls back to the existing legacy renderer when display_surface_v1 is missing", async () => {
    const html = await renderCareerJobPage("en", "actors", buildJobBundle());

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Actors DOCX body");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("Fermat Quick Fit");
  });

  it("fails closed when an English display_surface_v1 is invalid", async () => {
    const invalidSurface = buildActorsDisplaySurfaceFixture();
    invalidSurface.surface_version = "invalid";
    await expect(
      renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: invalidSurface }))
    ).rejects.toThrow("not-found");
  });

  it("keeps unrelated jobs on the legacy renderer when no display surface exists", async () => {
    const html = await renderCareerJobPage("en", "writers", buildJobBundle({ slug: "writers" }));

    expect(html).toContain("career-job-docx-document");
    expect(html).not.toContain("career-display-surface");
  });

  it("does not redirect a published English DOCX-baseline job detail page to zh when canonical authority is indexable", async () => {
    const html = await renderCareerJobPage(
      "en",
      "compliance-officers",
      buildJobBundle({
        slug: "compliance-officers",
        trustManifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
          locale_context: {
            locale: "zh-CN",
            display_market: "zh-CN",
          },
          methodology: {
            crosswalk_mode: "docx_baseline",
          },
        },
        seoContract: {
          canonical_path: "/en/career/jobs/compliance-officers",
          canonical_target: "/en/career/jobs/compliance-officers",
          index_state: "index",
          index_eligible: true,
        },
      })
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Accountants and Auditors DOCX body");
    expect(html).not.toContain("redirect:/zh/career/jobs/compliance-officers");
  });

  it("keeps the published English DOCX-baseline canonical self even when the bundle content is zh sourced", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");

    const metadata = await generateCareerJobMetadata(
      "en",
      "compliance-officers",
      buildJobBundle({
        slug: "compliance-officers",
        trustManifest: {
          reviewer_status: "reviewed",
          reviewed: true,
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
          locale_context: {
            locale: "zh-CN",
            display_market: "zh-CN",
          },
          methodology: {
            crosswalk_mode: "docx_baseline",
          },
        },
        seoContract: {
          canonical_path: "/en/career/jobs/compliance-officers",
          canonical_target: "/en/career/jobs/compliance-officers",
          index_state: "index",
          index_eligible: true,
        },
      })
    );

    expect(metadata.alternates?.canonical).toBe("https://fermatmind.com/en/career/jobs/compliance-officers");
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
  });

  it("keeps candidate English DOCX-baseline job detail pages redirected to zh when index authority is absent", async () => {
    await expect(
      renderCareerJobPage(
        "en",
        "compliance-officers",
        buildJobBundle({
          slug: "compliance-officers",
          trustManifest: {
            reviewer_status: "reviewed",
            reviewed: true,
            quality: {
              complete: true,
              reviewed: true,
              stale: false,
              blocked_reasons: [],
            },
            locale_context: {
              locale: "zh-CN",
              display_market: "zh-CN",
            },
            methodology: {
              crosswalk_mode: "docx_baseline",
            },
          },
          seoContract: {
            canonical_path: "/en/career/jobs/compliance-officers",
            canonical_target: "/en/career/jobs/compliance-officers",
            index_state: "locale_not_ready",
            index_eligible: false,
          },
        })
      )
    ).rejects.toThrow("redirect:/zh/career/jobs/compliance-officers");
  });

  it.each(["en", "zh"] as const)("renders software developers on the universal %s surface", async (locale) => {
    const html = await renderCareerJobPage(
        locale,
        "software-developers",
        buildJobBundle({
          slug: "software-developers",
          displaySurface: buildSelectedCareerDisplaySurfaceFixture({
            slug: "software-developers",
            locale,
            titleEn: "Software Developers",
            titleZh: "软件开发者",
          }),
        })
      );
    expect(html).toContain(locale === "zh" ? "软件开发者" : "Software Developers");
    expect(html).toContain("career-display-surface");
  });

  it("fails closed for any English slug when display_surface_v1 is invalid", async () => {
    const invalidSurface = buildSelectedCareerDisplaySurfaceFixture({
      slug: "writers",
      titleEn: "Writers",
    });
    (invalidSurface as Record<string, unknown>).asset_version = "legacy";
    await expect(
      renderCareerJobPage(
        "en",
        "writers",
        buildJobBundle({
          slug: "writers",
          displaySurface: invalidSurface,
        })
      )
    ).rejects.toThrow("not-found");
  });

  it("fails closed when an English display surface slug mismatches the route", async () => {
    await expect(
      renderCareerJobPage(
        "en",
        "web-developers",
        buildJobBundle({
          slug: "web-developers",
          displaySurface: buildSelectedCareerDisplaySurfaceFixture({
            slug: "marketing-managers",
            titleEn: "Marketing Managers",
          }),
        })
      )
    ).rejects.toThrow("not-found");
  });

  it("keeps unrelated legacy jobs on the legacy renderer when inbound attribution is present", async () => {
    const html = await renderCareerJobPage(
      "en",
      "writers",
      buildJobBundle({ slug: "writers" }),
      { utm_source: "zhihu", gclid: "test-gclid" }
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Accountants and Auditors DOCX body");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("holland-career-interest-test-riasec");
    expect(html).not.toContain("utm_source=zhihu");
    expect(html).not.toContain("gclid=test-gclid");
  });

  it("renders an attributed RIASEC CTA on zh legacy canonical job pages", async () => {
    const html = await renderCareerJobPage(
      "zh",
      "data-scientists",
      buildJobBundle({ slug: "data-scientists" }),
      {
        utm_source: "zhihu",
        gclid: "test-gclid",
      }
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("holland-career-interest-test-riasec");
    expect(html).toContain("target_action=start_riasec_test");
    expect(html).toContain("entry_surface=career_job_detail");
    expect(html).toContain("source_page_type=career_job_detail");
    expect(html).toContain("subject_key=data-scientists");
    expect(html).toContain("utm_source=zhihu");
    expect(html).toContain("gclid=test-gclid");
    expect(html).toContain("landing_path=%2Fzh%2Fcareer%2Fjobs%2Fdata-scientists%3Futm_source%3Dzhihu%26gclid%3Dtest-gclid");
    expect(html).toContain('data-entry-surface="career_job_detail"');
    expect(html).toContain('data-target-action="start_riasec_test"');
    expect(html).toContain('data-landing-path="/zh/career/jobs/data-scientists?utm_source=zhihu&amp;gclid=test-gclid"');
  });

  it("renders an attributed RIASEC CTA on zh legacy pages when SEO authority overrides stale locale_not_ready", async () => {
    const html = await renderCareerJobPage(
      "zh",
      "actuaries",
      buildJobBundle({
        slug: "actuaries",
        seoContract: {
          canonical_path: "/zh/career/jobs/actuaries",
          canonical_target: "/zh/career/jobs/actuaries",
          index_state: "locale_not_ready",
          index_eligible: false,
        },
        seoAuthority: {
          seo_surface_v1: {
            metadata_contract_version: "seo.surface.v1",
            surface_type: "career_job_detail",
            canonical_url: "https://fermatmind.com/zh/career/jobs/actuaries",
            robots_policy: "index,follow",
            title: "精算师｜FermatMind 职业库",
            description: "Backend-owned SEO authority for an indexable zh job detail page.",
            structured_data_keys: [],
            index_eligible: true,
            index_state: "indexable",
          },
        },
      })
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("holland-career-interest-test-riasec");
    expect(html).toContain("target_action=start_riasec_test");
    expect(html).toContain("entry_surface=career_job_detail");
    expect(html).toContain("source_page_type=career_job_detail");
    expect(html).toContain("subject_key=actuaries");
    expect(html).toContain('data-entry-surface="career_job_detail"');
    expect(html).toContain('data-target-action="start_riasec_test"');
    expect(html).toContain('data-landing-path="/zh/career/jobs/actuaries"');
  });

  it("emits FAQPage only from visible display FAQ items and keeps hidden FAQ out", async () => {
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }));
    const jsonLd = jsonLdPayloads(html).join("\n");

    expect(jsonLd).toContain('"@type":"FAQPage"');
    expect(jsonLd.match(/"@type":"Question"/g)).toHaveLength(2);
    expect(jsonLd).toContain("Is acting a good career for creative people?");
    expect(jsonLd).not.toContain("Hidden FAQ should not be trusted");
  });

  it("does not emit FAQPage when the visible FAQ section is absent", async () => {
    const noFaqSurface = buildActorsDisplaySurfaceFixture();
    noFaqSurface.page.en.sections = noFaqSurface.page.en.sections.filter((section) => section.component !== "CareerFAQBlock");
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: noFaqSurface }));
    const jsonLd = jsonLdPayloads(html).join("\n");

    expect(html).toContain("career-display-surface");
    expect(jsonLd).not.toContain('"@type":"FAQPage"');
  });

  it("keeps forbidden public fields and unsafe schema types out of route HTML and JSON-LD", async () => {
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }));
    const jsonLd = jsonLdPayloads(html).join("\n");

    expect(html).not.toContain("release_gate");
    expect(html).not.toContain("release_gates");
    expect(html).not.toContain("qa_risk");
    expect(html).not.toContain("admin_review_state");
    expect(html).not.toContain("tracking_json");
    expect(html).not.toContain("raw_ai_exposure_score");
    expect(jsonLd).not.toContain('"@type":"Product"');
    expect(jsonLd).not.toContain("industry_proxy");
    expect(jsonLd).not.toContain("AI Exposure");
    expect(jsonLd).not.toContain("Zhaopin");
  });

  it("keeps the RIASEC CTA attribution values on the rendered route", async () => {
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }));

    expect(html).toContain("holland-career-interest-test-riasec");
    expect(html).toContain("target_action=start_riasec_test");
    expect(html).toContain("entry_surface=career_job_detail");
    expect(html).toContain("source_page_type=career_job_detail");
    expect(html).toContain("subject_key=actors");
    expect(html).toContain('data-target-action="start_riasec_test"');
  });

  it("preserves inbound UTM and click IDs in the server-rendered Actors display CTA href", async () => {
    const html = await renderCareerJobPage(
      "zh",
      "actors",
      buildJobBundle({
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({ slug: "actors", locale: "zh", titleZh: "演员" }),
      }),
      {
        utm_source: "zhihu",
        utm_medium: "community",
        utm_campaign: "career_actor_test",
        utm_content: "pilot",
        gclid: "test-gclid",
        msclkid: "test-msclkid",
        fbclid: "test-fbclid",
      }
    );

    expect(html).toContain("holland-career-interest-test-riasec");
    expect(html).toContain("target_action=start_riasec_test");
    expect(html).toContain("entry_surface=career_job_detail");
    expect(html).toContain("source_page_type=career_job_detail");
    expect(html).toContain("subject_key=actors");
    expect(html).toContain("utm_source=zhihu");
    expect(html).toContain("utm_medium=community");
    expect(html).toContain("utm_campaign=career_actor_test");
    expect(html).toContain("utm_content=pilot");
    expect(html).toContain("gclid=test-gclid");
    expect(html).toContain("msclkid=test-msclkid");
    expect(html).toContain("fbclid=test-fbclid");
    expect(html).toContain(
      "landing_path=%2Fzh%2Fcareer%2Fjobs%2Factors%3Futm_source%3Dzhihu%26utm_medium%3Dcommunity%26utm_campaign%3Dcareer_actor_test%26utm_content%3Dpilot%26gclid%3Dtest-gclid%26msclkid%3Dtest-msclkid%26fbclid%3Dtest-fbclid"
    );
  });

  it("preserves inbound UTM and click IDs in a selected non-Actors display CTA href", async () => {
    const html = await renderCareerJobPage(
      "zh",
      "data-scientists",
      buildJobBundle({
        slug: "data-scientists",
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({
          slug: "data-scientists",
          locale: "zh",
          titleEn: "Data Scientists",
          titleZh: "数据科学家",
        }),
      }),
      {
        utm_source: "zhihu",
        utm_medium: "community",
        utm_campaign: "career_data_test",
        utm_content: "pilot",
        gclid: "test-gclid",
        msclkid: "test-msclkid",
        fbclid: "test-fbclid",
      }
    );

    expect(html).toContain("career-display-surface");
    expect(html).toContain("数据科学家");
    expect(html).toContain("subject_key=data-scientists");
    expect(html).toContain("utm_source=zhihu");
    expect(html).toContain("utm_medium=community");
    expect(html).toContain("utm_campaign=career_data_test");
    expect(html).toContain("utm_content=pilot");
    expect(html).toContain("gclid=test-gclid");
    expect(html).toContain("msclkid=test-msclkid");
    expect(html).toContain("fbclid=test-fbclid");
    expect(html).toContain(
      "landing_path=%2Fzh%2Fcareer%2Fjobs%2Fdata-scientists%3Futm_source%3Dzhihu%26utm_medium%3Dcommunity%26utm_campaign%3Dcareer_data_test%26utm_content%3Dpilot%26gclid%3Dtest-gclid%26msclkid%3Dtest-msclkid%26fbclid%3Dtest-fbclid"
    );
  });
});
