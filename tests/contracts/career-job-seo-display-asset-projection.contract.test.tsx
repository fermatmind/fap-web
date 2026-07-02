import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg00AllowedFile } from "./helpers/currentPrScope";

const SLUG = "career-kg-projection-lock";
const CANONICAL = `https://fermatmind.com/zh/career/jobs/${SLUG}`;
const SEO_TITLE = "后端 SEO 标题｜FermatMind 职业库";
const SEO_DESCRIPTION = "后端 SEO 描述来自 seo.surface.v1，不来自前端 fallback。";
const BACKEND_CTA_LABEL = "后端 CTA：测职业兴趣";
const BACKEND_FAQ_QUESTION = "后端 FAQ 问题是否进入结构化数据？";
const BACKEND_FAQ_ANSWER = "只允许可见 display_surface_v1 FAQ 投影进入 FAQPage。";
const BACKEND_SOURCE_LABEL = "后端来源：O*NET 测试职业";
const BACKEND_SOURCE_USAGE = "后端说明：职业定义、任务和工作场景。";
const FRONTEND_LEGACY_CTA_LABEL = "测我的职业兴趣是否匹配";

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: process.cwd(), encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // Local worktrees and CI merge refs expose different diff bases.
    }
  }
  return [...files].sort();
}

function buildDisplaySurface() {
  const fixture = buildSelectedCareerDisplaySurfaceFixture({
    slug: SLUG,
    locale: "zh",
    titleEn: "Career KG Projection Lock",
    titleZh: "职业图谱投影锁定测试",
  });

  fixture.page.content.primary_cta.label = BACKEND_CTA_LABEL;
  fixture.page.content.final_cta.label = BACKEND_CTA_LABEL;
  fixture.page.content.faq_block.items = [
    {
      question: BACKEND_FAQ_QUESTION,
      answer: BACKEND_FAQ_ANSWER,
    },
  ];
  fixture.page.content.review_validity_card.last_reviewed = "2026-07-02";
  fixture.page.content.review_validity_card.next_review_due = "2026-10-02";
  (fixture.page.content as { boundary_notice?: unknown }).boundary_notice = {
    notices: ["后端边界说明：测评不能保证录用、收入或职业结果。"],
  };
  (fixture.sources as { references: Array<Record<string, unknown>> }).references = [
    {
      key: "backend_onet_projection_lock",
      label: BACKEND_SOURCE_LABEL,
      url: "https://www.onetonline.org/",
      usage: BACKEND_SOURCE_USAGE,
      captured_at: "2026-07-01",
      expires_at: "2026-10-01",
    },
  ];
  (fixture as { structured_data_from_visible_content?: unknown }).structured_data_from_visible_content = {
    faq_page: {
      "@type": "FAQPage",
      mainEntity: [
        {
          name: "隐藏 FAQ 不应进入 JSON-LD",
          acceptedAnswer: { text: "hidden tracking_json" },
        },
      ],
    },
  };

  return fixture;
}

function buildCareerJobBundlePayload() {
  return {
    identity: { canonical_slug: SLUG },
    titles: {
      canonical_en: "Career KG Projection Lock",
      canonical_zh: "职业图谱投影锁定测试",
    },
    truth_layer: {
      summary: "Local bundle summary should not own metadata.",
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
      allow_ai_strategy: true,
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
      canonical_path: `/zh/career/jobs/${SLUG}`,
      index_state: "indexable",
      index_eligible: true,
      reason_codes: ["runtime_publish_projection", "validated_display_asset_backed_release"],
    },
    structured_data: {
      occupation: {
        "@context": "https://schema.org",
        "@type": "Occupation",
        name: "Bundle fallback occupation must not render",
        url: `/zh/career/jobs/${SLUG}`,
      },
    },
    display_surface_v1: buildDisplaySurface(),
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
        name: "后端职业实体",
        url: CANONICAL,
        mainEntityOfPage: CANONICAL,
      },
    },
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
      usePathname: vi.fn(() => `/zh/career/jobs/${SLUG}`),
    };
  });
  vi.doMock("@/hooks/useAnalytics", () => ({
    AnalyticsPageViewTracker: () => null,
  }));
  vi.doMock("@/lib/career/api/fetchCareerJobBundle", () => ({
    fetchCareerJobBundle: vi.fn(async () => buildCareerJobBundlePayload()),
  }));
  vi.doMock("@/lib/career/api/fetchCareerSalaryAssetPreview", () => ({
    fetchCareerSalaryAssetPreview: vi.fn(async () => null),
  }));
  vi.doMock("@/lib/career/api/fetchCareerAiImpactAssetPreview", () => ({
    fetchCareerAiImpactAssetPreview: vi.fn(async () => null),
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

describe("PR-CAREER-KG-00 career job SEO/display asset projection contract", () => {
  it("projects title, meta description, FAQPage, Occupation, CTA, and source disclosure from backend surfaces", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://fermatmind.com");
    mockCareerJobPageShell();

    const { default: CareerJobDetailPage, generateMetadata } = await import(
      "@/app/(localized)/[locale]/career/jobs/[slug]/page"
    );
    const metadata = await generateMetadata({
      params: Promise.resolve({ locale: "zh", slug: SLUG }),
    });
    const page = await CareerJobDetailPage({
      params: Promise.resolve({ locale: "zh", slug: SLUG }),
      searchParams: Promise.resolve({}),
    });
    const html = renderToStaticMarkup(page as ReactNode);

    expect(metadata.title).toBe(SEO_TITLE);
    expect(metadata.description).toBe(SEO_DESCRIPTION);
    expect(metadata.alternates?.canonical).toBe(CANONICAL);
    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.description).not.toBe("Local bundle summary should not own metadata.");

    expect(html).toContain('"@type":"Occupation"');
    expect(html).toContain('"name":"后端职业实体"');
    expect(html).not.toContain("Bundle fallback occupation must not render");

    expect(html).toContain('"@type":"FAQPage"');
    expect(html).toContain(BACKEND_FAQ_QUESTION);
    expect(html).toContain(BACKEND_FAQ_ANSWER);
    expect(html).not.toContain("隐藏 FAQ 不应进入 JSON-LD");

    expect(html).toContain(BACKEND_CTA_LABEL);
    expect(html).not.toContain(FRONTEND_LEGACY_CTA_LABEL);
    expect(html).toContain(`/zh/tests/holland-career-interest-test-riasec`);

    expect(html).toContain(BACKEND_SOURCE_LABEL);
    expect(html).toContain(BACKEND_SOURCE_USAGE);
    expect(html).toContain("2026-07-02");
    expect(html).toContain("后端边界说明");
    expect(html).not.toContain("O*NET：职业定义、任务、兴趣、技能和工作场景。");
    expect(html).not.toContain("Career definitions, tasks, and interest signals reference public occupational sources");
  });

  it("registers manifest, state, and changed-file scope for this PR", () => {
    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;

    expect(manifest).toContain("PR-CAREER-KG-00");
    expect(manifest).toContain("codex/pr-career-kg-00-seo-display-asset-projection-lock");
    const entry = state["PR-CAREER-KG-00"] as Record<string, unknown>;
    expect(entry).toMatchObject({
      branch: "codex/pr-career-kg-00-seo-display-asset-projection-lock",
    });
    expect(["in_progress", "local_checks_passed", "pr_open", "ready_to_merge"]).toContain(entry.status);

    const files = changedFiles();
    expect(files.every((file) => isPrCareerKg00AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
