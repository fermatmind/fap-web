import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg03AllowedFile } from "./helpers/currentPrScope";

const PACKAGE_DIR = "generated/career-kg-pr-03-transit-intercity-bus-drivers";
const ASSET_PATH = `${PACKAGE_DIR}/bus-drivers-transit-intercity.zh-CN.asset.json`;
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

describe("PR-CAREER-KG-03 transit intercity bus drivers career KG asset", () => {
  const asset = readJson<CareerKgAsset>(ASSET_PATH);
  const qa = readJson<QaReport>(QA_PATH);
  const dryRun = readJson<Record<string, unknown>>(DRY_RUN_PATH);
  const stagingSmoke = readJson<Record<string, unknown>>(STAGING_SMOKE_PATH);
  const renderSmoke = readJson<Record<string, unknown>>(RENDER_SMOKE_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("delivers the required identity, SEO, source, and content-block package without changing canonical", () => {
    expect(asset).toMatchObject({
      artifact_type: "career_knowledge_graph_occupation_asset",
      pr_id: "PR-CAREER-KG-03",
      status: "dry_run_ready",
      locale: "zh-CN",
      slug: "bus-drivers-transit-intercity",
      canonical_path: "/zh/career/jobs/bus-drivers-transit-intercity",
      canonical_unchanged: true,
      production_import_approved: false,
      staging_write_approved: false,
    });
    expect(asset.identity).toMatchObject({
      standard_name_zh: "公交与城际巴士司机",
      title_en: "Bus Drivers, Transit and Intercity",
      soc_code: "53-3052",
      onet_code: "53-3052.00",
    });
    expect(asset.identity.aliases_zh).toEqual(expect.arrayContaining(["公交车司机", "城际巴士司机", "公交驾驶员", "长途客车司机"]));
    expect(asset.identity.aliases_en).toEqual(
      expect.arrayContaining(["Bus Operator", "Motor Coach Driver", "Transit Bus Driver"])
    );
    expect(asset.identity.easily_confused_occupations.map((item) => item.name_zh)).toEqual(
      expect.arrayContaining(["校车司机", "出租车/网约车司机", "重型卡车司机", "乘客车辆司机"])
    );

    expect(asset.seo.title_zh).toContain("公交与城际巴士司机是做什么的");
    expect(asset.seo.title_zh).toContain("安全");
    expect(asset.seo.title_zh).toContain("疲劳压力");
    expect(asset.seo.meta_description_zh).toContain("乘客服务");
    expect(asset.seo.meta_description_zh).toContain("排班压力");
    expect(asset.seo.h1_zh).toBe("公交与城际巴士司机");
    expect(asset.seo.canonical_path).toBe("/zh/career/jobs/bus-drivers-transit-intercity");

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
    expect(asset.content_blocks.find((block) => block.id === "skills_tools")?.items_zh?.join(" ")).toContain("安全驾驶");
    expect(asset.content_blocks.find((block) => block.id === "core_responsibilities")?.items_zh?.join(" ")).toContain("乘客");
    expect(asset.content_blocks.find((block) => block.id === "risk_ai_boundary")?.items_zh?.join(" ")).toContain("疲劳驾驶");
  });

  it("keeps facts on O*NET/BLS/My Next Move authority and quarantines market/search references", () => {
    const sourceKeys = new Set(asset.sources.map((source) => source.key));
    expect(sourceKeys).toEqual(
      new Set([
        "onet_summary_53_3052_00",
        "bls_oews_53_3052",
        "mynextmove_summary_53_3052_00",
        "mynextmove_data_sources_53_3052_00",
        "fermatmind_interpretation",
      ])
    );
    expect(asset.sources.filter((source) => source.authority === "occupation_fact").map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "O*NET OnLine: Bus Drivers, Transit and Intercity 53-3052.00",
        "BLS OEWS: Bus Drivers, Transit and Intercity 53-3052",
        "My Next Move: Bus Drivers, Transit & Intercity 53-3052.00",
      ])
    );
    expect(asset.market_reference_policy.zh_recruiting_or_baike_sources_used).toBe(false);
    expect(asset.market_reference_policy.blocked_usage).toEqual(
      expect.arrayContaining(["职业事实权威", "就业保证", "JSON-LD事实来源", "生产导入依据"])
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
    expect(qa.trust_audit.fact_authorities).toEqual(expect.arrayContaining(["O*NET OnLine", "BLS OEWS", "My Next Move"]));
    expect(qa.editorial_gate).toMatchObject({
      status: "pass",
      canonical_path_locked: "/zh/career/jobs/bus-drivers-transit-intercity",
    });
    expect(qa.editorial_gate.reader_intent_covered).toEqual(
      expect.arrayContaining(["公交与城际巴士司机是做什么的", "公交司机和校车司机区别", "巴士司机压力和疲劳风险"])
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
      route: "/zh/career/jobs/bus-drivers-transit-intercity",
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

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("公交与城际巴士司机");
    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("大型客运巴士");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("乘客运输");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("上下客安全");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("公交与城际巴士司机和校车司机有什么区别");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET OnLine");
    expect(screen.getByTestId("source-list")).toHaveTextContent("BLS OEWS");
  });

  it("records stable SHA-256 hashes and keeps PR scope constrained", () => {
    expect(shaManifest["README.md"]).toBe(sha256(`${PACKAGE_DIR}/README.md`));
    expect(shaManifest["bus-drivers-transit-intercity.zh-CN.asset.json"]).toBe(sha256(ASSET_PATH));
    expect(shaManifest["qa_report.json"]).toBe(sha256(QA_PATH));
    expect(shaManifest["dry_run_importer_report.json"]).toBe(sha256(DRY_RUN_PATH));
    expect(shaManifest["staging_preview_smoke.json"]).toBe(sha256(STAGING_SMOKE_PATH));
    expect(shaManifest["fap_web_render_smoke.json"]).toBe(sha256(RENDER_SMOKE_PATH));

    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;
    expect(manifest).toContain("PR-CAREER-KG-03");
    expect(manifest).toContain("codex/pr-career-kg-03-transit-intercity-bus-drivers");
    expect(state["PR-CAREER-KG-02"]).toMatchObject({
      status: "merged",
      merge_commit_sha: "a603a647d20b7c5cab051fe83aa48bb6d34b23fb",
    });
    expect(state["PR-CAREER-KG-03"]).toMatchObject({
      branch: "codex/pr-career-kg-03-transit-intercity-bus-drivers",
    });

    const files = currentChangedFiles();
    expect(files.every((file) => isPrCareerKg03AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
