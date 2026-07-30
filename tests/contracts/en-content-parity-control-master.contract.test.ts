import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MANIFEST_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const SCHEMA_PATH = "docs/seo/generated/en-content-parity-control-master.v1.schema.json";
const PROMPTS_PATH = "docs/seo/generated/en-content-parity-first-wave-prompts.v1.json";
const VALIDATOR_PATH = "scripts/seo/validate-en-content-parity-control.mjs";
const ARTIFACT_FILES = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "sha256_manifest.json",
  "master_manifest_patch.candidate.json",
  "handoff.md",
];
const IMMUTABLE_PACKAGE_PAYLOAD_FILES = ARTIFACT_FILES.filter(
  (file) => file !== "sha256_manifest.json" && file !== "master_manifest_patch.candidate.json"
);

type Permissions = {
  cms_write_authorized: false;
  staging_write_authorized: false;
  production_import_authorized: false;
  public_release_authorized: false;
  seo_runtime_release_authorized: false;
  search_submission_authorized: false;
  master_manifest_write_authorized: false;
};

type Lane = {
  lane_id: string;
  lane_kind: "producer" | "independent_qa";
  launch_state: string;
  status: string;
  dependencies: string[];
  output_directory: string;
  subscopes: Array<{
    id: string;
    sequence: number;
    resource: string;
    output_subdirectory: string;
    separate_package_required: true;
    same_pr_allowed: false;
  }>;
  permissions: Permissions;
};

type Asset = {
  asset_id: string;
  lane_id: string;
  asset_type: string;
  translation_group: string;
  locales: string[];
  authority_source: string;
  expected_en_count: number | null;
  current_en_count: number | null;
  remaining_en_count: number | null;
  parity_state: string;
  evidence: string[];
  notes: string;
};

type MasterManifest = {
  artifact_kind: "master_manifest";
  control_id: string;
  is_master: true;
  baseline: {
    frontend: { commit_sha: string };
    backend: { commit_sha: string };
    live: {
      sitemap: {
        total_urls: number;
        zh_urls: number;
        en_urls: number;
        paired_paths: number;
        only_zh_paths: number;
        only_en_paths: number;
      };
      articles: { zh_public: number; en_public: number };
      career_guides: { zh_public: number; en_public: number };
      career_jobs: { zh_index_rows: number; en_index_rows: number };
    };
  };
  state_machine: {
    ordered_states: string[];
    blocked_state: string;
    skip_transitions_allowed: false;
  };
  handoff_contract: {
    required_files: string[];
    leaf_may_edit_master: false;
  };
  existing_state_reference: {
    path: string;
    usage: string;
    copy_or_reset_allowed: false;
  };
  lanes: Lane[];
  assets: Asset[];
  permissions: Permissions;
  launch_policy: {
    first_wave: string[];
    max_concurrent_producer_lanes: number;
  };
  repository_rule_impact: {
    runtime_behavior_changed: false;
    content_authority_changed: false;
    public_exposure_changed: false;
  };
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function sha256File(relativePath: string): string {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, relativePath))).digest("hex");
}

