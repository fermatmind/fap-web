import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  adaptCareerJobDetail,
  adaptCareerJobSeoPayload,
  buildCareerJobFrontendUrl,
  getCareerJobFromCmsBySlug,
  listCareerJobsFromCms,
  mapFrontendLocaleToCareerApiLocale,
} from "@/lib/cms/career-jobs";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

const ROOT = process.cwd();

function read(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe("career jobs cms adapter contract", () => {
  it("maps frontend locale and href conventions", () => {
    expect(mapFrontendLocaleToCareerApiLocale("en")).toBe("en");
    expect(mapFrontendLocaleToCareerApiLocale("zh")).toBe("zh-CN");
    expect(buildCareerJobFrontendUrl("en", "Product-Manager")).toBe("/en/career/jobs/product-manager");
    expect(buildCareerJobFrontendUrl("zh", "Product-Manager")).toBe("/zh/career/jobs/product-manager");
  });

  it("requests the list endpoint with backend locale mapping and returns localized hrefs", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);

        expect(url).toContain("/api/v0.5/career-jobs?");
        expect(url).toContain("locale=zh-CN");
        expect(url).toContain("org_id=0");

        return jsonResponse({
          ok: true,
          items: [
            {
              slug: "product-manager",
              locale: "zh-CN",
              title: "产品经理",
              excerpt: "负责用户、业务与工程目标之间的协同。",
              salary: {
                raw: "年薪 30 万-60 万人民币",
              },
            },
          ],
          pagination: {
            current_page: 1,
            per_page: 20,
            total: 1,
            last_page: 1,
          },
        });
      })
    );

    const items = await listCareerJobsFromCms({ locale: "zh" });

    expect(items).toHaveLength(1);
    expect(items[0]?.href).toBe("/zh/career/jobs/product-manager");
    expect(items[0]?.salaryText).toBe("年薪 30 万-60 万人民币");
  });

  it("adapts detail payload defensively and keeps body markdown intact", () => {
    const detail = adaptCareerJobDetail(
      {
        slug: "product-manager",
        occupation_uuid: "occ_product_manager",
        locale: "en",
        title: "Product Manager",
        excerpt: "Shape product direction across user and business goals.",
        body_md: "# Product Manager\n\n- Define strategy",
        salary: {
          raw: "USD 80,000 - 180,000 annually",
          low: 80000,
          high: 180000,
        },
        growth_path: {
          raw: "Associate PM\nProduct Manager\nSenior PM",
        },
        fit_personality_codes: null,
        mbti_primary_codes: ["INTJ"],
        mbti_secondary_codes: ["ENTJ"],
        riasec_profile: {
          I: 70,
          E: 60,
        },
        work_contents: {
          items: ["Define product strategy"],
        },
        skills: {
          core: ["roadmapping"],
          supporting: ["stakeholder management"],
        },
        trust_manifest: {
          manifest_version: "trust_manifest.v1",
          entity_id: "occ_product_manager",
          page_type: "career_job_detail",
          page_slug: "product-manager",
          content_version: "content.v1",
          data_version: "data.v1",
          logic_version: "logic.v1",
          locale_context: {
            truth_market: "US",
            display_market: "US",
            locale: "en",
          },
          source_trace: [],
          methodology: {
            crosswalk_mode: "exact",
            derivation_policy: "job_detail_projection",
            notes: [],
          },
          reviewer: {
            reviewed: true,
            reviewer_id: "career_editor",
            reviewer_status: "approved",
          },
          ai_assistance: {
            used: true,
            summary: "surface drafting only",
          },
          quality: {
            complete: true,
            reviewed: true,
            stale: false,
            blocked_reasons: [],
          },
          last_substantive_update_at: "2026-04-08T00:00:00.000Z",
          next_review_due_at: "2026-07-08T00:00:00.000Z",
        },
        claim_permissions: {
          allow_strong_claim: true,
          allow_salary_comparison: true,
          allow_ai_strategy: true,
          allow_transition_recommendation: true,
          allow_cross_market_pay_copy: false,
          reason_codes: [],
        },
        index_eligible: true,
        index_state: "promotion_candidate",
      },
      {
        locale: "en",
        sections: [],
        seoMeta: null,
      }
    );

    expect(detail).not.toBeNull();
    expect(detail?.salaryText).toBe("USD 80,000 - 180,000 annually");
    expect(detail?.growthPathItems).toEqual(["Associate PM", "Product Manager", "Senior PM"]);
    expect(detail?.fitPersonalityItems).toEqual([]);
    expect(detail?.bodyMarkdown).toContain("# Product Manager");
    expect(detail?.workContents).toEqual(["Define product strategy"]);
    expect(detail?.skills).toEqual(["roadmapping", "stakeholder management"]);
    expect(detail?.riasecVector.I).toBe(70);
    expect(detail?.riasecVector.R).toBeNull();
    expect(detail?.landingSurface).toBeNull();
    expect(detail?.answerSurface).toBeNull();
    expect(detail?.protocol.claimPermissions.allow_salary_comparison).toBe(true);
    expect(detail?.protocol.trustManifest?.quality.complete).toBe(true);
    expect(detail?.renderState.canRenderSalarySurface).toBe(true);
    expect(detail?.renderState.canRenderFitSurface).toBe(true);
    expect(detail?.renderState.canIndexPage).toBe(true);
  });

  it("normalizes answer surface from the backend detail authority", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        jsonResponse({
          ok: true,
          job: {
            slug: "product-manager",
            locale: "en",
            title: "Product Manager",
            excerpt: "Shape product direction across user and business goals.",
            is_public: true,
            is_indexable: true,
          },
          sections: [],
          seo_meta: null,
          answer_surface_v1: {
            answer_contract_version: "answer.surface.v1",
            answer_scope: "public_indexable_detail",
            surface_type: "career_job_public_detail",
            summary_blocks: [
              {
                key: "job_summary",
                body: "Shape product direction across user and business goals.",
              },
            ],
            faq_blocks: [
              {
                key: "faq_0",
                question: "What is PM?",
                answer: "A product role.",
              },
            ],
          },
        })
      )
    );

    const detail = await getCareerJobFromCmsBySlug({ slug: "product-manager", locale: "en" });

    expect(detail?.answerSurface?.surfaceType).toBe("career_job_public_detail");
    expect(detail?.answerSurface?.faqBlocks[0]?.question).toBe("What is PM?");
  });

  it("formats structured growth path when raw content is absent and tolerates missing fields", () => {
    const detail = adaptCareerJobDetail(
      {
        slug: "ux-designer",
        locale: "en",
        title: "UX Designer",
        growth_path: {
          entry: "Junior UX Designer",
          mid: "UX Designer",
          senior: "Senior UX Designer",
        },
      },
      {
        locale: "en",
      }
    );

    expect(detail).not.toBeNull();
    expect(detail?.growthPathItems).toEqual([
      "Junior UX Designer",
      "UX Designer",
      "Senior UX Designer",
    ]);
    expect(detail?.fitPersonalityItems).toEqual([]);
    expect(detail?.bodyMarkdown).toBe("");
    expect(detail?.salaryText).toBe("");
  });

  it("normalizes canonical and alternates while preserving occupation jsonld", () => {
    const normalized = adaptCareerJobSeoPayload(
      {
        meta: {
          title: "Product Manager Career Guide",
          description: "Responsibilities, salary, growth path, and personality fit.",
          canonical: "https://staging.fermatmind.com/en/career/jobs/product-manager",
          alternates: {
            en: "https://staging.fermatmind.com/en/career/jobs/product-manager",
            "zh-CN": "https://staging.fermatmind.com/zh/career/jobs/product-manager",
          },
          og: {
            title: "Product Manager Career Guide",
            description: "Responsibilities, salary, growth path, and personality fit.",
            image: null,
            type: "article",
          },
          twitter: {
            card: "summary_large_image",
            title: "Product Manager Career Guide",
            description: "Responsibilities, salary, growth path, and personality fit.",
            image: null,
          },
          robots: "index,follow",
        },
        jsonld: {
          "@context": "https://schema.org",
          "@type": "Occupation",
          url: "https://staging.fermatmind.com/en/career/jobs/product-manager",
          mainEntityOfPage: "https://staging.fermatmind.com/en/career/jobs/product-manager",
        },
      },
      "zh",
      "product-manager"
    );

    expect(normalized).not.toBeNull();
    expect(normalized?.meta.canonical).toBe("http://localhost:3000/zh/career/jobs/product-manager");
    expect(normalized?.meta.alternates.en).toBe("http://localhost:3000/en/career/jobs/product-manager");
    expect(normalized?.meta.alternates["zh-CN"]).toBe("http://localhost:3000/zh/career/jobs/product-manager");
    expect(normalized?.surface).toBeNull();
    expect((normalized?.jsonld as Record<string, unknown>)["@type"]).toBe("Occupation");
    expect((normalized?.jsonld as Record<string, unknown>).url).toBe("http://localhost:3000/zh/career/jobs/product-manager");
    expect((normalized?.jsonld as Record<string, unknown>).mainEntityOfPage).toBe("http://localhost:3000/zh/career/jobs/product-manager");
  });
});

