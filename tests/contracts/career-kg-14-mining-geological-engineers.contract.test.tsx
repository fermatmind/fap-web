import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg14AllowedFile } from "./helpers/currentPrScope";

const PACKAGE_DIR = "generated/career-kg-pr-14-mining-geological-engineers";
const ASSET_PATH = `${PACKAGE_DIR}/mining-and-geological-engineers.zh-CN.asset.json`;
const QA_PATH = `${PACKAGE_DIR}/qa_report.json`;
const DRY_RUN_PATH = `${PACKAGE_DIR}/dry_run_importer_report.json`;
const STAGING_SMOKE_PATH = `${PACKAGE_DIR}/staging_preview_smoke.json`;
const RENDER_SMOKE_PATH = `${PACKAGE_DIR}/fap_web_render_smoke.json`;
const SHA_MANIFEST_PATH = `${PACKAGE_DIR}/sha256_manifest.json`;

type Source = { key: string; label: string; url?: string; authority: string; usage: string };
type CareerKgAsset = {
  artifact_type: string;
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
  seo: { title_zh: string; meta_description_zh: string; h1_zh: string; canonical_path: string };
  content_blocks: Array<{ id: string; body_zh?: string; items_zh?: Array<string | { question: string; answer: string }>; source_refs: string[] }>;
  sources: Source[];
  market_reference_policy: { zh_recruiting_or_baike_sources_used: boolean; blocked_usage: string[] };
  release_boundaries: Record<string, boolean>;
};
type QaReport = {
  status: string;
  schema_validation: { status: string; canonical_unchanged: boolean; content_block_count: number; faq_count: number };
  trust_audit: { status: string; fact_authorities: string[]; market_or_baike_used_as_fact_authority: boolean; blocked_claims_absent: string[] };
  editorial_gate: { status: string; reader_intent_covered: string[]; canonical_path_locked: string };
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
      for (const line of output.split("\n")) if (line.trim()) files.add(line.trim());
    } catch {
      // Local worktrees and CI merge refs expose different diff bases.
    }
  }
  return [...files].sort();
}

