import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg07AllowedFile } from "./helpers/currentPrScope";

const PACKAGE_DIR = "generated/career-kg-pr-07-civil-engineering-technicians";
const ASSET_PATH = `${PACKAGE_DIR}/civil-engineering-technologists-and-technicians.zh-CN.asset.json`;
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
  };
  content_blocks: Array<{
    id: string;
    body_zh?: string;
    items_zh?: Array<string | { question: string; answer: string }>;
    source_refs: string[];
  }>;
  sources: Source[];
  market_reference_policy: {
    zh_recruiting_or_baike_sources_used: boolean;
    blocked_usage: string[];
  };
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

describe("PR-CAREER-KG-07 civil engineering technicians career KG asset", () => {
  const asset = readJson<CareerKgAsset>(ASSET_PATH);
  const qa = readJson<QaReport>(QA_PATH);
  const dryRun = readJson<Record<string, unknown>>(DRY_RUN_PATH);
  const stagingSmoke = readJson<Record<string, unknown>>(STAGING_SMOKE_PATH);
  const renderSmoke = readJson<Record<string, unknown>>(RENDER_SMOKE_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("delivers the required identity, SEO, source, and content-block package without changing canonical", () => {
    expect(asset).toMatchObject({
      artifact_type: "career_knowledge_graph_occupation_asset",
      pr_id: "PR-CAREER-KG-07",
      status: "dry_run_ready",
      locale: "zh-CN",
      slug: "civil-engineering-technologists-and-technicians",
      canonical_path: "/zh/career/jobs/civil-engineering-technologists-and-technicians",
      canonical_unchanged: true,
      production_import_approved: false,
      staging_write_approved: false,
    });
    expect(asset.identity).toMatchObject({
      standard_name_zh: "土木工程技师与技术员",
      title_en: "Civil Engineering Technologists and Technicians",
      soc_code: "17-3022",
      onet_code: "17-3022.00",
    });
    expect(asset.identity.aliases_zh).toEqual(expect.arrayContaining(["土木工程技术员", "施工技术员", "CAD制图技术员"]));
    expect(asset.identity.aliases_en).toEqual(
      expect.arrayContaining(["Civil Engineering Technician", "Civil Designer", "Engineering Technician"])
    );
    expect(asset.identity.easily_confused_occupations.map((item) => item.name_zh)).toEqual(
      expect.arrayContaining(["土木工程师", "测量与制图技术员", "建筑与土木制图员", "施工经理", "机械制图员"])
    );

    expect(asset.seo.title_zh).toContain("土木工程技师与技术员是做什么的");
    expect(asset.seo.title_zh).toContain("CAD");
    expect(asset.seo.title_zh).toContain("测量");
    expect(asset.seo.title_zh).toContain("施工记录");
    expect(asset.seo.meta_description_zh).toContain("材料试验");
    expect(asset.seo.meta_description_zh).toContain("工程师协作");
    expect(asset.seo.h1_zh).toBe("土木工程技师与技术员");

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
    expect(asset.content_blocks.find((block) => block.id === "core_responsibilities")?.items_zh?.join(" ")).toContain("施工记录");
    expect(asset.content_blocks.find((block) => block.id === "skills_tools")?.items_zh?.join(" ")).toContain("Civil 3D");
    expect(asset.content_blocks.find((block) => block.id === "risk_ai_boundary")?.items_zh?.join(" ")).toContain("BIM");
  });

  it("keeps facts on O*NET/BLS/My Next Move authority and quarantines market/search references", () => {
    const sourceKeys = new Set(asset.sources.map((source) => source.key));
    expect(sourceKeys).toEqual(
      new Set([
        "onet_summary_17_3022_00",
        "bls_ooh_civil_engineering_technologists_technicians",
        "mynextmove_summary_17_3022_00",
        "mynextmove_data_sources_17_3022_00",
        "fermatmind_interpretation",
      ])
    );
    expect(asset.sources.filter((source) => source.authority === "occupation_fact").map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "O*NET OnLine: Civil Engineering Technologists and Technicians 17-3022.00",
        "BLS OOH: Civil Engineering Technologists and Technicians",
        "My Next Move: Civil Engineering Technologists & Technicians 17-3022.00",
      ])
    );
    expect(asset.market_reference_policy.zh_recruiting_or_baike_sources_used).toBe(false);
    expect(asset.market_reference_policy.blocked_usage).toEqual(
      expect.arrayContaining(["职业事实权威", "就业保证", "执业签署资格保证", "JSON-LD事实来源", "生产导入依据"])
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
    expect(qa.trust_audit).toMatchObject({
      status: "pass",
      market_or_baike_used_as_fact_authority: false,
    });
    expect(qa.trust_audit.fact_authorities).toEqual(expect.arrayContaining(["O*NET OnLine", "BLS OOH", "My Next Move"]));
    expect(qa.editorial_gate).toMatchObject({
      status: "pass",
      canonical_path_locked: "/zh/career/jobs/civil-engineering-technologists-and-technicians",
    });
    expect(qa.editorial_gate.reader_intent_covered).toEqual(
      expect.arrayContaining(["土木工程技师与技术员是做什么的", "土木工程技术员 CAD", "施工记录", "材料试验"])
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
      route: "/zh/career/jobs/civil-engineering-technologists-and-technicians",
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

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("土木工程技师与技术员");
    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("施工记录");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("工程师");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("CAD");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("土木工程技师与技术员和土木工程师有什么区别");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET OnLine");
    expect(screen.getByTestId("source-list")).toHaveTextContent("BLS OOH");
  });

  it("records stable SHA-256 hashes and keeps PR scope constrained", () => {
    expect(shaManifest["README.md"]).toBe(sha256(`${PACKAGE_DIR}/README.md`));
    expect(shaManifest["civil-engineering-technologists-and-technicians.zh-CN.asset.json"]).toBe(sha256(ASSET_PATH));
    expect(shaManifest["qa_report.json"]).toBe(sha256(QA_PATH));
    expect(shaManifest["dry_run_importer_report.json"]).toBe(sha256(DRY_RUN_PATH));
    expect(shaManifest["staging_preview_smoke.json"]).toBe(sha256(STAGING_SMOKE_PATH));
    expect(shaManifest["fap_web_render_smoke.json"]).toBe(sha256(RENDER_SMOKE_PATH));

    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;
    expect(manifest).toContain("PR-CAREER-KG-07");
    expect(manifest).toContain("codex/pr-career-kg-07-civil-engineering-technologists-technicians");
    expect(state["PR-CAREER-KG-06"]).toMatchObject({
      status: "merged",
      merge_commit_sha: "16161985494bd7ce145e4573f8e4c0fa862ab5a8",
    });
    expect(state["PR-CAREER-KG-07"]).toMatchObject({
      branch: "codex/pr-career-kg-07-civil-engineering-technologists-technicians",
    });

    const files = currentChangedFiles();
    expect(files.every((file) => isPrCareerKg07AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
