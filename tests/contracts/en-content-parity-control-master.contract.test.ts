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
const REGISTERED_PACKAGE_BACKUPS = new Map<string, string>();

type Permissions = {
  cms_write_authorized: false;
  staging_write_authorized: false;
  production_import_authorized: false;
  public_release_authorized: false;
  seo_runtime_release_authorized: false;
  search_submission_authorized: false;
  master_manifest_write_authorized: false;
};

type GateLineageEntry = {
  status: string;
  evidence_owner_lane_id: string;
  report_ref: string;
  report_sha256: string;
  package_sha256: string;
  accepted_at: string;
};

type Lane = {
  lane_id: string;
  lane_kind: "producer" | "independent_qa";
  launch_state: string;
  status: string;
  blocked_from_status: string | null;
  dependencies: string[];
  output_directory: string;
  counts: {
    cohort_count: number;
    expected_en_assets: number | null;
    current_en_assets: number | null;
    remaining_en_assets: number | null;
    unknown_inventory_cohorts: number;
  };
  package_sha256: string | null;
  qa_report_ref: string | null;
  gate_lineage: GateLineageEntry[];
  blockers: string[];
  next_action: string;
  subscopes: Array<{
    id: string;
    sequence: number;
    resource: string;
    output_subdirectory: string;
    asset_ids: string[];
    status: string;
    blocked_from_status: string | null;
    package_sha256: string | null;
    qa_report_ref: string | null;
    gate_lineage: GateLineageEntry[];
    blockers: string[];
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

function makeW9QaDirectory(): string {
  const authorityDirectory = path.join(ROOT, "generated/en-content-parity/W9-independent-qa");
  fs.mkdirSync(authorityDirectory, { recursive: true });
  return fs.mkdtempSync(path.join(authorityDirectory, "contract-"));
}

function makeControlApprovalDirectory(): string {
  const authorityDirectory = path.join(ROOT, "generated/en-content-parity/CONTROL-approvals");
  fs.mkdirSync(authorityDirectory, { recursive: true });
  return fs.mkdtempSync(path.join(authorityDirectory, "contract-"));
}

function makeRegisteredPackageDirectory(outputDirectory: string): string {
  const packageDirectory = path.join(ROOT, outputDirectory);
  fs.mkdirSync(packageDirectory, { recursive: true });
  const existingArtifacts = ARTIFACT_FILES.filter((fileName) =>
    fs.existsSync(path.join(packageDirectory, fileName))
  );
  if (existingArtifacts.length > 0) {
    const backupDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-content-parity-contract-package-")
    );
    const movedArtifacts: string[] = [];
    try {
      for (const fileName of existingArtifacts) {
        fs.renameSync(
          path.join(packageDirectory, fileName),
          path.join(backupDirectory, fileName)
        );
        movedArtifacts.push(fileName);
      }
      REGISTERED_PACKAGE_BACKUPS.set(packageDirectory, backupDirectory);
    } catch (error) {
      for (const fileName of movedArtifacts.reverse()) {
        fs.renameSync(
          path.join(backupDirectory, fileName),
          path.join(packageDirectory, fileName)
        );
      }
      fs.rmdirSync(backupDirectory);
      throw error;
    }
  }
  return packageDirectory;
}

function cleanupRegisteredPackageDirectory(
  packageDirectory: string,
  extraFileNames: string[] = []
): void {
  for (const fileName of [...ARTIFACT_FILES, ...extraFileNames]) {
    fs.rmSync(path.join(packageDirectory, fileName), { force: true });
  }
  const backupDirectory = REGISTERED_PACKAGE_BACKUPS.get(packageDirectory);
  if (backupDirectory) {
    for (const fileName of fs.readdirSync(backupDirectory)) {
      fs.renameSync(
        path.join(backupDirectory, fileName),
        path.join(packageDirectory, fileName)
      );
    }
    fs.rmdirSync(backupDirectory);
    REGISTERED_PACKAGE_BACKUPS.delete(packageDirectory);
    return;
  }
  try {
    fs.rmdirSync(packageDirectory);
  } catch {
    // Preserve a pre-existing or non-empty generated directory.
  }
}

function writePackagePayload(
  tempDirectory: string,
  scopeManifest: Record<string, unknown>,
  assets: Asset[],
  payloadAssets: Asset[] = assets
): { packageSha256: string; reportSha256: string; shaManifestPath: string } {
  const packageId = String(scopeManifest.package_id);
  const laneId = String(scopeManifest.lane_id);
  const subscopeId = scopeManifest.subscope_id ?? null;
  const ledgerRows = payloadAssets.flatMap((asset) =>
    Array.from({ length: asset.expected_en_count ?? 0 }, (_, index) => ({
      row_id: `${asset.asset_id}:${index + 1}`,
      asset_id: asset.asset_id,
      source_id: `${asset.translation_group}:${index + 1}`,
    }))
  );
  const payloads = new Map<string, string>([
    ["scope_manifest.json", JSON.stringify(scopeManifest)],
    ["assets.jsonl", payloadAssets.map((asset) => JSON.stringify(asset)).join("\n")],
    ["translation_map.json", JSON.stringify({ lane_id: laneId, package_id: packageId, rows: [] })],
    [
      "source_ledger.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_source_ledger.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        rows: ledgerRows,
      }),
    ],
    [
      "claim_boundary_report.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_claim_boundary_report.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        verdict: "PASS",
      }),
    ],
    [
      "editorial_review.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_editorial_review.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        verdict: "PASS",
      }),
    ],
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
      subscope_id: subscopeId,
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

  it("keeps W1, W2, and W3 launch-ready while allowing the master state to progress", () => {
    const firstWave = manifest.lanes.filter((lane) => ["W1", "W2", "W3"].includes(lane.lane_id));
    expect(manifest.launch_policy.first_wave).toEqual(["W1", "W2", "W3"]);
    expect(manifest.launch_policy.max_concurrent_producer_lanes).toBe(3);
    expect(firstWave.every((lane) => lane.launch_state === "launch_ready")).toBe(true);
    expect(
      firstWave.every(
        (lane) => manifest.state_machine.ordered_states.includes(lane.status) || lane.status === "blocked"
      )
    ).toBe(true);

    const w3 = manifest.lanes.find((lane) => lane.lane_id === "W3");
    expect(
      w3?.subscopes.map((subscope) => ({
        id: subscope.id,
        sequence: subscope.sequence,
        resource: subscope.resource,
        output_subdirectory: subscope.output_subdirectory,
        asset_ids: subscope.asset_ids,
        separate_package_required: subscope.separate_package_required,
        same_pr_allowed: subscope.same_pr_allowed,
      }))
    ).toEqual([
      {
        id: "W3-ARTICLES",
        sequence: 1,
        resource: "Article",
        output_subdirectory: "articles",
        asset_ids: ["ENPARITY-W3-ARTICLES"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
      {
        id: "W3-CAREER-GUIDES",
        sequence: 2,
        resource: "CareerGuide",
        output_subdirectory: "career-guides",
        asset_ids: ["ENPARITY-W3-CAREER-GUIDES"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
    ]);
    expect(
      w3?.subscopes.every(
        (subscope) =>
          manifest.state_machine.ordered_states.includes(subscope.status) || subscope.status === "blocked"
      )
    ).toBe(true);
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

  it("continues to validate after the control window advances a master lane", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-progressed-master-"));
    const progressedManifestPath = path.join(tempDirectory, "en-content-parity-control-master.v1.json");
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    if (!w1) {
      throw new Error("missing W1 lane fixture");
    }
    w1.status = "inventory_frozen";
    let expectedTotal = 0;
    let currentTotal = 0;
    let remainingTotal = 0;
    progressedManifest.assets = progressedManifest.assets.map((asset) => {
      if (asset.lane_id !== "W1") {
        return asset;
      }
      const frozenAsset =
        asset.parity_state === "inventory_required"
          ? {
              ...asset,
              expected_en_count: 16,
              current_en_count: 0,
              remaining_en_count: 16,
              parity_state: "en_missing",
            }
          : asset;
      expectedTotal += frozenAsset.expected_en_count ?? 0;
      currentTotal += frozenAsset.current_en_count ?? 0;
      remainingTotal += frozenAsset.remaining_en_count ?? 0;
      return frozenAsset;
    });
    w1.counts = {
      cohort_count: 2,
      expected_en_assets: expectedTotal,
      current_en_assets: currentTotal,
      remaining_en_assets: remainingTotal,
      unknown_inventory_cohorts: 0,
    };
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      const output = execFileSync("node", [VALIDATOR_PATH, "--manifest", progressedManifestPath], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(JSON.parse(output)).toMatchObject({
        ok: true,
        checked_artifacts: [progressedManifestPath],
        errors: [],
      });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a progressed master that omits frozen-package and QA gate lineage", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-missing-lineage-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    if (!w3 || !articles) {
      throw new Error("missing W3 Article subscope fixture");
    }
    articles.status = "qa_pass";
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    w3.status = "inventory_frozen";
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--manifest", progressedManifestPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package_frozen and later states require package_sha256");
      expect(report.errors.join("\n")).toContain("gate lineage must contain every achieved state");
      expect(report.errors.join("\n")).toContain("qa_pass and later states require qa_report_ref");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("retains and restores the pre-block state through an explicit recovery transition", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-block-recovery-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W3-editorial-cms/articles/"
    );
    const candidatePath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const recoveryReportPath = path.join(tempDirectory, "recovery-report.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    const articleAsset = progressedManifest.assets.find((asset) => asset.asset_id === "ENPARITY-W3-ARTICLES");
    if (!w3 || !articles || !articleAsset) {
      throw new Error("missing W3 Article recovery fixture");
    }
    articles.status = "inventory_frozen";
    articles.blocked_from_status = null;
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    w3.status = "blocked";
    w3.blocked_from_status = "inventory_frozen";
    articles.status = "blocked";
    articles.blocked_from_status = "inventory_frozen";
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

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
      lane_id: "W3",
      subscope_id: "W3-ARTICLES",
      package_id: "W3-ARTICLES-recovery",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W3-editorial-cms/articles/",
      artifact_files: ARTIFACT_FILES,
      assets: [articleAsset],
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, [articleAsset]);
    fs.writeFileSync(
      recoveryReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "transition_gate_report",
        schema_version: "fermatmind.en_content_parity_transition_gate_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        owner_lane_id: "W3",
        producer_lane_id: "W3",
        subscope_id: "W3-ARTICLES",
        package_sha256: packageEvidence.packageSha256,
        gate: "inventory_frozen",
        verdict: "PASS",
        permissions,
      })
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W3",
        subscope_id: "W3-ARTICLES",
        package_id: "W3-ARTICLES-recovery",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: recoveryReportPath,
          report_sha256: sha256AbsoluteFile(recoveryReportPath),
          report_in_package: false,
          owner_lane_id: "W3",
          verdict: "PASS",
          asset_ids: [articleAsset.asset_id],
          row_count: articleAsset.expected_en_count ?? 0,
        },
        asset_updates: [articleAsset],
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("validates the standalone W9 independent QA report contract", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-"));
    const qaAuthorityDirectory = makeW9QaDirectory();
    const qaReportPath = path.join(qaAuthorityDirectory, "independent-qa-report.json");
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const assets = progressedManifest.assets
      .filter((entry) => entry.lane_id === "W1")
      .map((asset) =>
        asset.expected_en_count === null
          ? {
              ...asset,
              expected_en_count: 1,
              current_en_count: 0,
              remaining_en_count: 1,
              parity_state: "en_missing",
            }
          : asset
      );
    if (!w1 || assets.length === 0) {
      throw new Error("missing W1 asset fixtures");
    }
    progressedManifest.assets = progressedManifest.assets.map(
      (asset) => assets.find((frozenAsset) => frozenAsset.asset_id === asset.asset_id) ?? asset
    );
    const expectedRows = assets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0);
    w1.status = "blocked";
    w1.blocked_from_status = "package_frozen";
    w1.package_sha256 = "a".repeat(64);
    w1.counts = {
      cohort_count: assets.length,
      expected_en_assets: expectedRows,
      current_en_assets: assets.reduce((total, asset) => total + (asset.current_en_count ?? 0), 0),
      remaining_en_assets: assets.reduce((total, asset) => total + (asset.remaining_en_count ?? 0), 0),
      unknown_inventory_cohorts: 0,
    };
    w1.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W1",
        report_ref: "fixture://package-frozen",
        report_sha256: "b".repeat(64),
        package_sha256: "a".repeat(64),
        accepted_at: "2026-07-30T12:00:00.000Z",
      },
    ];
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: null,
        package_sha256: "a".repeat(64),
        verdict: "BLOCKED",
        reviewed_asset_ids: assets.map((asset) => asset.asset_id),
        reviewed_row_count: expectedRows,
        checks: {
          language_naturalness: "BLOCKED",
          chinese_leakage: "PASS",
          claim_boundary: "PASS",
          asset_duplication: "PASS",
          field_leakage: "PASS",
          page_api_alignment: "PASS",
        },
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", qaReportPath],
        {
        cwd: ROOT,
        encoding: "utf8",
        }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(qaAuthorityDirectory, { recursive: true, force: true });
    }
  });

  it("accepts a W9-owned blocker candidate only with exact report and row-evidence SHAs", () => {
    const candidateDirectory = makeW9QaDirectory();
    const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
    const checkedInCandidatePath = path.join(
      ROOT,
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45/master_manifest_patch.candidate.json"
    );
    const candidate = JSON.parse(fs.readFileSync(checkedInCandidatePath, "utf8")) as {
      proposed_status: string;
      gate_evidence: {
        owner_lane_id: string;
        verdict: string;
        row_count: number;
        report_path: string;
        report_sha256: string;
        row_evidence: { path: string; sha256: string };
      };
      permissions: Permissions;
    };
    const checkedInDirectory = path.dirname(checkedInCandidatePath);
    const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
    const rowEvidencePath = path.join(candidateDirectory, "article_17_row_review_evidence.json");
    const qaReport = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
    ) as { permissions: Record<string, boolean> };
    const rowEvidence = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
    ) as { permissions: Record<string, boolean> };
    qaReport.permissions = Object.fromEntries(Object.entries(qaReport.permissions).reverse());
    rowEvidence.permissions = Object.fromEntries(Object.entries(rowEvidence.permissions).reverse());
    fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
    fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
    candidate.gate_evidence.report_path = qaReportPath;
    candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
    candidate.gate_evidence.row_evidence.path = rowEvidencePath;
    candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      expect(candidate).toMatchObject({
        proposed_status: "blocked",
        gate_evidence: {
          owner_lane_id: "W9",
          verdict: "BLOCKED",
          row_count: 17,
        },
      });
      expect(Object.values(candidate.permissions)).toEqual(
        Array(Object.keys(candidate.permissions).length).fill(false)
      );

      candidate.gate_evidence.row_evidence.sha256 = "0".repeat(64);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      let failedOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", candidatePath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        failedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(failedOutput).errors.join("\n")).toContain("W9 row evidence SHA mismatch");
    } finally {
      fs.rmSync(candidateDirectory, { recursive: true, force: true });
    }
  });

  it.each(["source_equivalence_identity", "internal_link_equivalence"])(
    "accepts a W9 blocker caused only by the %s row check",
    (blockedRowCheck) => {
      const candidateDirectory = makeW9QaDirectory();
      const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
      const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
      const rowEvidencePath = path.join(
        candidateDirectory,
        "article_17_row_review_evidence.json"
      );
      const checkedInDirectory = path.join(
        ROOT,
        "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45"
      );
      const candidate = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "master_manifest_patch.candidate.json"), "utf8")
      ) as {
        gate_evidence: {
          report_path: string;
          report_sha256: string;
          row_evidence: { path: string; sha256: string };
        };
      };
      const qaReport = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
      ) as { checks: Record<string, string> };
      const rowEvidence = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
      ) as {
        required_checks: Record<string, string>;
        row_reviews: Array<{
          verdict: "PASS" | "BLOCKED";
          checks: Record<string, string>;
        }>;
      };
      for (const check of Object.keys(qaReport.checks)) {
        qaReport.checks[check] = "PASS";
        rowEvidence.required_checks[check] = "PASS";
      }
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.verdict = "PASS";
        for (const check of Object.keys(rowReview.checks)) {
          rowReview.checks[check] = "PASS";
        }
      }
      rowEvidence.row_reviews[0]!.checks[blockedRowCheck] = "BLOCKED";
      rowEvidence.row_reviews[0]!.verdict = "BLOCKED";
      const aggregateCheck =
        blockedRowCheck === "source_equivalence_identity"
          ? "asset_duplication"
          : "field_leakage";
      qaReport.checks[aggregateCheck] = "BLOCKED";
      rowEvidence.required_checks[aggregateCheck] = "BLOCKED";
      fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      candidate.gate_evidence.report_path = qaReportPath;
      candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
      candidate.gate_evidence.row_evidence.path = rowEvidencePath;
      candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));

      try {
        const output = execFileSync("node", [VALIDATOR_PATH, "--artifact", candidatePath], {
          cwd: ROOT,
          encoding: "utf8",
        });
        expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      } finally {
        fs.rmSync(candidateDirectory, { recursive: true, force: true });
      }
    }
  );

  it.each([
    "zero self-reported counts",
    "empty row reviews",
    "duplicate row identity",
    "missing row identity",
    "unknown row identity",
    "missing substantive row fields",
    "empty substantive row evidence",
    "incomplete row checks",
    "row verdict mismatch",
    "aggregate check mismatch",
    "source equivalence aggregate mismatch",
    "internal link aggregate mismatch",
    "row ID and identity pairing mismatch",
    "report permission true",
    "report permission missing",
    "report permission drift",
    "row evidence permission true",
    "row evidence permission missing",
    "row evidence permission drift",
    "aggregate Chinese leakage without blocked row",
    "missing row Chinese leakage",
    "invalid row Chinese leakage verdict",
    "report schema missing",
    "report schema unexpected property",
    ...[
      "language_naturalness",
      "chinese_leakage",
      "claim_boundary",
      "asset_duplication",
      "field_leakage",
      "page_api_alignment",
    ].map((check) => `invalid QA verdict for ${check}`),
  ])("rejects a W9 blocker candidate with %s", (failureMode) => {
    const candidateDirectory = makeW9QaDirectory();
    const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
    const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
    const rowEvidencePath = path.join(candidateDirectory, "article_17_row_review_evidence.json");
    const checkedInDirectory = path.join(
      ROOT,
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45"
    );
    const candidate = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "master_manifest_patch.candidate.json"), "utf8")
    ) as {
      gate_evidence: {
        report_path: string;
        report_sha256: string;
        row_count: number;
        row_evidence: { path: string; sha256: string };
      };
    };
    const qaReport = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
    ) as {
      $schema?: string;
      reviewed_row_count: number;
      checks: Record<string, string>;
      permissions: Record<string, boolean>;
      unexpected_contract_field?: boolean;
    };
    const rowEvidence = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
    ) as {
      reviewed_row_count: number;
      required_checks: Record<string, string>;
      permissions: Record<string, boolean>;
      row_reviews: Array<{
        row_id: string;
        source_identity: string;
        title_excerpt_full_body_reviewed?: boolean;
        verdict?: "PASS" | "BLOCKED";
        checks?: Record<string, string>;
        evidence?: string;
      }>;
    };

    if (failureMode === "zero self-reported counts") {
      candidate.gate_evidence.row_count = 0;
      qaReport.reviewed_row_count = 0;
      rowEvidence.reviewed_row_count = 0;
    } else if (failureMode === "empty row reviews") {
      rowEvidence.row_reviews = [];
    } else if (failureMode === "duplicate row identity") {
      rowEvidence.row_reviews.at(-1)!.source_identity = rowEvidence.row_reviews[0]!.source_identity;
    } else if (failureMode === "missing row identity") {
      rowEvidence.row_reviews.pop();
    } else if (failureMode === "unknown row identity") {
      rowEvidence.row_reviews.at(-1)!.source_identity = "Article:999@revision:999";
    } else if (failureMode === "missing substantive row fields") {
      delete rowEvidence.row_reviews[0]!.title_excerpt_full_body_reviewed;
      delete rowEvidence.row_reviews[0]!.verdict;
      delete rowEvidence.row_reviews[0]!.checks;
      delete rowEvidence.row_reviews[0]!.evidence;
    } else if (failureMode === "empty substantive row evidence") {
      rowEvidence.row_reviews[0]!.evidence = "   ";
    } else if (failureMode === "incomplete row checks") {
      delete rowEvidence.row_reviews[0]!.checks!.claim_boundary;
    } else if (failureMode === "row verdict mismatch") {
      rowEvidence.row_reviews[0]!.verdict = "PASS";
    } else if (failureMode === "aggregate check mismatch") {
      qaReport.checks.language_naturalness = "PASS";
      rowEvidence.required_checks.language_naturalness = "PASS";
    } else if (failureMode === "source equivalence aggregate mismatch") {
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.checks!.source_equivalence_identity = "PASS";
        rowReview.checks!.asset_media_duplication_omission = "PASS";
      }
      rowEvidence.row_reviews[0]!.checks!.source_equivalence_identity = "BLOCKED";
      qaReport.checks.asset_duplication = "PASS";
      rowEvidence.required_checks.asset_duplication = "PASS";
    } else if (failureMode === "internal link aggregate mismatch") {
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.checks!.internal_link_equivalence = "PASS";
        rowReview.checks!.field_leakage = "PASS";
      }
      rowEvidence.row_reviews[0]!.checks!.internal_link_equivalence = "BLOCKED";
      qaReport.checks.field_leakage = "PASS";
      rowEvidence.required_checks.field_leakage = "PASS";
    } else if (failureMode === "row ID and identity pairing mismatch") {
      const firstIdentity = rowEvidence.row_reviews[0]!.source_identity;
      rowEvidence.row_reviews[0]!.source_identity = rowEvidence.row_reviews[1]!.source_identity;
      rowEvidence.row_reviews[1]!.source_identity = firstIdentity;
    } else if (failureMode === "report permission true") {
      qaReport.permissions.public_release_authorized = true;
    } else if (failureMode === "report permission missing") {
      delete qaReport.permissions.public_release_authorized;
    } else if (failureMode === "report permission drift") {
      qaReport.permissions.report_only_authorized = false;
    } else if (failureMode === "row evidence permission true") {
      rowEvidence.permissions.production_import_authorized = true;
    } else if (failureMode === "row evidence permission missing") {
      delete rowEvidence.permissions.production_import_authorized;
    } else if (failureMode === "row evidence permission drift") {
      rowEvidence.permissions.row_evidence_only_authorized = false;
    } else if (failureMode === "aggregate Chinese leakage without blocked row") {
      qaReport.checks.chinese_leakage = "BLOCKED";
      rowEvidence.required_checks.chinese_leakage = "BLOCKED";
    } else if (failureMode === "missing row Chinese leakage") {
      delete rowEvidence.row_reviews[0]!.checks!.chinese_leakage;
    } else if (failureMode === "invalid row Chinese leakage verdict") {
      rowEvidence.row_reviews[0]!.checks!.chinese_leakage = "NOT_REVIEWED";
    } else if (failureMode === "report schema missing") {
      delete qaReport.$schema;
    } else if (failureMode === "report schema unexpected property") {
      qaReport.unexpected_contract_field = true;
    } else if (failureMode.startsWith("invalid QA verdict for ")) {
      const check = failureMode.replace("invalid QA verdict for ", "");
      qaReport.checks[check] = "NOT_REVIEWED";
      rowEvidence.required_checks[check] = "NOT_REVIEWED";
    }

    fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
    fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
    candidate.gate_evidence.report_path = qaReportPath;
    candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
    candidate.gate_evidence.row_evidence.path = rowEvidencePath;
    candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      let failedOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", candidatePath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        failedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      const errors = (JSON.parse(failedOutput) as { errors: string[] }).errors.join("\n");
      if (failureMode === "zero self-reported counts") {
        expect(errors).toContain("W9 blocker row count must cover the complete registered target");
      } else if (failureMode === "empty row reviews" || failureMode === "missing row identity") {
        expect(errors).toContain("W9 row_reviews must contain every registered target row");
      } else if (failureMode === "duplicate row identity") {
        expect(errors).toContain("W9 row review identities must be unique");
      } else if (failureMode === "unknown row identity") {
        expect(errors).toContain("W9 row review identities must exactly cover the frozen target identities");
      } else if (failureMode === "missing substantive row fields") {
        expect(errors).toContain("every W9 row review must confirm title, excerpt, and full body review");
        expect(errors).toContain("every W9 row review must include substantive evidence");
      } else if (failureMode === "empty substantive row evidence") {
        expect(errors).toContain("every W9 row review must include substantive evidence");
      } else if (failureMode === "incomplete row checks") {
        expect(errors).toContain("every W9 row review must include every required row check");
      } else if (failureMode === "row verdict mismatch") {
        expect(errors).toContain("every W9 row review verdict must match its row checks");
      } else if (failureMode === "aggregate check mismatch") {
        expect(errors).toContain("W9 aggregate check language_naturalness must match the row reviews");
      } else if (
        failureMode === "source equivalence aggregate mismatch"
      ) {
        expect(errors).toContain("W9 aggregate check asset_duplication must match the row reviews");
      } else if (failureMode === "internal link aggregate mismatch") {
        expect(errors).toContain("W9 aggregate check field_leakage must match the row reviews");
      } else if (failureMode === "row ID and identity pairing mismatch") {
        expect(errors).toContain("every W9 row review must preserve its frozen row ID and identity pairing");
      } else if (failureMode === "report permission true") {
        expect(errors).toContain("$/w9_qa_report/permissions/public_release_authorized: permission must remain false");
      } else if (failureMode === "report permission missing") {
        expect(errors).toContain("W9 QA report: permissions must include exactly the controlled permission keys");
        expect(errors).toContain("W9 QA report: permissions must exactly match the blocker candidate");
      } else if (failureMode === "report permission drift") {
        expect(errors).toContain("W9 QA report: permissions must include exactly the controlled permission keys");
      } else if (failureMode === "row evidence permission true") {
        expect(errors).toContain(
          "$/w9_row_evidence/permissions/production_import_authorized: permission must remain false"
        );
      } else if (
        failureMode === "row evidence permission missing"
      ) {
        expect(errors).toContain("W9 row evidence: permissions must include exactly the controlled permission keys");
        expect(errors).toContain("W9 row evidence: permissions must exactly match the blocker candidate");
      } else if (failureMode === "row evidence permission drift") {
        expect(errors).toContain("W9 row evidence: permissions must include exactly the controlled permission keys");
      } else if (failureMode === "aggregate Chinese leakage without blocked row") {
        expect(errors).toContain("W9 aggregate check chinese_leakage must match the row reviews");
      } else if (failureMode === "missing row Chinese leakage") {
        expect(errors).toContain("every W9 row review must include every required row check");
      } else if (failureMode === "invalid row Chinese leakage verdict") {
        expect(errors).toContain("every W9 row review check must be PASS or BLOCKED");
      } else if (failureMode === "report schema missing") {
        expect(errors).toContain("W9 QA report Schema error: $: oneOf matched 0 branches");
        expect(errors).toContain("missing required property $schema");
      } else if (failureMode === "report schema unexpected property") {
        expect(errors).toContain("W9 QA report Schema error: $: oneOf matched 0 branches");
        expect(errors).toContain("unexpected property unexpected_contract_field");
      } else if (failureMode.startsWith("invalid QA verdict for ")) {
        const check = failureMode.replace("invalid QA verdict for ", "");
        expect(errors).toContain(`W9 QA check ${check} must be PASS or BLOCKED`);
      }
    } finally {
      fs.rmSync(candidateDirectory, { recursive: true, force: true });
    }
  });

  it("accepts a CONTROL-only rework reset after exact-SHA W9 blocks a frozen package", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-rework-"));
    const invalidApprovalDirectory = makeControlApprovalDirectory();
    const invalidW9Directory = makeW9QaDirectory();
    const blockedManifestPath = path.join(tempDirectory, "blocked-master.json");
    const reworkManifestPath = path.join(tempDirectory, "rework-master.json");
    const reworkApprovalPath =
      "generated/en-content-parity/CONTROL-approvals/W3-ARTICLES/package-rework-reset-7bdbf91b.json";
    const invalidApprovalPath = path.join(
      invalidApprovalDirectory,
      "invalid-package-rework-reset.json"
    );
    const blockedManifest = structuredClone(manifest);
    const blockedW3 = blockedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const blockedArticles = blockedW3?.subscopes.find(
      (subscope) => subscope.id === "W3-ARTICLES"
    );
    if (!blockedW3 || !blockedArticles) {
      throw new Error("missing W3 blocked reset fixture");
    }
    blockedW3.status = "blocked";
    blockedW3.blocked_from_status = "inventory_frozen";
    blockedArticles.status = "blocked";
    blockedArticles.blocked_from_status = "package_frozen";
    blockedArticles.package_sha256 =
      "7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750";
    blockedArticles.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W3",
        report_ref:
          "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
        report_sha256:
          "feb60cca6237c9c8113a31e510ffc38cad8828a3f639faab9674fec02ea0716b",
        package_sha256:
          "7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750",
        accepted_at: "2026-07-30T20:50:31.000Z",
      },
    ];
    fs.writeFileSync(blockedManifestPath, JSON.stringify(blockedManifest));

    const reworkManifest = structuredClone(blockedManifest);
    const w3 = reworkManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    const careerGuides = w3?.subscopes.find(
      (subscope) => subscope.id === "W3-CAREER-GUIDES"
    );
    if (!w3 || !articles || !careerGuides) {
      throw new Error("missing W3 rework reset fixture");
    }
    const approvalOutput = execFileSync(
      "node",
      [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", reworkApprovalPath],
      { cwd: ROOT, encoding: "utf8" }
    );
    expect(JSON.parse(approvalOutput)).toMatchObject({ ok: true, errors: [] });

    const invalidApproval = JSON.parse(
      fs.readFileSync(reworkApprovalPath, "utf8")
    ) as { w9_report_sha256: string };
    invalidApproval.w9_report_sha256 = "f".repeat(64);
    fs.writeFileSync(invalidApprovalPath, JSON.stringify(invalidApproval));
    let invalidOutput = "";
    try {
      execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", invalidApprovalPath],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
      );
    } catch (error) {
      invalidOutput = (error as { stdout?: string }).stdout ?? "";
    }
    expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
      "package rework reset W9 report SHA mismatch"
    );

    const checkedInApproval = JSON.parse(
      fs.readFileSync(reworkApprovalPath, "utf8")
    ) as {
      w9_report_ref: string;
      w9_report_sha256: string;
      w9_row_evidence_ref: string;
      w9_row_evidence_sha256: string;
      w9_frozen_ledger_ref: string;
      w9_frozen_ledger_sha256: string;
    };
    const checkedInReport = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_report_ref), "utf8")
    ) as {
      checks: Record<string, string>;
    };
    const checkedInRowEvidence = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_row_evidence_ref), "utf8")
    ) as {
      required_checks: Record<string, string>;
      permissions: Record<string, boolean>;
      row_reviews: Array<{
        row_id: string;
        source_identity: string;
        checks: Record<string, string>;
      }>;
    };
    const checkedInFrozenLedger = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_frozen_ledger_ref), "utf8")
    ) as {
      rows: Array<{
        row_id: string;
        source_identity: string;
      }>;
    };
    for (const failureMode of [
      "all aggregate and row checks PASS",
      "missing row evidence",
      "missing frozen ledger",
      "unique row identity drift",
      "row and projection double forgery",
      "row permission drift",
    ]) {
      const approval = structuredClone(checkedInApproval);
      const report = structuredClone(checkedInReport);
      const rowEvidence = structuredClone(checkedInRowEvidence);
      const frozenLedger = structuredClone(checkedInFrozenLedger);
      const reportPath = path.join(invalidW9Directory, `${failureMode.replaceAll(" ", "-")}-report.json`);
      const rowEvidencePath = path.join(
        invalidW9Directory,
        `${failureMode.replaceAll(" ", "-")}-row-evidence.json`
      );
      const frozenLedgerPath = path.join(
        invalidW9Directory,
        `${failureMode.replaceAll(" ", "-")}-frozen-ledger.json`
      );
      if (failureMode === "all aggregate and row checks PASS") {
        for (const check of Object.keys(report.checks)) {
          report.checks[check] = "PASS";
          rowEvidence.required_checks[check] = "PASS";
        }
        for (const rowReview of rowEvidence.row_reviews) {
          for (const check of Object.keys(rowReview.checks)) {
            rowReview.checks[check] = "PASS";
          }
        }
      } else if (failureMode === "unique row identity drift") {
        rowEvidence.row_reviews.at(-1)!.source_identity = "Article:999@revision:999";
      } else if (failureMode === "row and projection double forgery") {
        rowEvidence.row_reviews.forEach((rowReview, index) => {
          rowReview.row_id = `W3-FORGED-${String(index + 1).padStart(2, "0")}`;
          rowReview.source_identity = `Article:${900 + index}@revision:${1900 + index}`;
          frozenLedger.rows[index] = {
            row_id: rowReview.row_id,
            source_identity: rowReview.source_identity,
          };
        });
      } else if (failureMode === "row permission drift") {
        rowEvidence.permissions.production_import_authorized = true;
      }
      fs.writeFileSync(reportPath, JSON.stringify(report));
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      fs.writeFileSync(frozenLedgerPath, JSON.stringify(frozenLedger));
      approval.w9_report_ref = reportPath;
      approval.w9_report_sha256 = sha256AbsoluteFile(reportPath);
      approval.w9_row_evidence_ref =
        failureMode === "missing row evidence"
          ? path.join(invalidW9Directory, "missing-row-evidence.json")
          : rowEvidencePath;
      approval.w9_row_evidence_sha256 =
        failureMode === "missing row evidence"
          ? "0".repeat(64)
          : sha256AbsoluteFile(rowEvidencePath);
      if (failureMode === "missing frozen ledger") {
        approval.w9_frozen_ledger_ref = path.join(
          invalidW9Directory,
          "missing-frozen-ledger.json"
        );
        approval.w9_frozen_ledger_sha256 = "0".repeat(64);
      } else if (failureMode === "row and projection double forgery") {
        approval.w9_frozen_ledger_ref = frozenLedgerPath;
        approval.w9_frozen_ledger_sha256 = sha256AbsoluteFile(frozenLedgerPath);
      }
      fs.writeFileSync(invalidApprovalPath, JSON.stringify(approval));

      let blockerOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", invalidApprovalPath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        blockerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      const blockerErrors = (JSON.parse(blockerOutput) as { errors: string[] }).errors.join("\n");
      if (failureMode === "all aggregate and row checks PASS") {
        expect(blockerErrors).toContain(
          "package rework: W9 BLOCKED verdict requires at least one blocked QA check"
        );
      } else if (failureMode === "missing row evidence") {
        expect(blockerErrors).toContain("cannot verify package rework W9 evidence");
      } else if (failureMode === "missing frozen ledger") {
        expect(blockerErrors).toContain("cannot verify package rework W9 evidence");
      } else if (failureMode === "unique row identity drift") {
        expect(blockerErrors).toContain(
          "package rework W9 rows must exactly match the frozen ledger row ID and identity pairs"
        );
      } else if (failureMode === "row and projection double forgery") {
        expect(blockerErrors).toContain(
          "package rework frozen projection must exactly match the hashed source ledger"
        );
      } else {
        expect(blockerErrors).toContain(
          "$/package_rework_w9_row_evidence/permissions/production_import_authorized: permission must remain false"
        );
      }
    }

    w3.status = "inventory_frozen";
    w3.blocked_from_status = null;
    w3.blockers = [];
    articles.status = "package_in_progress";
    articles.blocked_from_status = null;
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    articles.blockers = [];
    w3.next_action =
      "Rebuild the complete W3-ARTICLES package, re-freeze it, and repeat fresh independent W9 QA.";
    fs.writeFileSync(reworkManifestPath, JSON.stringify(reworkManifest));

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", reworkManifestPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      expect(careerGuides).toMatchObject({
        status: "inventory_frozen",
        package_sha256: null,
        qa_report_ref: null,
        gate_lineage: [],
      });
      expect(Object.values(w3.permissions).every((value) => value === false)).toBe(true);
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(invalidApprovalDirectory, { recursive: true, force: true });
      fs.rmSync(invalidW9Directory, { recursive: true, force: true });
    }
  });

  it("rejects W9 PASS reports that review only a subset of the registered target", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-subset-"));
    const qaReportPath = path.join(tempDirectory, "independent-qa-report.json");
    const assets = manifest.assets.filter((entry) => entry.lane_id === "W1");
    if (assets.length < 2) {
      throw new Error("W1 subset fixture requires at least two assets");
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
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: null,
        package_sha256: "a".repeat(64),
        verdict: "PASS",
        reviewed_asset_ids: [assets[0].asset_id],
        reviewed_row_count: 0,
        checks: {
          language_naturalness: "PASS",
          chinese_leakage: "PASS",
          claim_boundary: "PASS",
          asset_duplication: "PASS",
          field_leakage: "PASS",
          page_api_alignment: "PASS",
        },
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", qaReportPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("QA report must review every registered target asset exactly once");
      expect(report.errors.join("\n")).toContain("QA report row count must cover the complete registered target");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("accepts qa_pass only with an exact-SHA external W9 PASS report", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-gate-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/"
    );
    const candidatePath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const qaAuthorityDirectory = makeW9QaDirectory();
    const controlApprovalDirectory = makeControlApprovalDirectory();
    const qaReportPath = path.join(qaAuthorityDirectory, "w9-independent-qa-report.json");
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    if (!w1) {
      throw new Error("missing W1 lane fixture");
    }
    w1.status = "package_frozen";
    let expectedTotal = 0;
    let currentTotal = 0;
    let remainingTotal = 0;
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.lane_id === "W1")
      .map((asset) => {
        const frozenAsset =
          asset.parity_state === "inventory_required"
            ? {
                ...asset,
                expected_en_count: 16,
                current_en_count: 0,
                remaining_en_count: 16,
                parity_state: "en_missing",
              }
            : asset;
        expectedTotal += frozenAsset.expected_en_count ?? 0;
        currentTotal += frozenAsset.current_en_count ?? 0;
        remainingTotal += frozenAsset.remaining_en_count ?? 0;
        return frozenAsset;
      });
    progressedManifest.assets = progressedManifest.assets.map(
      (asset) => frozenAssets.find((frozenAsset) => frozenAsset.asset_id === asset.asset_id) ?? asset
    );
    w1.counts = {
      cohort_count: frozenAssets.length,
      expected_en_assets: expectedTotal,
      current_en_assets: currentTotal,
      remaining_en_assets: remainingTotal,
      unknown_inventory_cohorts: 0,
    };

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
      subscope_id: null,
      package_id: "W1-w9-gate",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: frozenAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, frozenAssets);
    const frozenReportRef = path.join(packageDirectory, "source_ledger.json");
    w1.package_sha256 = packageEvidence.packageSha256;
    w1.qa_report_ref = null;
    w1.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W1",
        report_ref: frozenReportRef,
        report_sha256: packageEvidence.reportSha256,
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:00:00.000Z",
      },
    ];
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const qaChecks = {
      language_naturalness: "PASS",
      chinese_leakage: "PASS",
      claim_boundary: "PASS",
      asset_duplication: "PASS",
      field_leakage: "PASS",
      page_api_alignment: "PASS",
    };
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: null,
        package_sha256: packageEvidence.packageSha256,
        verdict: "PASS",
        reviewed_asset_ids: frozenAssets.map((asset) => asset.asset_id),
        reviewed_row_count: expectedTotal,
        checks: qaChecks,
        permissions,
      })
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-w9-gate",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "qa_pass",
        gate_evidence: {
          gate: "qa_pass",
          report_path: qaReportPath,
          report_sha256: sha256AbsoluteFile(qaReportPath),
          report_in_package: false,
          owner_lane_id: "W9",
          verdict: "PASS",
          asset_ids: frozenAssets.map((asset) => asset.asset_id),
          row_count: expectedTotal,
        },
        asset_updates: frozenAssets,
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          path.join(packageDirectory, "scope_manifest.json"),
          "--artifact",
          qaReportPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });

      const coLocatedQaReportPath = path.join(packageDirectory, "producer-authored-w9-report.json");
      fs.copyFileSync(qaReportPath, coLocatedQaReportPath);
      const coLocatedCandidate = JSON.parse(fs.readFileSync(candidatePath, "utf8")) as {
        gate_evidence: { report_path: string; report_sha256: string };
      };
      coLocatedCandidate.gate_evidence.report_path = coLocatedQaReportPath;
      coLocatedCandidate.gate_evidence.report_sha256 = sha256AbsoluteFile(coLocatedQaReportPath);
      fs.writeFileSync(candidatePath, JSON.stringify(coLocatedCandidate));
      let coLocatedOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        coLocatedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(coLocatedOutput).errors.join("\n")).toContain(
        "W9 QA report must reside inside the registered W9 authority directory"
      );

      w1.status = "qa_pass";
      w1.qa_report_ref = qaReportPath;
      w1.gate_lineage.push({
        status: "qa_pass",
        evidence_owner_lane_id: "W9",
        report_ref: qaReportPath,
        report_sha256: sha256AbsoluteFile(qaReportPath),
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:05:00.000Z",
      });
      fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

      const transitionReportPath = path.join(tempDirectory, "dry-run-gate-report.json");
      fs.writeFileSync(
        transitionReportPath,
        JSON.stringify({
          $schema: SCHEMA_PATH,
          artifact_kind: "transition_gate_report",
          schema_version: "fermatmind.en_content_parity_transition_gate_report.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          owner_lane_id: "W1",
          producer_lane_id: "W1",
          subscope_id: null,
          package_sha256: packageEvidence.packageSha256,
          gate: "dry_run_ready",
          verdict: "PASS",
          permissions,
        })
      );
      const dryRunCandidate = {
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-w9-gate",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "dry_run_ready",
        gate_evidence: {
          gate: "dry_run_ready",
          report_path: transitionReportPath,
          report_sha256: sha256AbsoluteFile(transitionReportPath),
          report_in_package: false,
          owner_lane_id: "W1",
          verdict: "PASS",
          asset_ids: frozenAssets.map((asset) => asset.asset_id),
          row_count: expectedTotal,
        },
        asset_updates: frozenAssets,
        permissions,
      };
      fs.writeFileSync(candidatePath, JSON.stringify(dryRunCandidate));
      const dryRunOutput = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(dryRunOutput)).toMatchObject({ ok: true, errors: [] });

      fs.writeFileSync(
        candidatePath,
        JSON.stringify({ ...dryRunCandidate, package_sha256: "b".repeat(64) })
      );
      let immutableOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        immutableOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(immutableOutput).errors.join("\n")).toContain(
        "package_frozen SHA is immutable for every later transition"
      );

      w1.status = "dry_run_ready";
      w1.gate_lineage.push({
        status: "dry_run_ready",
        evidence_owner_lane_id: "W1",
        report_ref: transitionReportPath,
        report_sha256: sha256AbsoluteFile(transitionReportPath),
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:10:00.000Z",
      });
      fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

      const approvalPath = path.join(controlApprovalDirectory, "draft-import-approval.json");
      fs.writeFileSync(
        approvalPath,
        JSON.stringify({
          $schema: SCHEMA_PATH,
          artifact_kind: "controlled_transition_approval",
          schema_version: "fermatmind.en_content_parity_controlled_transition_approval.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          approval_owner: "human_operator",
          approval_ref: "operator-approval:test-fixture",
          producer_lane_id: "W1",
          subscope_id: null,
          package_sha256: packageEvidence.packageSha256,
          gate: "draft_imported",
          verdict: "APPROVED",
          permissions,
        })
      );
      const draftImportCandidate = {
        ...dryRunCandidate,
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        proposed_status: "draft_imported",
        gate_evidence: {
          ...dryRunCandidate.gate_evidence,
          gate: "draft_imported",
          report_path: approvalPath,
          report_sha256: sha256AbsoluteFile(approvalPath),
          owner_lane_id: "CONTROL",
          verdict: "APPROVED",
        },
      };
      fs.writeFileSync(candidatePath, JSON.stringify(draftImportCandidate));
      const coLocatedApprovalPath = path.join(packageDirectory, "producer-authored-control-approval.json");
      fs.copyFileSync(approvalPath, coLocatedApprovalPath);
      fs.writeFileSync(
        candidatePath,
        JSON.stringify({
          ...draftImportCandidate,
          gate_evidence: {
            ...draftImportCandidate.gate_evidence,
            report_path: coLocatedApprovalPath,
            report_sha256: sha256AbsoluteFile(coLocatedApprovalPath),
          },
        })
      );
      let coLocatedApprovalOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        coLocatedApprovalOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(coLocatedApprovalOutput).errors.join("\n")).toContain(
        "controlled transition approval must reside inside the registered CONTROL authority directory"
      );

      fs.writeFileSync(candidatePath, JSON.stringify(draftImportCandidate));
      const controlledOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          approvalPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(controlledOutput)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(qaAuthorityDirectory, { recursive: true, force: true });
      fs.rmSync(controlApprovalDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory, [
        "producer-authored-w9-report.json",
        "producer-authored-control-approval.json",
      ]);
    }
  });

  it("uses the same Schema to validate a lane package and candidate master patch", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-"));
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/"
    );
    const packagePath = path.join(packageDirectory, "scope_manifest.json");
    const patchPath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
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
      subscope_id: null,
      package_id: "W1-contract-sample",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: inventoryAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, inventoryAssets);
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-contract-sample",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
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

      const invalidEmbeddedScope = JSON.parse(fs.readFileSync(packagePath, "utf8")) as Record<string, unknown>;
      delete invalidEmbeddedScope.permissions;
      fs.writeFileSync(packagePath, JSON.stringify(invalidEmbeddedScope));
      let invalidEmbeddedOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        invalidEmbeddedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidEmbeddedOutput).errors.join("\n")).toContain(
        "embedded scope manifest Schema error"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
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
      subscope_id: "W3-ARTICLES",
      package_id: "W3-ARTICLES-contract-sample",
      status: "package_in_progress",
      output_directory: outputDirectory,
      artifact_files: ARTIFACT_FILES,
      assets: [articleAsset],
      permissions,
    });
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W3-editorial-cms/articles/"
    );
    const validPackagePath = path.join(packageDirectory, "scope_manifest.json");
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
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("uses independent W3 states while preserving the Article-before-CareerGuide sequence", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-states-"));
    const bootstrapManifest = structuredClone(manifest);
    const bootstrapW3 = bootstrapManifest.lanes.find((lane) => lane.lane_id === "W3");
    if (!bootstrapW3) {
      throw new Error("missing W3 bootstrap fixture");
    }
    bootstrapW3.status = "inventory_frozen";
    bootstrapW3.blocked_from_status = null;
    for (const subscope of bootstrapW3.subscopes) {
      subscope.status = "inventory_frozen";
      subscope.blocked_from_status = null;
      subscope.package_sha256 = null;
      subscope.qa_report_ref = null;
      subscope.gate_lineage = [];
      subscope.blockers = [];
    }
    const bootstrapManifestPath = path.join(tempRoot, "bootstrap-master.json");
    fs.writeFileSync(bootstrapManifestPath, JSON.stringify(bootstrapManifest));
    const bootstrapManifestSha256 = sha256AbsoluteFile(bootstrapManifestPath);
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const cases = [
      {
        subscopeId: "W3-ARTICLES",
        assetId: "ENPARITY-W3-ARTICLES",
        outputDirectory: "generated/en-content-parity/W3-editorial-cms/articles/",
      },
      {
        subscopeId: "W3-CAREER-GUIDES",
        assetId: "ENPARITY-W3-CAREER-GUIDES",
        outputDirectory: "generated/en-content-parity/W3-editorial-cms/career-guides/",
      },
    ];
    const artifactPathsBySubscope = new Map<string, string[]>();
    const packageDirectories: string[] = [];

    try {
      for (const entry of cases) {
        const asset = manifest.assets.find((candidate) => candidate.asset_id === entry.assetId);
        if (!asset) {
          throw new Error(`missing ${entry.assetId} fixture`);
        }
        const tempDirectory = makeRegisteredPackageDirectory(entry.outputDirectory);
        packageDirectories.push(tempDirectory);
        const packageId = `${entry.subscopeId}-contract-sample`;
        const scopeManifest = {
          $schema: SCHEMA_PATH,
          artifact_kind: "lane_package",
          schema_version: "fermatmind.en_content_parity_lane_package.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          lane_id: "W3",
          subscope_id: entry.subscopeId,
          package_id: packageId,
          status: "package_in_progress",
          output_directory: entry.outputDirectory,
          artifact_files: ARTIFACT_FILES,
          assets: [asset],
          permissions,
        };
        const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [asset]);
        const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
        fs.writeFileSync(
          patchPath,
          JSON.stringify({
            $schema: SCHEMA_PATH,
            artifact_kind: "master_manifest_patch_candidate",
            schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
            control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
            lane_id: "W3",
            subscope_id: entry.subscopeId,
            package_id: packageId,
            base_manifest_sha256: bootstrapManifestSha256,
            sha256_manifest_path: packageEvidence.shaManifestPath,
            package_sha256: packageEvidence.packageSha256,
            proposed_status: "package_in_progress",
            gate_evidence: {
              gate: "package_in_progress",
              report_path: "source_ledger.json",
              report_sha256: packageEvidence.reportSha256,
              report_in_package: true,
              owner_lane_id: "W3",
              verdict: null,
              asset_ids: [asset.asset_id],
              row_count: asset.expected_en_count ?? 0,
            },
            asset_updates: [asset],
            permissions,
          })
        );
        artifactPathsBySubscope.set(entry.subscopeId, [path.join(tempDirectory, "scope_manifest.json"), patchPath]);
      }

      const articleArguments = (artifactPathsBySubscope.get("W3-ARTICLES") ?? []).flatMap((artifactPath) => [
        "--artifact",
        artifactPath,
      ]);
      const articleOutput = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", bootstrapManifestPath, ...articleArguments],
        {
          cwd: ROOT,
          encoding: "utf8",
        }
      );
      expect(JSON.parse(articleOutput)).toMatchObject({ ok: true, errors: [] });

      const careerArguments = (artifactPathsBySubscope.get("W3-CAREER-GUIDES") ?? []).flatMap(
        (artifactPath) => ["--artifact", artifactPath]
      );
      let careerOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", bootstrapManifestPath, ...careerArguments],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        careerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(careerOutput).errors.join("\n")).toContain(
        "predecessor W3-ARTICLES must reach package_frozen before this subscope starts"
      );

      const blockedPredecessorManifest = structuredClone(bootstrapManifest);
      const blockedW3 = blockedPredecessorManifest.lanes.find((lane) => lane.lane_id === "W3");
      const blockedArticles = blockedW3?.subscopes.find(
        (subscope) => subscope.id === "W3-ARTICLES"
      );
      if (!blockedW3 || !blockedArticles) {
        throw new Error("missing blocked W3 predecessor fixture");
      }
      blockedW3.status = "blocked";
      blockedW3.blocked_from_status = "inventory_frozen";
      blockedArticles.status = "blocked";
      blockedArticles.blocked_from_status = "package_frozen";
      blockedArticles.package_sha256 = "a".repeat(64);
      blockedArticles.gate_lineage = [
        {
          status: "package_frozen",
          evidence_owner_lane_id: "W3",
          report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
          report_sha256: "b".repeat(64),
          package_sha256: "a".repeat(64),
          accepted_at: "2026-07-30T12:00:00.000Z",
        },
      ];
      const blockedPredecessorManifestPath = path.join(
        tempRoot,
        "blocked-predecessor-master.json"
      );
      fs.writeFileSync(
        blockedPredecessorManifestPath,
        JSON.stringify(blockedPredecessorManifest)
      );
      const careerCandidatePath = (
        artifactPathsBySubscope.get("W3-CAREER-GUIDES") ?? []
      )[1];
      if (!careerCandidatePath) {
        throw new Error("missing W3 Career Guide candidate fixture");
      }
      const careerCandidate = JSON.parse(
        fs.readFileSync(careerCandidatePath, "utf8")
      ) as { base_manifest_sha256: string };
      careerCandidate.base_manifest_sha256 = sha256AbsoluteFile(
        blockedPredecessorManifestPath
      );
      fs.writeFileSync(careerCandidatePath, JSON.stringify(careerCandidate));
      const blockedPredecessorOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          blockedPredecessorManifestPath,
          "--artifact",
          careerCandidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(blockedPredecessorOutput)).toMatchObject({
        ok: true,
        errors: [],
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      for (const packageDirectory of packageDirectories) {
        cleanupRegisteredPackageDirectory(packageDirectory);
      }
    }
  });

  it("preserves inventory counts after inventory_frozen", () => {
    const tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-parity-control-frozen-counts-")
    );
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/"
    );
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    if (!w1) {
      throw new Error("missing W1 frozen inventory fixture");
    }
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.lane_id === "W1")
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
    progressedManifest.assets = progressedManifest.assets.map(
      (asset) =>
        frozenAssets.find((frozenAsset) => frozenAsset.asset_id === asset.asset_id) ??
        asset
    );
    w1.status = "inventory_frozen";
    w1.counts = {
      cohort_count: frozenAssets.length,
      expected_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.expected_en_count ?? 0),
        0
      ),
      current_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.current_en_count ?? 0),
        0
      ),
      remaining_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.remaining_en_count ?? 0),
        0
      ),
      unknown_inventory_cohorts: 0,
    };
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    const changedAssets = frozenAssets.map((asset, index) =>
      index === 0
        ? {
            ...asset,
            expected_en_count: (asset.expected_en_count ?? 0) + 1,
            remaining_en_count: (asset.remaining_en_count ?? 0) + 1,
          }
        : asset
    );
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
      subscope_id: null,
      package_id: "W1-frozen-count-drift",
      status: "package_in_progress",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: changedAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(
      packageDirectory,
      scopeManifest,
      changedAssets
    );
    const candidatePath = path.join(
      packageDirectory,
      "master_manifest_patch.candidate.json"
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-frozen-count-drift",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "package_in_progress",
        gate_evidence: {
          gate: "package_in_progress",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: changedAssets.map((asset) => asset.asset_id),
          row_count: changedAssets.reduce(
            (total, asset) => total + (asset.expected_en_count ?? 0),
            0
          ),
        },
        asset_updates: changedAssets,
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            progressedManifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const errors = (JSON.parse(output) as { errors: string[] }).errors.join("\n");
      expect(errors).toContain(
        "frozen inventory count expected_en_count cannot change after inventory_frozen"
      );
      expect(errors).toContain(
        "frozen inventory count remaining_en_count cannot change after inventory_frozen"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("requires the transition-specific in-package gate report semantics", () => {
    const tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-parity-control-package-gate-")
    );
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/"
    );
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    if (!w1) {
      throw new Error("missing W1 package gate fixture");
    }
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.lane_id === "W1")
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
    progressedManifest.assets = progressedManifest.assets.map(
      (asset) =>
        frozenAssets.find((frozenAsset) => frozenAsset.asset_id === asset.asset_id) ??
        asset
    );
    w1.status = "package_in_progress";
    w1.counts = {
      cohort_count: frozenAssets.length,
      expected_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.expected_en_count ?? 0),
        0
      ),
      current_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.current_en_count ?? 0),
        0
      ),
      remaining_en_assets: frozenAssets.reduce(
        (total, asset) => total + (asset.remaining_en_count ?? 0),
        0
      ),
      unknown_inventory_cohorts: 0,
    };
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
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
      subscope_id: null,
      package_id: "W1-package-gate",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: frozenAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(
      packageDirectory,
      scopeManifest,
      frozenAssets
    );
    const candidatePath = path.join(
      packageDirectory,
      "master_manifest_patch.candidate.json"
    );
    const expectedRowCount = frozenAssets.reduce(
      (total, asset) => total + (asset.expected_en_count ?? 0),
      0
    );
    const candidate = {
      $schema: SCHEMA_PATH,
      artifact_kind: "master_manifest_patch_candidate",
      schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: null,
      package_id: "W1-package-gate",
      base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
      sha256_manifest_path: packageEvidence.shaManifestPath,
      package_sha256: packageEvidence.packageSha256,
      proposed_status: "package_frozen",
      gate_evidence: {
        gate: "package_frozen",
        report_path: "handoff.md",
        report_sha256: sha256AbsoluteFile(path.join(packageDirectory, "handoff.md")),
        report_in_package: true,
        owner_lane_id: "W1",
        verdict: null,
        asset_ids: frozenAssets.map((asset) => asset.asset_id),
        row_count: expectedRowCount,
      },
      asset_updates: frozenAssets,
      permissions,
    };
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      let invalidOutput = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            progressedManifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        invalidOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
        "package_frozen evidence must use editorial_review.json"
      );

      candidate.gate_evidence.report_path = "editorial_review.json";
      candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(
        path.join(packageDirectory, "editorial_review.json")
      );
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      const validOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(validOutput)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
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
      subscope_id: null,
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
        subscope_id: null,
        package_id: "W1-invalid-contract-sample",
        base_manifest_sha256: "0".repeat(64),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "published",
        gate_evidence: {
          gate: "published",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
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
      expect(report.errors.join("\n")).toContain(
        "package files must reside directly inside the registered output directory"
      );
      expect(report.errors.join("\n")).toContain("base_manifest_sha256 must match the current master manifest");
      expect(report.errors.join("\n")).toContain("proposed_status must be blocked or the immediate next state inventory_frozen");
      expect(report.errors.join("\n")).toContain("asset IDs must be unique");
      expect(report.errors.join("\n")).toContain("translation groups must be unique");
      expect(report.errors.join("\n")).toContain("expected count must equal current plus remaining");
      expect(report.errors.join("\n")).toContain("protected field authority_source cannot change from the master registry");
      expect(report.errors.join("\n")).toContain("controlled transition evidence owner must be CONTROL");
      expect(report.errors.join("\n")).toContain(
        "controlled transition approval must remain outside the immutable package"
      );
      expect(report.errors.join("\n")).toContain("controlled transition verdict must be APPROVED");
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
      subscope_id: null,
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
        subscope_id: null,
        package_id: "W1-empty-inventory",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
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

  it("rejects inventory evidence whose hashed payload does not match the candidate", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-unrelated-inventory-"));
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
      subscope_id: null,
      package_id: "W1-unrelated-inventory",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: inventoryAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, inventoryAssets, []);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-unrelated-inventory",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: inventoryAssets.map((asset) => asset.asset_id),
          row_count: inventoryAssets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0),
        },
        asset_updates: inventoryAssets,
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
      expect(report.errors.join("\n")).toContain("assets.jsonl must exactly match candidate asset_updates");
      expect(report.errors.join("\n")).toContain("source ledger row count must match gate evidence");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a producer-authored qa_pass without an independent W9 verdict", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-self-qa-"));
    const asset = manifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const unregisteredAsset = {
      ...asset,
      asset_id: "ENPARITY-W1-UNREGISTERED",
      translation_group: "en-parity:w1:unregistered",
    };
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
      subscope_id: null,
      package_id: "W1-self-qa",
      status: "qa_pass",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [unregisteredAsset],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [unregisteredAsset]);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-self-qa",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "qa_pass",
        gate_evidence: {
          gate: "qa_pass",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: [unregisteredAsset.asset_id],
          row_count: asset.expected_en_count ?? 0,
        },
        asset_updates: [unregisteredAsset],
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
      expect(report.errors.join("\n")).toContain("qa_pass evidence owner must be W9");
      expect(report.errors.join("\n")).toContain("W9 QA report must remain independent");
      expect(report.errors.join("\n")).toContain("qa_pass evidence verdict must be PASS");
      expect(report.errors.join("\n")).toContain(
        "candidate assets must exactly match the complete registered target"
      );
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
      subscope_id: null,
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
        subscope_id: null,
        package_id: "W1-tampered-package",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "blocked",
        gate_evidence: {
          gate: "blocked",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
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
