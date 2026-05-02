import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildActorsDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";

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

async function renderCareerJobPage(locale: "en" | "zh", slug: string, payload: unknown): Promise<string> {
  mockRouteRuntime(payload);

  const { default: Page } = await import("@/app/(localized)/[locale]/career/jobs/[slug]/page");
  const page = await Page({
    params: Promise.resolve({ locale, slug }),
  });

  return renderToStaticMarkup(page as ReactNode);
}

function buildJobBundle({
  slug = "actors",
  displaySurface,
}: {
  slug?: string;
  displaySurface?: unknown;
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
    trust_manifest: {
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
    seo_contract: {
      canonical_path: canonicalPath,
      canonical_target: canonicalPath,
      index_state: "index",
      index_eligible: true,
    },
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
});
