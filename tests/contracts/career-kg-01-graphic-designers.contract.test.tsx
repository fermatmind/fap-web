import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg01AllowedFile } from "./helpers/currentPrScope";

const PACKAGE_DIR = "generated/career-kg-pr-01-graphic-designers";
const ASSET_PATH = `${PACKAGE_DIR}/graphic-designers.zh-CN.asset.json`;
const QA_PATH = `${PACKAGE_DIR}/qa_report.json`;
const DRY_RUN_PATH = `${PACKAGE_DIR}/dry_run_importer_report.json`;
const STAGING_SMOKE_PATH = `${PACKAGE_DIR}/staging_preview_smoke.json`;
const RENDER_SMOKE_PATH = `${PACKAGE_DIR}/fap_web_render_smoke.json`;
const SHA_MANIFEST_PATH = `${PACKAGE_DIR}/sha256_manifest.json`;

type Source = {
  key: string;
  label: string;
  url?: string;
  authority: string;
  usage: string;
};

type CareerKgAsset = {
  artifact_type: string;
  artifact_version: string;
  pr_id: string;
  status: string;
  locale: string;
  slug: string;
  canonical_path: string;
  canonical_unchanged: boolean;
  production_import_approved: boolean;
  staging_write_approved: boolean;
  identity: {
    standard_name_zh: string;
    title_en: string;
    soc_code: string;
    onet_code: string;
    aliases_zh: string[];
    aliases_en: string[];
    easily_confused_occupations: Array<{ name_zh: string; boundary: string }>;
  };
  seo: {
    title_zh: string;
    meta_description_zh: string;
    h1_zh: string;
    canonical_path: string;
    ctr_intent_notes: string[];
  };
  content_blocks: Array<{
    id: string;
    heading_zh: string;
    body_zh?: string;
    items_zh?: Array<string | { question: string; answer: string }>;
    source_refs: string[];
  }>;
  sources: Source[];
  market_reference_policy: {
    zh_recruiting_or_baike_sources_used: boolean;
    allowed_usage: string;
    blocked_usage: string[];
  };
  internal_links: Array<{ label: string; path: string; reason: string }>;
  release_boundaries: Record<string, boolean>;
};