describe("PR-CAREER-KG-14 mining and geological engineers career KG asset", () => {
  const asset = readJson<CareerKgAsset>(ASSET_PATH);
  const qa = readJson<QaReport>(QA_PATH);
  const dryRun = readJson<Record<string, unknown>>(DRY_RUN_PATH);
  const stagingSmoke = readJson<Record<string, unknown>>(STAGING_SMOKE_PATH);
  const renderSmoke = readJson<Record<string, unknown>>(RENDER_SMOKE_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("delivers identity, SEO, source, and block coverage without changing canonical", () => {
    expect(asset).toMatchObject({
      artifact_type: "career_knowledge_graph_occupation_asset",
      pr_id: "PR-CAREER-KG-14",
      status: "dry_run_ready",
      locale: "zh-CN",
      slug: "mining-and-geological-engineers",
      canonical_path: "/zh/career/jobs/mining-and-geological-engineers",
      canonical_unchanged: true,
      production_import_approved: false,
      staging_write_approved: false,
    });
    expect(asset.identity).toMatchObject({
      standard_name_zh: "采矿与地质工程师",
      title_en: "Mining and Geological Engineers, Including Mining Safety Engineers",
      soc_code: "17-2151",
      onet_code: "17-2151.00",
    });
    expect(asset.identity.aliases_zh).toEqual(expect.arrayContaining(["采矿工程师", "矿山安全工程师", "地质工程师"]));
    expect(asset.identity.easily_confused_occupations.map((item) => item.name_zh)).toEqual(
      expect.arrayContaining(["地质学家 / 地球科学家", "土木工程师", "环境工程师", "采矿与地质技术员", "职业健康与安全专家"])
    );
    expect(asset.seo.title_zh).toContain("采矿与地质工程师是做什么的");
    expect(asset.seo.title_zh).toContain("矿山安全");
    expect(asset.seo.title_zh).toContain("工程判断");
    expect(asset.seo.h1_zh).toBe("采矿与地质工程师");
    expect(asset.content_blocks.map((block) => block.id)).toEqual([
      "definition",
      "core_responsibilities",
      "work_scenes",
      "skills_tools",
      "entry_path",
      "riasec_personality_boundary",
      "risk_ai_boundary",
      "adjacent_careers",
      "faq",
    ]);
    expect(asset.content_blocks.find((block) => block.id === "core_responsibilities")?.items_zh?.join(" ")).toContain("通风");
    expect(asset.content_blocks.find((block) => block.id === "skills_tools")?.items_zh?.join(" ")).toContain("CAD");
    expect(asset.content_blocks.find((block) => block.id === "risk_ai_boundary")?.items_zh?.join(" ")).toContain("监管审批");
  });

  it("keeps occupational facts on O*NET/BLS/My Next Move authority", () => {
    const sourceKeys = new Set(asset.sources.map((source) => source.key));
    expect(sourceKeys).toEqual(
      new Set([
        "onet_summary_17_2151_00",
        "bls_ooh_mining_geological_engineers",
        "bls_oews_17_2151",
        "mynextmove_summary_17_2151_00",
        "mynextmove_data_sources_17_2151_00",
        "onet_job_zone_17_2151_00",
        "bls_ooh_geoscientists",
        "bls_ooh_environmental_engineers",
        "fermatmind_interpretation",
      ])
    );
    expect(asset.sources.filter((source) => source.authority === "occupation_fact").map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "O*NET OnLine: Mining and Geological Engineers, Including Mining Safety Engineers 17-2151.00",
        "BLS OOH: Mining and Geological Engineers",
        "BLS OEWS: Mining and Geological Engineers, Including Mining Safety Engineers 17-2151",
        "My Next Move: Mining & Geological Engineers, Including Mining Safety Engineers 17-2151.00",
      ])
    );
    expect(asset.market_reference_policy.zh_recruiting_or_baike_sources_used).toBe(false);
    expect(asset.market_reference_policy.blocked_usage).toEqual(expect.arrayContaining(["职业事实权威", "项目获批保证", "监管审批保证"]));
    for (const block of asset.content_blocks) {
      expect(block.source_refs.length).toBeGreaterThan(0);
      expect(block.source_refs.every((sourceRef) => sourceKeys.has(sourceRef))).toBe(true);
    }
  });

  it("passes QA, dry-run, smoke, and release boundary gates", () => {
    expect(qa.status).toBe("pass");
    expect(qa.schema_validation).toMatchObject({ status: "pass", canonical_unchanged: true, content_block_count: 9, faq_count: 3 });
    expect(qa.trust_audit).toMatchObject({ status: "pass", market_or_baike_used_as_fact_authority: false });
    expect(qa.trust_audit.fact_authorities).toEqual(expect.arrayContaining(["O*NET OnLine", "BLS OOH", "BLS OEWS", "My Next Move"]));
    expect(qa.trust_audit.blocked_claims_absent).toEqual(expect.arrayContaining(["project_approval_guarantee", "mineral_discovery_guarantee", "regulatory_approval_guarantee"]));
    expect(qa.editorial_gate.reader_intent_covered).toEqual(expect.arrayContaining(["采矿与地质工程师是做什么的", "工程判断"]));
    expect(dryRun).toMatchObject({ status: "pass", mode: "dry_run_only", writes_performed: false, cms_write_performed: false, production_import_performed: false });
    expect(stagingSmoke).toMatchObject({ status: "pass", staging_write_performed: false, staging_deploy_wait_performed: false, manual_deploy_triggered: false });
    expect(renderSmoke).toMatchObject({ status: "pass", mode: "contract_mock_backend_display_surface" });
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
    const fixtureFaqBlock = fixture.page.content.faq_block as { heading?: string; items: Array<{ question: string; answer: string }> };
    fixtureFaqBlock.heading = "常见问题";
    fixtureFaqBlock.items = (faqBlock?.items_zh ?? []) as Array<{ question: string; answer: string }>;
    fixture.page.content.definition_block = asset.content_blocks.find((block) => block.id === "definition")?.body_zh ?? "";
    fixture.page.content.responsibilities_block = asset.content_blocks.find((block) => block.id === "core_responsibilities")?.items_zh as string[];
    fixture.sources.references = asset.sources.map((source) => ({
      key: source.key,
      label: source.label,
      url: source.url,
      usage: source.usage,
      source_type: source.authority,
    }));

    const surface = adaptCareerDisplaySurface(fixture, "zh");
    render(<CareerDisplaySurface surface={surface} suppressLegacySalaryMetadata />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("采矿与地质工程师");
    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("安全要求");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("通风");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("通风");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("地质学家");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET OnLine");
    expect(screen.getByTestId("source-list")).toHaveTextContent("BLS OOH");
  });

  it("records stable hashes and keeps PR scope constrained", () => {
    expect(shaManifest["README.md"]).toBe(sha256(`${PACKAGE_DIR}/README.md`));
    expect(shaManifest["mining-and-geological-engineers.zh-CN.asset.json"]).toBe(sha256(ASSET_PATH));
    expect(shaManifest["qa_report.json"]).toBe(sha256(QA_PATH));
    expect(shaManifest["dry_run_importer_report.json"]).toBe(sha256(DRY_RUN_PATH));
    expect(shaManifest["staging_preview_smoke.json"]).toBe(sha256(STAGING_SMOKE_PATH));
    expect(shaManifest["fap_web_render_smoke.json"]).toBe(sha256(RENDER_SMOKE_PATH));

    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;
    expect(manifest).toContain("PR-CAREER-KG-14");
    expect(manifest).toContain("codex/pr-career-kg-14-mining-geological-engineers");
    expect(state["PR-CAREER-KG-13"]).toMatchObject({ status: "merged", merge_commit_sha: "d8ffe3bd7ccb3d6242645382eb09966f50424699" });
    expect(state["PR-CAREER-KG-14"]).toMatchObject({ branch: "codex/pr-career-kg-14-mining-geological-engineers" });

    const files = currentChangedFiles();
    expect(files.every((file) => isPrCareerKg14AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
