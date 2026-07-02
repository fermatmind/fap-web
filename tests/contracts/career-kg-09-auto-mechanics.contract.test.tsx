import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { adaptCareerDisplaySurface } from "@/lib/career/displaySurface";
import { buildSelectedCareerDisplaySurfaceFixture } from "@/tests/contracts/careerDisplaySurface.fixture";
import { isPrCareerKg09AllowedFile } from "./helpers/currentPrScope";

const PACKAGE_DIR = "generated/career-kg-pr-09-auto-mechanics";
const ASSET_PATH = `${PACKAGE_DIR}/automotive-service-technicians-and-mechanics.zh-CN.asset.json`;
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

describe("PR-CAREER-KG-09 automotive service technicians and mechanics career KG asset", () => {
  const asset = readJson<CareerKgAsset>(ASSET_PATH);
  const qa = readJson<QaReport>(QA_PATH);
  const dryRun = readJson<Record<string, unknown>>(DRY_RUN_PATH);
  const stagingSmoke = readJson<Record<string, unknown>>(STAGING_SMOKE_PATH);
  const renderSmoke = readJson<Record<string, unknown>>(RENDER_SMOKE_PATH);
  const shaManifest = readJson<Record<string, string>>(SHA_MANIFEST_PATH);

  it("delivers the required identity, SEO, source, and content-block package without changing canonical", () => {
    expect(asset).toMatchObject({
      artifact_type: "career_knowledge_graph_occupation_asset",
      pr_id: "PR-CAREER-KG-09",
      status: "dry_run_ready",
      locale: "zh-CN",
      slug: "automotive-service-technicians-and-mechanics",
      canonical_path: "/zh/career/jobs/automotive-service-technicians-and-mechanics",
      canonical_unchanged: true,
      production_import_approved: false,
      staging_write_approved: false,
    });
    expect(asset.identity).toMatchObject({
      standard_name_zh: "汽车维修技师与机械师",
      title_en: "Automotive Service Technicians and Mechanics",
      soc_code: "49-3023",
      onet_code: "49-3023.00",
    });
    expect(asset.identity.aliases_zh).toEqual(expect.arrayContaining(["汽车维修技师", "汽车诊断技师", "新能源车维修技师"]));
    expect(asset.identity.aliases_en).toEqual(
      expect.arrayContaining(["Automotive Service Technician", "Auto Mechanic", "Diagnostic Technician", "Quick Service Technician"])
    );
    expect(asset.identity.easily_confused_occupations.map((item) => item.name_zh)).toEqual(
      expect.arrayContaining(["柴油机服务技师与机械师", "重型车辆与移动设备维修技师", "汽车车身与相关修理工", "小型发动机机械师", "汽车服务顾问"])
    );

    expect(asset.seo.title_zh).toContain("汽车维修技师与机械师是做什么的");
    expect(asset.seo.title_zh).toContain("诊断设备");
    expect(asset.seo.title_zh).toContain("新能源车");
    expect(asset.seo.title_zh).toContain("技能等级");
    expect(asset.seo.meta_description_zh).toContain("维修场景");
    expect(asset.seo.h1_zh).toBe("汽车维修技师与机械师");

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
    expect(asset.content_blocks.find((block) => block.id === "core_responsibilities")?.items_zh?.join(" ")).toContain("电脑诊断设备");
    expect(asset.content_blocks.find((block) => block.id === "skills_tools")?.items_zh?.join(" ")).toContain("电动车");
    expect(asset.content_blocks.find((block) => block.id === "entry_path")?.items_zh?.join(" ")).toContain("职业技能等级");
    expect(asset.content_blocks.find((block) => block.id === "risk_ai_boundary")?.items_zh?.join(" ")).toContain("实车验证");
  });

  it("keeps facts on O*NET/BLS/My Next Move authority and quarantines market/search references", () => {
    const sourceKeys = new Set(asset.sources.map((source) => source.key));
    expect(sourceKeys).toEqual(
      new Set([
        "onet_summary_49_3023_00",
        "bls_ooh_automotive_service_technicians_mechanics",
        "mynextmove_summary_49_3023_00",
        "mynextmove_data_sources_49_3023_00",
        "fermatmind_interpretation",
      ])
    );
    expect(asset.sources.filter((source) => source.authority === "occupation_fact").map((source) => source.label)).toEqual(
      expect.arrayContaining([
        "O*NET OnLine: Automotive Service Technicians and Mechanics 49-3023.00",
        "BLS OOH: Automotive Service Technicians and Mechanics",
        "My Next Move: Automotive Service Technicians & Mechanics 49-3023.00",
      ])
    );
    expect(asset.market_reference_policy.zh_recruiting_or_baike_sources_used).toBe(false);
    expect(asset.market_reference_policy.blocked_usage).toEqual(
      expect.arrayContaining(["职业事实权威", "认证录用保证", "新能源高薪保证", "维修零风险保证", "生产导入依据"])
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
    expect(qa.trust_audit.blocked_claims_absent).toEqual(expect.arrayContaining(["new_energy_high_pay_guarantee"]));
    expect(qa.editorial_gate).toMatchObject({
      status: "pass",
      canonical_path_locked: "/zh/career/jobs/automotive-service-technicians-and-mechanics",
    });
    expect(qa.editorial_gate.reader_intent_covered).toEqual(
      expect.arrayContaining(["汽车维修技师与机械师是做什么的", "汽车维修技师 诊断设备", "新能源车维修"])
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
      route: "/zh/career/jobs/automotive-service-technicians-and-mechanics",
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
    const fixtureFaqBlock = fixture.page.content.faq_block as {
      heading?: string;
      items: Array<{ question: string; answer: string }>;
    };
    fixtureFaqBlock.heading = "常见问题";
    fixtureFaqBlock.items = (faqBlock?.items_zh ?? []) as Array<{ question: string; answer: string }>;
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

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("汽车维修技师与机械师");
    expect(screen.getByTestId("career-display-hero")).toHaveTextContent("诊断");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("汽车");
    expect(screen.getByTestId("definition-block")).toHaveTextContent("轻型卡车");
    expect(screen.getByTestId("responsibilities-block")).toHaveTextContent("电脑诊断设备");
    expect(screen.getByTestId("career-display-faq")).toHaveTextContent("新能源车会改变汽车维修技师的工作吗");
    expect(screen.getByTestId("source-list")).toHaveTextContent("O*NET OnLine");
    expect(screen.getByTestId("source-list")).toHaveTextContent("BLS OOH");
  });

  it("records stable SHA-256 hashes and keeps PR scope constrained", () => {
    expect(shaManifest["README.md"]).toBe(sha256(`${PACKAGE_DIR}/README.md`));
    expect(shaManifest["automotive-service-technicians-and-mechanics.zh-CN.asset.json"]).toBe(sha256(ASSET_PATH));
    expect(shaManifest["qa_report.json"]).toBe(sha256(QA_PATH));
    expect(shaManifest["dry_run_importer_report.json"]).toBe(sha256(DRY_RUN_PATH));
    expect(shaManifest["staging_preview_smoke.json"]).toBe(sha256(STAGING_SMOKE_PATH));
    expect(shaManifest["fap_web_render_smoke.json"]).toBe(sha256(RENDER_SMOKE_PATH));

    const manifest = readFileSync("docs/codex/pr-train.yaml", "utf8");
    const state = JSON.parse(readFileSync("docs/codex/pr-train-state.json", "utf8")) as Record<string, unknown>;
    expect(manifest).toContain("PR-CAREER-KG-09");
    expect(manifest).toContain("codex/pr-career-kg-09-auto-mechanics");
    expect(state["PR-CAREER-KG-08"]).toMatchObject({
      status: "merged",
      merge_commit_sha: "03babbd7b8984a284027287dd0dd310d2c2ea377",
    });
    expect(state["PR-CAREER-KG-09"]).toMatchObject({
      branch: "codex/pr-career-kg-09-auto-mechanics",
    });

    const files = currentChangedFiles();
    expect(files.every((file) => isPrCareerKg09AllowedFile(file)), files.join("\n")).toBe(true);
  });
});