type QaReport = {
  status: string;
  schema_validation: {
    status: string;
    required_sections_present: string[];
    canonical_unchanged: boolean;
    content_block_count: number;
    faq_count: number;
  };
  trust_audit: {
    status: string;
    fact_authorities: string[];
    market_or_baike_used_as_fact_authority: boolean;
    blocked_claims_absent: string[];
  };
  editorial_gate: {
    status: string;
    priority_focus: string;
    reader_intent_covered: string[];
    canonical_path_locked: string;
  };
};

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function currentChangedFiles(): string[] {
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

describe("PR-CAREER-KG-01 graphic designers career KG asset", () => {
  const asset = readJson<CareerKgAsset>(ASSET_PATH);
  const qa = readJson<QaReport>(QA_PATH);
  const dryRun = readJson<Record<string, unknown>>(DRY_RUN_PATH);
  const stagingSmoke = readJson<Record<string, unknown>>(STAGING_SMOKE_PATH);
  const renderSmoke = readJson<Record<string, unknown>>(RENDER_SMOKE_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("delivers the required identity, SEO, source, and content-block package without changing canonical", () => {
    expect(asset).toMatchObject({
      artifact_type: "career_knowledge_graph_occupation_asset",
      pr_id: "PR-CAREER-KG-01",
      status: "dry_run_ready",
      locale: "zh-CN",
      slug: "graphic-designers",
      canonical_path: "/zh/career/jobs/graphic-designers",
      canonical_unchanged: true,
      production_import_approved: false,
      staging_write_approved: false,
    });
    expect(asset.identity).toMatchObject({
      standard_name_zh: "平面设计师",
      title_en: "Graphic Designers",
      soc_code: "27-1024",
      onet_code: "27-1024.00",
    });
    expect(asset.identity.aliases_zh).toEqual(expect.arrayContaining(["视觉设计师", "品牌设计师", "UI视觉设计师"]));
    expect(asset.identity.aliases_en).toEqual(expect.arrayContaining(["Brand Designer", "Graphic Artist", "Production Artist"]));
    expect(asset.identity.easily_confused_occupations.map((item) => item.name_zh)).toEqual(
      expect.arrayContaining(["UI/UX设计师", "网页开发人员", "艺术指导", "商业与工业设计师"])
    );

    expect(asset.seo.title_zh).toContain("平面设计师是做什么的");
    expect(asset.seo.title_zh).toContain("作品集");
    expect(asset.seo.title_zh).toContain("AI边界");
    expect(asset.seo.meta_description_zh).toContain("视觉传达");
    expect(asset.seo.h1_zh).toBe("平面设计师");
    expect(asset.seo.canonical_path).toBe("/zh/career/jobs/graphic-designers");

    const requiredBlocks = [
      "definition",
      "core_responsibilities",
      "work_scenes",
      "skills_tools",
      "entry_path",
      "riasec_personality_boundary",
      "risk_ai_boundary",
      "adjacent_careers",
      "faq",
    ];
    expect(asset.content_blocks.map((block) => block.id)).toEqual(requiredBlocks);
    expect(asset.content_blocks.find((block) => block.id === "skills_tools")?.items_zh?.join(" ")).toContain("作品集");
    expect(asset.content_blocks.find((block) => block.id === "risk_ai_boundary")?.items_zh?.join(" ")).toContain("AI");
  });

  it("keeps facts on O*NET/BLS/My Next Move authority and quarantines market/search references", () => {
    const sourceKeys = new Set(asset.sources.map((source) => source.key));
    expect(sourceKeys).toEqual(
      new Set([
        "onet_summary_27_1024_00",
        "bls_ooh_graphic_designers",
        "mynextmove_summary_27_1024_00",
        "mynextmove_data_sources_27_1024_00",
        "fermatmind_interpretation",
      ])
    );
    expect(asset.sources.filter((source) => source.authority === "occupation_fact").map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "O*NET OnLine: Graphic Designers 27-1024.00",
        "BLS Occupational Outlook Handbook: Graphic Designers",
        "My Next Move: Graphic Designers 27-1024.00",
      ])
    );
    expect(asset.sources.find((source) => source.key === "fermatmind_interpretation")?.authority).toBe("interpretation_only");
    expect(asset.market_reference_policy.zh_recruiting_or_baike_sources_used).toBe(false);
    expect(asset.market_reference_policy.blocked_usage).toEqual(
      expect.arrayContaining(["薪资事实权威", "就业保证", "JSON-LD事实来源"])
    );
    for (const block of asset.content_blocks) {
      expect(block.source_refs.length).toBeGreaterThan(0);
      expect(block.source_refs.every((sourceRef) => sourceKeys.has(sourceRef))).toBe(true);
    }
  });

  it("passes schema validation, trust audit, editorial gate, dry-run importer, and smoke gates", () => {
    expect(qa.status).toBe("pass");
    expect(qa.schema_validation).toMatchObject({
      status: "pass",
      canonical_unchanged: true,
      content_block_count: 9,
      faq_count: 3,
    });
    expect(qa.schema_validation.required_sections_present).toEqual(
      expect.arrayContaining(["identity", "seo", "definition", "faq", "sources", "internal_links"])
    );
    expect(qa.trust_audit).toMatchObject({
      status: "pass",
      market_or_baike_used_as_fact_authority: false,
    });
    expect(qa.trust_audit.fact_authorities).toEqual(
      expect.arrayContaining(["O*NET OnLine", "BLS Occupational Outlook Handbook", "My Next Move"])
    );
    expect(qa.editorial_gate).toMatchObject({
      status: "pass",
      canonical_path_locked: "/zh/career/jobs/graphic-designers",
    });
    expect(qa.editorial_gate.reader_intent_covered).toEqual(
      expect.arrayContaining(["平面设计师是做什么的", "平面设计师和UI设计师区别", "AI是否会取代平面设计师"])
    );
    expect(dryRun).toMatchObject({
      status: "pass",
      mode: "dry_run_only",
      writes_performed: false,
      cms_write_performed: false,
      production_import_performed: false,
      production_import_approved: false,
    });
    expect(stagingSmoke).toMatchObject({
      status: "pass",
      staging_write_performed: false,
      staging_deploy_wait_performed: false,
      manual_deploy_triggered: false,
      production_deploy_triggered: false,
    });
    expect(renderSmoke).toMatchObject({
      status: "pass",
      mode: "contract_mock_backend_display_surface",
      route: "/zh/career/jobs/graphic-designers",
    });
    expect(Object.values(asset.release_boundaries).every((value) => value === false)).toBe(true);
  });

  it("renders through fap-web career display primitives from a backend-like projection", () => {
    const faqBlock = asset.content_blocks.find((block) => block.id === "faq");
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: asset.slug,
      locale: "zh",
      titleEn: asset.identity.title_en,
      titleZh: asset.identity.standard_name_zh,
    });
    fixture.page.content.hero.h1 = asset.seo.h1_zh;
    fixture.page.content.hero.title = asset.seo.h1_zh;
    fixture.page.content.hero.quick_answer = asset.content_blocks.find((block) => block.id === "definition")?.body_zh ?? "";
    fixture.page.content.faq_block.items = (faqBlock?.items_zh ?? []) as Array<{ question: string; answer: string }>;
    fixture.page.content.definition_block = asset.content_blocks.find((block) => block.id === "definition")?.body_zh ?? "";
    fixture.page.content.responsibilities_block = asset.content_blocks
      .find((block) => block.id === "core_responsibilities")
      ?.items_zh as string[];
    fixture.sources.references = asset.sources.map((source) => ({
      key: source.key,
      label: source.label,
      url: source.url,
      usage: source.usage,
      source_type: source.authority,
    }));

    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} suppressLegacySalaryMetadata />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("平面设计师");
    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("商业或传播目标");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("商业或传播目标");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("项目范围");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("平面设计师和UI设计师有什么区别");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET OnLine");
    expect(screen.getByTestId("source-list")).toHaveTextContent("BLS Occupational Outlook Handbook");
  });

  it("records stable SHA-256 hashes and keeps PR scope constrained", () => {
    expect(shaManifest["README.md"]).toBe(sha256(`${PACKAGE_DIR}/README.md`));
    expect(shaManifest["graphic-designers.zh-CN.asset.json"]).toBe(sha256(ASSET_PATH));
    expect(shaManifest["qa_report.json"]).toBe(sha256(QA_PATH));
    expect(shaManifest["dry_run_importer_report.json"]).toBe(sha256(DRY_RUN_PATH));
    expect(shaManifest["staging_preview_smoke.json"]).toBe(sha256(STAGING_SMOKE_PATH));
    expect(shaManifest["fap_web_render_smoke.json"]).toBe(sha256(RENDER_SMOKE_PATH));

    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;
    expect(manifest).toContain("PR-CAREER-KG-01");
    expect(manifest).toContain("codex/pr-career-kg-01-graphic-designers");
    expect(state["PR-CAREER-KG-01"]).toMatchObject({
      branch: "codex/pr-career-kg-01-graphic-designers",
    });

    const files = currentChangedFiles();
    expect(files.every((file) => isPrCareerKg01AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