describe("career markdown renderer contract", () => {
  it("renders headings, lists, and links from raw markdown", () => {
    const node = renderSimpleMarkdown("# Heading\n\n- First item\n- [Second](https://example.com)");
    const html = renderToStaticMarkup(
      <div>{node as Parameters<typeof renderToStaticMarkup>[0]}</div>
    );

    expect(html).toContain("<h1");
    expect(html).toContain("Heading");
    expect(html).toContain("<ul");
    expect(html).toContain("https://example.com");
  });

  it("keeps organization names with literal asterisks intact", () => {
    const node = renderSimpleMarkdown("- O*NET Center. Revisiting the Work Styles Domain of the O*NET Content Model.");
    const html = renderToStaticMarkup(
      <div>{node as Parameters<typeof renderToStaticMarkup>[0]}</div>
    );

    expect(html).toContain("O*NET Center");
    expect(html).toContain("O*NET Content Model");
    expect(html).not.toContain("<em>");
  });
});

describe("career alias route contract", () => {
  it("uses backend job bundle exposure gates for the job alias branch before guide and industry checks", async () => {
    const permanentRedirect = vi.fn(() => {
      throw new Error("redirected");
    });
    const notFound = vi.fn(() => {
      throw new Error("not-found");
    });
    const jobBundleLookup = vi.fn(async () => ({ bundle_kind: "career_job_bundle" }));
    const adaptJobBundle = vi.fn(() => ({
      slug: "product-manager",
      renderState: {
        canIndexPage: true,
      },
    }));
    const guideLookup = vi.fn(async () => null);

    vi.doMock("next/navigation", () => ({
      permanentRedirect,
      notFound,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: jobBundleLookup,
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerJobBundle", () => ({
      adaptCareerJobBundle: adaptJobBundle,
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      getCareerGuideFromCmsBySlug: guideLookup,
    }));
    vi.doMock("@/lib/career/datasetDirectory", () => ({
      CAREER_DATASET_FAMILY_SLUGS: ["technology"],
      normalizeFamilySlug: vi.fn((value: string) => value),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", () => ({
      localizedPath: vi.fn((path: string, locale: string) => `/${locale}${path}`),
    }));

    const { default: CareerAliasPage } = await import("@/app/(localized)/[locale]/career/[slug]/page");

    await expect(
      CareerAliasPage({
        params: Promise.resolve({ locale: "en", slug: "product-manager" }),
      })
    ).rejects.toThrow("redirected");

    expect(jobBundleLookup).toHaveBeenCalledWith({ slug: "product-manager", locale: "en" });
    expect(adaptJobBundle).toHaveBeenCalledWith({
      requestedSlug: "product-manager",
      locale: "en",
      payload: { bundle_kind: "career_job_bundle" },
    });
    expect(guideLookup).not.toHaveBeenCalled();
    expect(permanentRedirect).toHaveBeenCalledWith("/en/career/jobs/product-manager");
  });

  it("does not redirect a job alias when the backend exposure gate blocks indexing", async () => {
    const permanentRedirect = vi.fn(() => {
      throw new Error("redirected");
    });
    const notFound = vi.fn(() => {
      throw new Error("not-found");
    });
    const jobBundleLookup = vi.fn(async () => ({ bundle_kind: "career_job_bundle" }));
    const adaptJobBundle = vi.fn(() => ({
      slug: "draft-occupation",
      renderState: {
        canIndexPage: false,
      },
    }));
    const guideLookup = vi.fn(async () => null);

    vi.doMock("next/navigation", () => ({
      permanentRedirect,
      notFound,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: jobBundleLookup,
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerJobBundle", () => ({
      adaptCareerJobBundle: adaptJobBundle,
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      getCareerGuideFromCmsBySlug: guideLookup,
    }));
    vi.doMock("@/lib/career/datasetDirectory", () => ({
      CAREER_DATASET_FAMILY_SLUGS: ["technology"],
      normalizeFamilySlug: vi.fn((value: string) => value),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", () => ({
      localizedPath: vi.fn((path: string, locale: string) => `/${locale}${path}`),
    }));

    const { default: CareerAliasPage } = await import("@/app/(localized)/[locale]/career/[slug]/page");

    await expect(
      CareerAliasPage({
        params: Promise.resolve({ locale: "en", slug: "draft-occupation" }),
      })
    ).rejects.toThrow("not-found");

    expect(jobBundleLookup).toHaveBeenCalledWith({ slug: "draft-occupation", locale: "en" });
    expect(guideLookup).toHaveBeenCalledWith("draft-occupation", "en");
    expect(permanentRedirect).not.toHaveBeenCalled();
    expect(notFound).toHaveBeenCalled();
  });

  it("keeps the cms guide branch before the local industry branch when the job lookup misses", async () => {
    const permanentRedirect = vi.fn(() => {
      throw new Error("redirected");
    });
    const notFound = vi.fn(() => {
      throw new Error("not-found");
    });
    const jobBundleLookup = vi.fn(async () => null);
    const adaptJobBundle = vi.fn(() => null);
    const guideLookup = vi.fn(async () => ({ slug: "product-manager" }));

    vi.doMock("next/navigation", () => ({
      permanentRedirect,
      notFound,
    }));
    vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
      fetchCareerJobBundle: jobBundleLookup,
    }));
    vi.doMock("@/lib/career/adapters/adaptCareerJobBundle", () => ({
      adaptCareerJobBundle: adaptJobBundle,
    }));
    vi.doMock("@/lib/cms/career-guides", () => ({
      getCareerGuideFromCmsBySlug: guideLookup,
    }));
    vi.doMock("@/lib/career/datasetDirectory", () => ({
      CAREER_DATASET_FAMILY_SLUGS: ["technology"],
      normalizeFamilySlug: vi.fn((value: string) => value),
    }));
    vi.doMock("@/lib/i18n/getDict", () => ({
      resolveLocale: vi.fn(() => "en"),
    }));
    vi.doMock("@/lib/i18n/locales", () => ({
      localizedPath: vi.fn((path: string, locale: string) => `/${locale}${path}`),
    }));

    const { default: CareerAliasPage } = await import("@/app/(localized)/[locale]/career/[slug]/page");

    await expect(
      CareerAliasPage({
        params: Promise.resolve({ locale: "en", slug: "product-manager" }),
      })
    ).rejects.toThrow("redirected");

    expect(jobBundleLookup).toHaveBeenCalledWith({ slug: "product-manager", locale: "en" });
    expect(guideLookup).toHaveBeenCalledWith("product-manager", "en");
    expect(permanentRedirect).toHaveBeenCalledWith("/en/career/guides/product-manager");
  });
});

describe("career jobs page authority contract", () => {
  it("moves jobs list to the paginated backend directory while keeping job detail on the backend bundle path", () => {
    const listSource = read("app/(localized)/[locale]/career/jobs/page.tsx");
    const detailSource = read("app/(localized)/[locale]/career/jobs/[slug]/page.tsx");

    expect(listSource).toContain("fetchCareerDirectory");
    expect(listSource).toContain("adaptCareerDirectory");
    expect(listSource).not.toContain("fetchCareerJobIndex");
    expect(listSource).not.toContain("adaptCareerJobIndex");
    expect(listSource).not.toContain("listCareerJobsFromCms");
    expect(detailSource).toContain("fetchCareerJobBundle");
    expect(detailSource).toContain("adaptCareerJobBundle");
    expect(detailSource).toContain("career-job-protocol-status");
    expect(detailSource).toContain("renderState.canRenderSalarySurface");
    expect(detailSource).toContain("job.seoContract.indexEligible");
    expect(detailSource).not.toContain("getCareerJobFromCmsBySlug");
    expect(detailSource).not.toContain("job.answerSurface");
    expect(listSource).not.toContain("career-recommendations");
    expect(detailSource).not.toContain("career-recommendations");
  });
});