function sha256AbsoluteFile(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function packageSha256(files: Array<{ path: string; sha256: string }>): string {
  const canonicalEntries = files.map((file) => `${file.path}:${file.sha256}`).join("\n");
  return createHash("sha256").update(canonicalEntries).digest("hex");
}

function writePackagePayload(
  tempDirectory: string,
  scopeManifest: Record<string, unknown>,
  assets: Asset[]
): { packageSha256: string; reportSha256: string; shaManifestPath: string } {
  const packageId = String(scopeManifest.package_id);
  const laneId = String(scopeManifest.lane_id);
  const payloads = new Map<string, string>([
    ["scope_manifest.json", JSON.stringify(scopeManifest)],
    ["assets.jsonl", assets.map((asset) => JSON.stringify(asset)).join("\n")],
    ["translation_map.json", JSON.stringify({ lane_id: laneId, package_id: packageId, rows: [] })],
    ["source_ledger.json", JSON.stringify({ lane_id: laneId, package_id: packageId, assets })],
    ["claim_boundary_report.json", JSON.stringify({ lane_id: laneId, verdict: "PASS" })],
    ["editorial_review.json", JSON.stringify({ lane_id: laneId, verdict: "PENDING" })],
    ["dry_run_readiness.json", JSON.stringify({ lane_id: laneId, ready: false })],
    ["handoff.md", `# ${packageId}\n`],
  ]);

  for (const [fileName, contents] of payloads) {
    fs.writeFileSync(path.join(tempDirectory, fileName), contents);
  }

  const files = IMMUTABLE_PACKAGE_PAYLOAD_FILES.map((fileName) => ({
    path: fileName,
    sha256: sha256AbsoluteFile(path.join(tempDirectory, fileName)),
  }));
  const aggregateSha256 = packageSha256(files);
  const shaManifestPath = path.join(tempDirectory, "sha256_manifest.json");
  fs.writeFileSync(
    shaManifestPath,
    JSON.stringify({
      schema_version: "fermatmind.en_content_parity_package_sha256_manifest.v1",
      lane_id: laneId,
      package_id: packageId,
      files,
      package_sha256: aggregateSha256,
    })
  );

  return {
    packageSha256: aggregateSha256,
    reportSha256: files.find((file) => file.path === "source_ledger.json")?.sha256 ?? "",
    shaManifestPath,
  };
}

function collectPermissionValues(value: unknown): Array<[string, unknown]> {
  const found: Array<[string, unknown]> = [];
  const permissionKeys = new Set([
    "cms_write_authorized",
    "staging_write_authorized",
    "production_import_authorized",
    "public_release_authorized",
    "seo_runtime_release_authorized",
    "search_submission_authorized",
    "master_manifest_write_authorized",
  ]);

  function visit(current: unknown, currentPath: string) {
    if (Array.isArray(current)) {
      current.forEach((entry, index) => visit(entry, `${currentPath}/${index}`));
      return;
    }
    if (current === null || typeof current !== "object") {
      return;
    }
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${currentPath}/${key}`;
      if (permissionKeys.has(key)) {
        found.push([childPath, child]);
      }
      visit(child, childPath);
    }
  }

  visit(value, "$");
  return found;
}

function dependencyGraphIsAcyclic(lanes: Lane[]): boolean {
  const graph = new Map(lanes.map((lane) => [lane.lane_id, lane.dependencies]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(laneId: string): boolean {
    if (visiting.has(laneId)) {
      return false;
    }
    if (visited.has(laneId)) {
      return true;
    }
    visiting.add(laneId);
    for (const dependency of graph.get(laneId) ?? []) {
      if (!graph.has(dependency) || !visit(dependency)) {
        return false;
      }
    }
    visiting.delete(laneId);
    visited.add(laneId);
    return true;
  }

  return lanes.every((lane) => visit(lane.lane_id));
}

describe("English content parity control master", () => {
  const manifest = readJson<MasterManifest>(MANIFEST_PATH);

  it("keeps one master manifest with the frozen cross-repository and live baseline", () => {
    const generatedFiles = fs
      .readdirSync(path.join(ROOT, "docs/seo/generated"))
      .filter((name) => /^en-content-parity-control-master\.v\d+\.json$/.test(name));

    expect(generatedFiles).toEqual(["en-content-parity-control-master.v1.json"]);
    expect(manifest.artifact_kind).toBe("master_manifest");
    expect(manifest.control_id).toBe("EN-PARITY-CONTROL-BOOTSTRAP-01");
    expect(manifest.is_master).toBe(true);
    expect(manifest.baseline.frontend.commit_sha).toBe("c8b549636fcde1abbefe3aaddbd3635a7b4bcea6");
    expect(manifest.baseline.backend.commit_sha).toBe("6cca48a754a3dc7ab52cf40851aeb1d6005e4ee8");
    expect(manifest.baseline.live.sitemap).toEqual({
      total_urls: 2645,
      zh_urls: 1366,
      en_urls: 1278,
      paired_paths: 1268,
      only_zh_paths: 98,
      only_en_paths: 10,
    });
    expect(manifest.baseline.live.articles).toEqual({ zh_public: 89, en_public: 23 });
    expect(manifest.baseline.live.career_guides).toEqual({ zh_public: 20, en_public: 0 });
    expect(manifest.baseline.live.career_jobs).toMatchObject({ zh_index_rows: 1046, en_index_rows: 1046 });
  });

  it("registers eight non-overlapping producer lanes and one independent QA lane", () => {
    expect(manifest.lanes.map((lane) => lane.lane_id)).toEqual([
      "W1",
      "W2",
      "W3",
      "W4",
      "W5",
      "W6",
      "W7",
      "W8",
      "W9",
    ]);
    expect(manifest.lanes.filter((lane) => lane.lane_kind === "producer")).toHaveLength(8);
    expect(manifest.lanes.filter((lane) => lane.lane_kind === "independent_qa").map((lane) => lane.lane_id)).toEqual([
      "W9",
    ]);

    const outputDirectories = manifest.lanes.map((lane) => lane.output_directory);
    expect(new Set(outputDirectories).size).toBe(outputDirectories.length);
    expect(dependencyGraphIsAcyclic(manifest.lanes)).toBe(true);
  });

  it("makes only W1, W2, and W3 launch-ready without falsely freezing incomplete inventories", () => {
    const firstWave = manifest.lanes.filter((lane) => ["W1", "W2", "W3"].includes(lane.lane_id));
    expect(manifest.launch_policy.first_wave).toEqual(["W1", "W2", "W3"]);
    expect(manifest.launch_policy.max_concurrent_producer_lanes).toBe(3);
    expect(firstWave.every((lane) => lane.launch_state === "launch_ready")).toBe(true);
    expect(firstWave.map((lane) => [lane.lane_id, lane.status])).toEqual([
      ["W1", "not_started"],
      ["W2", "not_started"],
      ["W3", "inventory_frozen"],
    ]);

    const w3 = manifest.lanes.find((lane) => lane.lane_id === "W3");
    expect(w3?.subscopes).toEqual([
      {
        id: "W3-ARTICLES",
        sequence: 1,
        resource: "Article",
        output_subdirectory: "articles",
        separate_package_required: true,
        same_pr_allowed: false,
      },
      {
        id: "W3-CAREER-GUIDES",
        sequence: 2,
        resource: "CareerGuide",
        output_subdirectory: "career-guides",
        separate_package_required: true,
        same_pr_allowed: false,
      },
    ]);
  });

  it("keeps asset IDs and translation groups unique and reconciles every known count", () => {
    const assetIds = manifest.assets.map((asset) => asset.asset_id);
    const translationGroups = manifest.assets.map((asset) => asset.translation_group);
    expect(new Set(assetIds).size).toBe(assetIds.length);
    expect(new Set(translationGroups).size).toBe(translationGroups.length);

    for (const laneId of ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]) {
      expect(manifest.assets.some((asset) => asset.lane_id === laneId)).toBe(true);
    }

    for (const asset of manifest.assets) {
      const counts = [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count];
      const allKnown = counts.every((value) => Number.isInteger(value));
      const allNull = counts.every((value) => value === null);
      expect(allKnown || allNull, asset.asset_id).toBe(true);
      if (allKnown) {
        expect(asset.expected_en_count, asset.asset_id).toBe(
          (asset.current_en_count as number) + (asset.remaining_en_count as number)
        );
      }
    }
  });

  it("keeps every write, import, release, search, and master-edit permission false", () => {
    const permissions = collectPermissionValues(manifest);
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions.filter(([, value]) => value !== false)).toEqual([]);
    expect(manifest.handoff_contract.leaf_may_edit_master).toBe(false);
    expect(manifest.repository_rule_impact).toMatchObject({
      runtime_behavior_changed: false,
      content_authority_changed: false,
      public_exposure_changed: false,
    });
  });

  it("references the existing career state in place without modifying or replacing it", () => {
    expect(manifest.existing_state_reference).toEqual({
      path: "generated/fermatmind-content-agent-state/",
      usage: "reference_existing_career_state_without_duplication",
      copy_or_reset_allowed: false,
    });
    expect(fs.existsSync(path.join(ROOT, manifest.existing_state_reference.path, "global_content_state.json"))).toBe(true);

    const changedStateFiles = execFileSync(
      "git",
      ["diff", "HEAD", "--name-only", "--", "generated/fermatmind-content-agent-state"],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    expect(changedStateFiles).toBe("");
  });

  it("freezes the ordered no-skip state machine and ten-file handoff contract", () => {
    expect(manifest.state_machine).toEqual({
      ordered_states: [
        "not_started",
        "inventory_frozen",
        "package_in_progress",
        "package_frozen",
        "qa_pass",
        "dry_run_ready",
        "draft_imported",
        "editorial_approved",
        "published",
        "live_qa_pass",
      ],
      blocked_state: "blocked",
      skip_transitions_allowed: false,
    });
    expect(manifest.handoff_contract.required_files).toEqual([
      "scope_manifest.json",
      "assets.jsonl",
      "translation_map.json",
      "source_ledger.json",
      "claim_boundary_report.json",
      "editorial_review.json",
      "dry_run_readiness.json",
      "sha256_manifest.json",
      "master_manifest_patch.candidate.json",
      "handoff.md",
    ]);
  });

  it("ships complete immutable launch prompts for W1, W2, and W3", () => {
    const bundle = readJson<{
      control_id: string;
      prompts: Array<{ lane_id: string; output_directory: string; prompt: string; acceptance: string[] }>;
    }>(PROMPTS_PATH);

    expect(bundle.control_id).toBe("EN-PARITY-CONTROL-BOOTSTRAP-01");
    expect(bundle.prompts.map((prompt) => prompt.lane_id)).toEqual(["W1", "W2", "W3"]);
    for (const prompt of bundle.prompts) {
      expect(prompt.output_directory).toMatch(/^generated\/en-content-parity\/W[1-3]-/);
      expect(prompt.prompt.length).toBeGreaterThan(800);
      expect(prompt.prompt).toContain("master_manifest_patch.candidate.json");
      expect(prompt.acceptance.length).toBeGreaterThanOrEqual(5);
    }
  });

  it("passes the shared Schema and invariant validator", () => {
    expect(fs.existsSync(path.join(ROOT, SCHEMA_PATH))).toBe(true);
    const output = execFileSync("node", [VALIDATOR_PATH], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const report = JSON.parse(output) as {
      ok: boolean;
      lane_count: number;
      producer_lane_count: number;
      qa_lane_count: number;
      errors: string[];
    };

    expect(report).toMatchObject({
      ok: true,
      lane_count: 9,
      producer_lane_count: 8,
      qa_lane_count: 1,
      errors: [],
    });
  });

  it("uses the same Schema to validate a lane package and candidate master patch", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-"));
    const packagePath = path.join(tempDirectory, "scope_manifest.json");
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    const inventoryAssets = manifest.assets
      .filter((entry) => entry.lane_id === "W1")
      .map((asset) =>
        asset.parity_state === "inventory_required"
          ? {
              ...asset,
              expected_en_count: 16,
              current_en_count: 0,
              remaining_en_count: 16,
              parity_state: "en_missing",
            }
          : asset
      );
    expect(inventoryAssets).toHaveLength(2);

    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      package_id: "W1-contract-sample",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: inventoryAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, inventoryAssets);
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        package_id: "W1-contract-sample",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          asset_ids: inventoryAssets.map((asset) => asset.asset_id),
          row_count: inventoryAssets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0),
        },
        asset_updates: inventoryAssets,
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--artifact", packagePath, "--artifact", patchPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      const report = JSON.parse(output) as { ok: boolean; checked_artifacts: string[]; errors: string[] };
      expect(report.ok).toBe(true);
      expect(report.checked_artifacts).toContain(packagePath);
      expect(report.checked_artifacts).toContain(patchPath);
      expect(report.errors).toEqual([]);
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("accepts only the two registered W3 package subdirectories", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-"));
    const articleAsset = manifest.assets.find((entry) => entry.asset_id === "ENPARITY-W3-ARTICLES");
    if (!articleAsset) {
      throw new Error("missing W3 Article asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const makePackage = (outputDirectory: string) => ({
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W3",
      package_id: "W3-ARTICLES-contract-sample",
      status: "package_in_progress",
      output_directory: outputDirectory,
      artifact_files: ARTIFACT_FILES,
      assets: [articleAsset],
      permissions,
    });
    const validPackagePath = path.join(tempDirectory, "valid-scope.json");
    const invalidPackagePath = path.join(tempDirectory, "invalid-scope.json");
    fs.writeFileSync(validPackagePath, JSON.stringify(makePackage("generated/en-content-parity/W3-editorial-cms/articles/")));
    fs.writeFileSync(invalidPackagePath, JSON.stringify(makePackage("generated/en-content-parity/W3-editorial-cms/")));

    try {
      const validOutput = execFileSync("node", [VALIDATOR_PATH, "--artifact", validPackagePath], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(JSON.parse(validOutput)).toMatchObject({ ok: true, errors: [] });

      let invalidOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", invalidPackagePath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        invalidOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
        "package output_directory must match the master registry"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects stale, skipping, colliding, duplicate, and unreconciled leaf submissions", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-invalid-"));
    const asset = manifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const invalidAssets = [
      {
        ...asset,
        authority_source: "frontend invented authority",
        expected_en_count: 7,
        current_en_count: 7,
        remaining_en_count: 7,
      },
      {
        ...asset,
      },
    ];
    const invalidPackagePath = path.join(tempDirectory, "scope_manifest.json");
    const invalidPatchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    const invalidScopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      package_id: "W1-invalid-contract-sample",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W2-big-five/",
      artifact_files: ARTIFACT_FILES,
      assets: invalidAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, invalidScopeManifest, invalidAssets);
    fs.writeFileSync(
      invalidPatchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        package_id: "W1-invalid-contract-sample",
        base_manifest_sha256: "0".repeat(64),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "published",
        gate_evidence: {
          gate: "published",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          asset_ids: [asset.asset_id],
          row_count: 7,
        },
        asset_updates: invalidAssets,
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--artifact", invalidPackagePath, "--artifact", invalidPatchPath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package output_directory must match the master registry");
      expect(report.errors.join("\n")).toContain("base_manifest_sha256 must match the current master manifest");
      expect(report.errors.join("\n")).toContain("proposed_status must be blocked or the immediate next state inventory_frozen");
      expect(report.errors.join("\n")).toContain("asset IDs must be unique");
      expect(report.errors.join("\n")).toContain("translation groups must be unique");
      expect(report.errors.join("\n")).toContain("expected count must equal current plus remaining");
      expect(report.errors.join("\n")).toContain("protected field authority_source cannot change from the master registry");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects inventory freeze without a complete reconciled lane inventory", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-empty-inventory-"));
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      package_id: "W1-empty-inventory",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, []);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        package_id: "W1-empty-inventory",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          asset_ids: [],
          row_count: 0,
        },
        asset_updates: [],
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("inventory_frozen requires every registered lane asset cohort");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a package SHA manifest when a covered payload file changes", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-tamper-"));
    const asset = manifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      package_id: "W1-tampered-package",
      status: "blocked",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [asset],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [asset]);
    fs.appendFileSync(path.join(tempDirectory, "source_ledger.json"), "\nTAMPERED");
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        package_id: "W1-tampered-package",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "blocked",
        gate_evidence: {
          gate: "blocked",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          asset_ids: [asset.asset_id],
          row_count: 1,
        },
        asset_updates: [asset],
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package payload SHA mismatch: source_ledger.json");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});
