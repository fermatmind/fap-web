import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  buildActorsDisplaySurfaceFixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.unmock("next/link");
  vi.unmock("next/navigation");
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

describe("career job detail Actors v4.2 route integration", () => {
  it("renders the Chinese Actors v4.2 display surface when backend returns a valid surface", async () => {
    const html = await renderCareerJobPage("zh", "actors", buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }));

    expect(html).toContain("career-display-surface");
    expect(html).toContain("费马快速判断");
    expect(html).toContain("职业快照：中国大陆参考");
    expect(html).toContain("招聘样本提示：短剧演员岗位常见要求");
    expect(html).toContain("AI 会不会替代演员");
    expect(html).toContain("常见问题");
    expect(html).toContain("测量我的职业兴趣");
    expect(html).not.toContain("career-job-docx-document");
    expect(html).not.toContain("Legacy Actors DOCX body");
  });

  it("renders the English Actors v4.2 display surface without redirecting to the legacy Chinese body", async () => {
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
  ] as const)("renders the selected %s v4.2 display surface when backend returns a valid surface", async (slug, titleEn) => {
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

  it.each([
    ["actuaries", "Actuaries"],
    ["financial-analysts", "Financial Analysts"],
    ["high-school-teachers", "High School Teachers"],
    ["market-research-analysts", "Market Research Analysts"],
    ["architectural-and-engineering-managers", "Architectural and Engineering Managers"],
    ["civil-engineers", "Civil Engineers"],
    ["biomedical-engineers", "Biomedical Engineers"],
    ["dentists", "Dentists"],
  ] as const)("renders the D5 selected %s v4.2 display surface when backend returns a valid surface", async (slug, titleEn) => {
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
  ] as const)("renders the D8 validator-eligible %s v4.2 display surface when backend returns a valid surface", async (slug, titleEn) => {
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

  it("falls back to the existing legacy renderer when display_surface_v1 is invalid", async () => {
    const invalidSurface = buildActorsDisplaySurfaceFixture();
    invalidSurface.surface_version = "invalid";
    const html = await renderCareerJobPage("en", "actors", buildJobBundle({ displaySurface: invalidSurface }));

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Actors DOCX body");
    expect(html).not.toContain("career-display-surface");
  });

  it("keeps non-Actors on the legacy renderer when no display surface exists", async () => {
    const html = await renderCareerJobPage("en", "accountants-and-auditors", buildJobBundle({ slug: "accountants-and-auditors" }));

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Accountants and Auditors DOCX body");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("Fermat Quick Fit");
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

  it("keeps software developers on the legacy renderer even when a display surface is present", async () => {
    const html = await renderCareerJobPage(
      "en",
      "software-developers",
      buildJobBundle({
        slug: "software-developers",
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({
          slug: "software-developers",
          titleEn: "Software Developers",
        }),
      })
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).toContain("Legacy Accountants and Auditors DOCX body");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("Software Developers");
  });

  it("keeps unrelated slugs on the legacy renderer when display_surface_v1 is invalid", async () => {
    const invalidSurface = buildSelectedCareerDisplaySurfaceFixture({
      slug: "writers",
      titleEn: "Writers",
    });
    invalidSurface.asset_version = "v4.1";
    const html = await renderCareerJobPage(
      "en",
      "writers",
      buildJobBundle({
        slug: "writers",
        displaySurface: invalidSurface,
      })
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("Writers is a real backend component-keyed display_surface_v1 test page.");
  });

  it("keeps route slug mismatches on the legacy renderer", async () => {
    const html = await renderCareerJobPage(
      "en",
      "web-developers",
      buildJobBundle({
        slug: "web-developers",
        displaySurface: buildSelectedCareerDisplaySurfaceFixture({
          slug: "marketing-managers",
          titleEn: "Marketing Managers",
        }),
      })
    );

    expect(html).toContain("career-job-docx-document");
    expect(html).not.toContain("career-display-surface");
    expect(html).not.toContain("Marketing Managers");
  });

  it("keeps non-Actors on the legacy renderer when inbound attribution is present", async () => {
    const html = await renderCareerJobPage(
      "en",
      "accountants-and-auditors",
      buildJobBundle({ slug: "accountants-and-auditors" }),
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
      buildJobBundle({ displaySurface: buildActorsDisplaySurfaceFixture() }),
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
